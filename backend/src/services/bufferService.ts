import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface BufferCalculation {
  originalDuration: number;
  bufferTime: number;
  totalDuration: number;
  bufferPercentage: number;
  reasoning: string;
}

export class BufferService {
  /**
   * Calculate adaptive buffer time based on historical user performance
   * Returns: buffer time in minutes
   */
  static async calculateAdaptiveBuffer(
    userId: number,
    categoryId?: number,
    estimatedDuration: number = 30,
  ): Promise<BufferCalculation> {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      // Query execution logs for this category in last 30 days
      const executionLogs = await prisma.executionLog.findMany({
        where: {
          schedule: {
            task: {
              userId,
              ...(categoryId && { categoryId }),
            },
          },
          createdAt: { gte: last30Days },
          actualEnd: { not: null },
        },
        include: {
          schedule: {
            include: { task: true },
          },
        },
      });

      if (executionLogs.length < 3) {
        // Not enough data, use default 15% buffer
        const bufferTime = Math.ceil(estimatedDuration * 0.15);
        return {
          originalDuration: estimatedDuration,
          bufferTime,
          totalDuration: estimatedDuration + bufferTime,
          bufferPercentage: 15,
          reasoning: "Insufficient historical data, using default 15% buffer",
        };
      }

      // Calculate delay percentage from historical data
      let totalDelayMinutes = 0;
      let delayCount = 0;

      executionLogs.forEach((log) => {
        if (log.actualEnd && log.schedule.endTime) {
          const delayMs =
            log.actualEnd.getTime() - log.schedule.endTime.getTime();
          const delayMinutes = Math.max(0, delayMs / (1000 * 60));
          totalDelayMinutes += delayMinutes;
          if (delayMinutes > 0) {
            delayCount++;
          }
        }
      });

      const avgDelayPercentage = (delayCount / executionLogs.length) * 100;
      const avgDelayMinutes = totalDelayMinutes / executionLogs.length;

      // Calculate buffer as percentage of estimated duration
      // Min 10%, Max 50% of original duration
      const bufferPercentage = Math.min(
        50,
        Math.max(10, avgDelayPercentage + 10),
      );
      const bufferTime = Math.ceil(
        (estimatedDuration * bufferPercentage) / 100,
      );

      // Store calculation for analytics
      await this.recordBufferCalculation(
        userId,
        categoryId,
        bufferPercentage,
        avgDelayPercentage,
      );

      return {
        originalDuration: estimatedDuration,
        bufferTime,
        totalDuration: estimatedDuration + bufferTime,
        bufferPercentage,
        reasoning: `Based on ${executionLogs.length} historical tasks: avg delay ${avgDelayPercentage.toFixed(1)}%, applying ${bufferPercentage.toFixed(1)}% buffer`,
      };
    } catch (error) {
      console.error("Error calculating adaptive buffer:", error);
      // Fallback to 15% buffer
      const bufferTime = Math.ceil(estimatedDuration * 0.15);
      return {
        originalDuration: estimatedDuration,
        bufferTime,
        totalDuration: estimatedDuration + bufferTime,
        bufferPercentage: 15,
        reasoning: "Error in calculation, using default buffer",
      };
    }
  }

  /**
   * Apply buffer to schedule
   */
  static async applyBufferToSchedule(
    scheduleId: number,
    userId: number,
  ): Promise<any> {
    try {
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { task: true },
      });

      if (!schedule || schedule.task.userId !== userId) {
        throw new Error("Schedule not found or unauthorized");
      }

      // Calculate buffer
      const buffer = await this.calculateAdaptiveBuffer(
        userId,
        schedule.task.categoryId || undefined,
        schedule.task.estimatedDuration || 30,
      );

      // Update schedule with buffer
      const updatedSchedule = await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          bufferApplied: buffer.bufferTime,
          endTime: new Date(
            schedule.endTime.getTime() + buffer.bufferTime * 60 * 1000,
          ),
        },
        include: { task: true },
      });

      return {
        schedule: updatedSchedule,
        buffer,
        newEndTime: updatedSchedule.endTime,
      };
    } catch (error) {
      console.error("Error applying buffer to schedule:", error);
      throw error;
    }
  }

  /**
   * Optimize all schedules for a user (Panic Mode)
   * Removes non-important tasks and buffers critical ones
   */
  static async optimizeSchedulesForPanicMode(userId: number): Promise<any> {
    try {
      // Get all pending/in-progress schedules
      const schedules = await prisma.schedule.findMany({
        where: {
          task: { userId },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        include: { task: true },
        orderBy: { startTime: "asc" },
      });

      const now = new Date();
      const optimization = {
        cancelled: 0,
        buffered: 0,
        rescheduled: 0,
        criticalTasks: [] as any[],
      };

      for (const schedule of schedules) {
        // If task is overdue
        if (schedule.endTime < now) {
          // Cancel non-important tasks
          if (
            schedule.task.priorityQuadrant === "URGENT_NOT_IMPORTANT" ||
            schedule.task.priorityQuadrant === "NOT_URGENT_NOT_IMPORTANT"
          ) {
            await prisma.schedule.update({
              where: { id: schedule.id },
              data: { status: "CANCELLED", panicModeFlag: true },
            });
            optimization.cancelled++;
          }
          // Keep important tasks
          else if (schedule.task.priorityQuadrant === "URGENT_IMPORTANT") {
            optimization.criticalTasks.push({
              id: schedule.task.id,
              title: schedule.task.title,
              priority: schedule.task.priorityScore,
            });
          }
        }
      }

      // Apply buffer to critical tasks
      for (const critical of optimization.criticalTasks) {
        const schedules = await prisma.schedule.findMany({
          where: { taskId: critical.id, status: "IN_PROGRESS" },
        });
        for (const schedule of schedules) {
          await this.applyBufferToSchedule(schedule.id, userId);
          optimization.buffered++;
        }
      }

      return optimization;
    } catch (error) {
      console.error("Error optimizing schedules for panic mode:", error);
      throw error;
    }
  }

  /**
   * Get buffer statistics for user
   */
  static async getBufferStatistics(userId: number) {
    try {
      const schedules = await prisma.schedule.findMany({
        where: { task: { userId } },
        include: { task: true },
      });

      const stats = {
        totalSchedules: schedules.length,
        totalBufferApplied: 0,
        averageBuffer: 0,
        tasksByBufferRange: {
          noBuffer: 0,
          small: 0, // 1-15 min
          medium: 0, // 15-30 min
          large: 0, // 30+ min
        },
      };

      schedules.forEach((schedule) => {
        const buffer = schedule.bufferApplied || 0;
        stats.totalBufferApplied += buffer;

        if (buffer === 0) stats.tasksByBufferRange.noBuffer++;
        else if (buffer <= 15) stats.tasksByBufferRange.small++;
        else if (buffer <= 30) stats.tasksByBufferRange.medium++;
        else stats.tasksByBufferRange.large++;
      });

      stats.averageBuffer =
        schedules.length > 0 ? stats.totalBufferApplied / schedules.length : 0;

      return stats;
    } catch (error) {
      console.error("Error getting buffer statistics:", error);
      return null;
    }
  }

  /**
   * Record buffer calculation for analytics
   */
  private static async recordBufferCalculation(
    userId: number,
    categoryId: number | undefined,
    appliedBuffer: number,
    actualDelayPercentage: number,
  ) {
    try {
      // This can be extended to store in a separate analytics table
      console.log(
        `Buffer calculated for user ${userId}: applied ${appliedBuffer}%, actual delay was ${actualDelayPercentage}%`,
      );
    } catch (error) {
      console.error("Error recording buffer calculation:", error);
    }
  }
}
