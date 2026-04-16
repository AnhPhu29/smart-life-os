import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { PrismaClient, Prisma } from "@prisma/client";
import { AiService } from "../services/aiService";

const router = Router();
const prisma = new PrismaClient();

// Declare global io for socket emissions
declare global {
  var io: any;
}

// AI routes MUST come BEFORE /:id routes
// GET /tasks/ai/recommendations
router.get(
  "/ai/recommendations",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const recommendations = await AiService.generateRecommendations(
        req.user.id,
      );
      res.json({ recommendations });
    } catch (err) {
      console.error("Error generating recommendations:", err);
      res.status(500).json({ message: "Error generating recommendations" });
    }
  },
);

// GET /tasks/ai/performance
router.get("/ai/performance", authenticate, async (req: AuthRequest, res) => {
  try {
    const performance = await AiService.analyzeUserPerformance(req.user.id);
    res.json(performance || { message: "Not enough data yet" });
  } catch (err) {
    console.error("Error analyzing performance:", err);
    res.status(500).json({ message: "Error analyzing performance" });
  }
});

// POST /tasks/ai-classify
router.post("/ai-classify", authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Use AI Service to classify task
    const classification = await AiService.classifyTask(title, description);

    const task = await prisma.task.create({
      data: {
        userId: req.user.id,
        title,
        description: description || null,
        priorityQuadrant: classification.quadrant,
        priorityScore: new Prisma.Decimal(classification.priorityScore),
        estimatedDuration: 30,
      },
      include: { category: true },
    });

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("task:created", task);
    }

    res.status(201).json({
      ...task,
      aiReasoning: classification.reasoning,
    });
  } catch (err) {
    console.error("Error in ai-classify:", err);
    res.status(500).json({ message: "Error creating task" });
  }
});

// GET /tasks
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const completed = req.query.completed === "true";
    const limit = parseInt(req.query.size as string) || 20;

    // Simplistic pagination without full page setup
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
        isCompleted: completed,
      },
      take: limit,
      orderBy: { priorityScore: "desc" },
      include: { category: true },
    });

    // Simulate Spring Page object
    res.json({
      content: tasks,
      totalElements: tasks.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// GET /tasks/:id
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!task || task.userId !== req.user.id)
      return res.status(404).json({ message: "Not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// POST /tasks
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, categoryId, dueDate, estimatedDuration } =
      req.body;
    const task = await prisma.task.create({
      data: {
        userId: req.user.id,
        title,
        description,
        categoryId,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration: estimatedDuration || 30,
      },
    });

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("task:created", task);
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// PUT /tasks/:id
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, categoryId, dueDate, estimatedDuration } =
      req.body;
    const taskId = parseInt(req.params.id);
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.userId !== req.user.id)
      return res.status(404).send();

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        categoryId,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration,
      },
    });

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("task:updated", task);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// PATCH /tasks/:id/complete
router.patch("/:id/complete", authenticate, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: true },
    });

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io.to(`user-${req.user.id}`).emit("task:updated", updated);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE /tasks/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.userId !== req.user.id)
      return res.status(404).send();
    await prisma.task.delete({ where: { id: taskId } });

    // Emit real-time event to user
    if (globalThis.io) {
      globalThis.io
        .to(`user-${req.user.id}`)
        .emit("task:deleted", { id: taskId });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).send();
  }
});

export default router;
