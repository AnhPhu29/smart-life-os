import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /analytics/overview - Get overview stats
router.get("/overview", authenticate, async (req: AuthRequest, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total tasks
    const totalTasks = await prisma.task.count({
      where: { userId: req.user.id },
    });

    // Completed tasks in last 30 days
    const completedTasks = await prisma.executionLog.count({
      where: {
        schedule: {
          task: { userId: req.user.id },
        },
        actualStart: { gte: thirtyDaysAgo },
      },
    });

    // Pending schedules
    const pendingSchedules = await prisma.schedule.count({
      where: {
        task: { userId: req.user.id },
        status: "PENDING",
      },
    });

    // Average efficiency
    const efficiencyLogs = await prisma.executionLog.findMany({
      where: {
        schedule: {
          task: { userId: req.user.id },
        },
        actualStart: { gte: thirtyDaysAgo },
      },
      select: { efficiencyRate: true },
    });

    const avgEfficiency =
      efficiencyLogs.length > 0
        ? Math.round(
            efficiencyLogs.reduce(
              (sum, log) =>
                sum +
                (log.efficiencyRate
                  ? parseFloat(log.efficiencyRate.toString())
                  : 0),
              0,
            ) / efficiencyLogs.length,
          )
        : 0;

    res.json({
      totalTasks,
      completedTasks,
      pendingSchedules,
      avgEfficiency,
      period: "30 days",
    });
  } catch (err) {
    console.error("Error fetching overview:", err);
    res.status(500).json({ message: "Error fetching overview" });
  }
});

// GET /analytics/weekly - Get weekly efficiency trend
router.get("/weekly", authenticate, async (req: AuthRequest, res) => {
  try {
    const weeklyData = [];
    const today = new Date();

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const logs = await prisma.executionLog.findMany({
        where: {
          schedule: {
            task: { userId: req.user.id },
          },
          actualStart: {
            gte: date,
            lt: nextDate,
          },
        },
        select: { efficiencyRate: true },
      });

      const avgEfficiency =
        logs.length > 0
          ? Math.round(
              logs.reduce(
                (sum, log) =>
                  sum +
                  (log.efficiencyRate
                    ? parseFloat(log.efficiencyRate.toString())
                    : 0),
                0,
              ) / logs.length,
            )
          : 0;

      weeklyData.push({
        day: date.toLocaleDateString("vi-VN", { weekday: "short" }),
        efficiency: avgEfficiency,
        tasks: logs.length,
      });
    }

    res.json(weeklyData);
  } catch (err) {
    console.error("Error fetching weekly data:", err);
    res.status(500).json({ message: "Error fetching weekly data" });
  }
});

// GET /analytics/category-performance - Get performance by category
router.get(
  "/category-performance",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const categories = await prisma.category.findMany({
        where: { userId: req.user.id },
        select: { id: true, name: true },
      });

      const categoryData = await Promise.all(
        categories.map(async (category) => {
          const logs = await prisma.executionLog.findMany({
            where: {
              schedule: {
                task: {
                  userId: req.user.id,
                  categoryId: category.id,
                },
              },
            },
            select: { efficiencyRate: true },
          });

          const avgEfficiency =
            logs.length > 0
              ? Math.round(
                  logs.reduce(
                    (sum, log) =>
                      sum +
                      (log.efficiencyRate
                        ? parseFloat(log.efficiencyRate.toString())
                        : 0),
                    0,
                  ) / logs.length,
                )
              : 0;

          return {
            category: category.name,
            efficiency: avgEfficiency,
            tasksCompleted: logs.length,
          };
        }),
      );

      res.json(categoryData);
    } catch (err) {
      console.error("Error fetching category performance:", err);
      res.status(500).json({ message: "Error fetching category performance" });
    }
  },
);

// GET /analytics/completion-rate - Get task completion rate
router.get("/completion-rate", authenticate, async (req: AuthRequest, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalSchedules = await prisma.schedule.count({
      where: {
        task: { userId: req.user.id },
        startTime: { gte: thirtyDaysAgo },
      },
    });

    const completedSchedules = await prisma.schedule.count({
      where: {
        task: { userId: req.user.id },
        status: "COMPLETED",
        startTime: { gte: thirtyDaysAgo },
      },
    });

    const completionRate =
      totalSchedules > 0
        ? Math.round((completedSchedules / totalSchedules) * 100)
        : 0;

    res.json({
      total: totalSchedules,
      completed: completedSchedules,
      completionRate,
      period: "30 days",
    });
  } catch (err) {
    console.error("Error fetching completion rate:", err);
    res.status(500).json({ message: "Error fetching completion rate" });
  }
});

// GET /analytics/quadrant-distribution - Get task distribution by quadrant
router.get(
  "/quadrant-distribution",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const quadrants = [
        "URGENT_IMPORTANT",
        "NOT_URGENT_IMPORTANT",
        "URGENT_NOT_IMPORTANT",
        "NOT_URGENT_NOT_IMPORTANT",
      ];

      const quadrantData = await Promise.all(
        quadrants.map(async (quadrant) => {
          const count = await prisma.task.count({
            where: {
              userId: req.user.id,
              priorityQuadrant: quadrant as any,
            },
          });

          const labels: Record<string, string> = {
            URGENT_IMPORTANT: "Cấp bách & Quan trọng",
            NOT_URGENT_IMPORTANT: "Không cấp bách, Quan trọng",
            URGENT_NOT_IMPORTANT: "Cấp bách, Không quan trọng",
            NOT_URGENT_NOT_IMPORTANT: "Không cấp bách, Không quan trọng",
          };

          return {
            name: labels[quadrant],
            value: count,
          };
        }),
      );

      res.json(quadrantData.filter((q) => q.value > 0));
    } catch (err) {
      console.error("Error fetching quadrant distribution:", err);
      res.status(500).json({ message: "Error fetching quadrant distribution" });
    }
  },
);

// GET /analytics/buffer-effectiveness - Get buffer effectiveness stats
router.get(
  "/buffer-effectiveness",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const schedulesWithBuffer = await prisma.schedule.findMany({
        where: {
          task: { userId: req.user.id },
          bufferApplied: { gt: 0 },
        },
        include: {
          executionLogs: true,
        },
      });

      const withBufferSuccess = schedulesWithBuffer.filter((s) =>
        s.executionLogs.some(
          (log) =>
            log.efficiencyRate &&
            parseFloat(log.efficiencyRate.toString()) >= 80,
        ),
      ).length;

      const bufferEffectiveness =
        schedulesWithBuffer.length > 0
          ? Math.round((withBufferSuccess / schedulesWithBuffer.length) * 100)
          : 0;

      res.json({
        totalWithBuffer: schedulesWithBuffer.length,
        successfulWithBuffer: withBufferSuccess,
        effectiveness: bufferEffectiveness,
      });
    } catch (err) {
      console.error("Error fetching buffer effectiveness:", err);
      res.status(500).json({ message: "Error fetching buffer effectiveness" });
    }
  },
);

export default router;
