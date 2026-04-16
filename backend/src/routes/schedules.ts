import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { PrismaClient, Prisma } from "@prisma/client";
import { BufferService } from "../services/bufferService";
import { NotificationService } from "../services/notificationService";

const router = Router();
const prisma = new PrismaClient();

// Declare global io for socket emissions
declare global {
  var io: any;
}

// GET /schedules/stats/buffers - must come BEFORE /:id routes
router.get("/stats/buffers", authenticate, async (req: AuthRequest, res) => {
  try {
    const stats = await BufferService.getBufferStatistics(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error("Error getting buffer statistics:", err);
    res.status(500).json({ message: "Error getting statistics" });
  }
});

// POST /schedules/panic-mode/activate - must come BEFORE /:id routes
router.post(
  "/panic-mode/activate",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const optimization = await BufferService.optimizeSchedulesForPanicMode(
        req.user.id,
      );

      // Send notification
      if (req.user.email) {
        await NotificationService.sendPanicModeActivatedNotification(
          req.user.email,
          optimization.cancelled,
          optimization.buffered,
          "EMAIL",
        );
      }

      // Emit real-time event to user for all affected schedules
      if (globalThis.io) {
        globalThis.io
          .to(`user-${req.user.id}`)
          .emit("schedules:panic-mode-activated", optimization);
      }

      res.json({
        message: "Panic mode activated",
        optimization,
      });
    } catch (err) {
      console.error("Error activating panic mode:", err);
      res.status(500).json({ message: "Error activating panic mode" });
    }
  },
);

// POST /schedules
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { taskId, startTime, endTime, applyBuffer } = req.body;

    // Verify task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { category: true },
    });
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }

    let schedule = await prisma.schedule.create({
      data: {
        taskId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "PENDING",
      },
      include: { task: true },
    });

    // Apply adaptive buffer if requested
    if (applyBuffer) {
      const result = await BufferService.applyBufferToSchedule(
        schedule.id,
        req.user.id,
      );
      schedule = result.schedule;
    }

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io
        .to(`user-${req.user.id}`)
        .emit("schedule:created", schedule);
    }

    res.status(201).json(schedule);
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ message: "Error creating schedule" });
  }
});

// GET /schedules
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ message: "Missing date range" });

    const schedules = await prisma.schedule.findMany({
      where: {
        task: { userId: req.user.id },
        startTime: { gte: new Date(start as string) },
        endTime: { lte: new Date(end as string) },
      },
      include: { task: true },
      orderBy: { startTime: "asc" },
    });

    res.json(schedules);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ message: "Error fetching schedules" });
  }
});

// POST /schedules/:id/apply-buffer
router.post(
  "/:id/apply-buffer",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const result = await BufferService.applyBufferToSchedule(
        scheduleId,
        req.user.id,
      );
      res.json(result);
    } catch (err) {
      console.error("Error applying buffer:", err);
      res.status(500).json({ message: "Error applying buffer" });
    }
  },
);

// POST /schedules/:id/complete
router.post("/:id/complete", authenticate, async (req: AuthRequest, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { actualStart, actualEnd, notes } = req.body;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { task: { include: { category: true } } },
    });

    if (!schedule || schedule.task.userId !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }

    const actualStartDate = new Date(actualStart);
    const actualEndDate = new Date(actualEnd);
    const expectedDuration =
      (schedule.endTime.getTime() - schedule.startTime.getTime()) / 1000 / 60;
    const actualDuration =
      (actualEndDate.getTime() - actualStartDate.getTime()) / 1000 / 60;
    const efficiencyRate = Math.round(
      (expectedDuration / actualDuration) * 100,
    );

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: "COMPLETED" },
    });

    // Create execution log for AI tracking
    const executionLog = await prisma.executionLog.create({
      data: {
        scheduleId,
        actualStart: actualStartDate,
        actualEnd: actualEndDate,
        efficiencyRate: new Prisma.Decimal(
          Math.max(0, Math.min(100, efficiencyRate)),
        ),
        notes: notes || null,
      },
    });

    // Update AI metrics
    if (schedule.task.categoryId) {
      await prisma.aiMetric.upsert({
        where: {
          userId_categoryId: {
            userId: req.user.id,
            categoryId: schedule.task.categoryId,
          },
        },
        create: {
          userId: req.user.id,
          categoryId: schedule.task.categoryId,
          avgDelayPercentage: new Prisma.Decimal(0),
          totalTasksAnalyzed: 1,
        },
        update: {
          totalTasksAnalyzed: { increment: 1 },
        },
      });
    }

    // Send completion notification
    if (req.user.email) {
      await NotificationService.sendTaskCompletedNotification(
        req.user.email,
        schedule.task.title,
        efficiencyRate,
        "EMAIL",
      );
    }

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("schedule:updated", updated);
      globalThis.io
        .to(`user-${req.user.id}`)
        .emit("stats:updated", { efficiency: efficiencyRate });
    }

    res.json({
      schedule: updated,
      executionLog,
      efficiency: efficiencyRate,
    });
  } catch (err) {
    console.error("Error completing schedule:", err);
    res.status(500).json({ message: "Error completing schedule" });
  }
});

// POST /schedules/:id/delay
router.post("/:id/delay", authenticate, async (req: AuthRequest, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { newEndTime } = req.body;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { task: true },
    });

    if (!schedule || schedule.task.userId !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: "DELAYED",
        endTime: new Date(newEndTime),
      },
      include: { task: true },
    });

    // Send overdue notification
    if (req.user.email) {
      const delayMinutes = Math.round(
        (new Date(newEndTime).getTime() - schedule.endTime.getTime()) /
          1000 /
          60,
      );
      await NotificationService.sendTaskOverdueNotification(
        req.user.email,
        schedule.task.title,
        `${delayMinutes} phút`,
        "EMAIL",
      );
    }

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("schedule:updated", updated);
    }

    res.json(updated);
  } catch (err) {
    console.error("Error delaying schedule:", err);
    res.status(500).json({ message: "Error updating schedule" });
  }
});

// POST /schedules/:id/reschedule - Reschedule task (drag-drop)
router.post("/:id/reschedule", authenticate, async (req: AuthRequest, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "Start time and end time are required" });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { task: true },
    });

    if (!schedule || schedule.task.userId !== req.user.id) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "PENDING",
      },
      include: { task: true },
    });

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("schedule:updated", updated);
    }

    res.json({
      message: "Schedule rescheduled successfully",
      schedule: updated,
    });
  } catch (err) {
    console.error("Error rescheduling:", err);
    res.status(500).json({ message: "Error rescheduling schedule" });
  }
});

export default router;
