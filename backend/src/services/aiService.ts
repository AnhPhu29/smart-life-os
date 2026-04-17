import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient, PriorityQuadrant } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const prisma = new PrismaClient();

interface ClassificationResult {
  quadrant: PriorityQuadrant;
  priorityScore: number;
  reasoning: string;
}

export class AiService {
  /**
   * Classify task using Gemini AI - Eisenhower Matrix
   * Returns: URGENT_IMPORTANT, NOT_URGENT_IMPORTANT, URGENT_NOT_IMPORTANT, NOT_URGENT_NOT_IMPORTANT
   */
  static async classifyTask(
    title: string,
    description?: string,
  ): Promise<ClassificationResult> {
    const defaultResult: ClassificationResult = {
      quadrant: "NOT_URGENT_IMPORTANT",
      priorityScore: 75,
      reasoning: "Default classification",
    };

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Missing GEMINI_API_KEY, using default classification");
      return defaultResult;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a Vietnamese productivity expert specializing in the Eisenhower Matrix.
Classify the following task into exactly ONE category:
- URGENT_IMPORTANT: Làm ngay, ưu tiên cao nhất
- NOT_URGENT_IMPORTANT: Quan trọng nhưng lâu dài
- URGENT_NOT_IMPORTANT: Khẩn cấp nhưng không quan trọng
- NOT_URGENT_NOT_IMPORTANT: Việc vặt, ít ưu tiên

Task Title: "${title}"
Task Description: "${description || "No description"}"

Response format (JSON):
{
  "quadrant": "QUADRANT_NAME",
  "reasoning": "Brief explanation in Vietnamese"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("Invalid Gemini response format");
        return defaultResult;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const quadrant = this.validateQuadrant(parsed.quadrant);
      const priorityScore = this.calculatePriorityScore(quadrant);

      return {
        quadrant,
        priorityScore,
        reasoning: parsed.reasoning || "",
      };
    } catch (error) {
      console.error("Gemini AI Classification Error:", error);
      return defaultResult;
    }
  }

  /**
   * Calculate priority score based on quadrant
   */
  private static calculatePriorityScore(quadrant: PriorityQuadrant): number {
    const scoreMap: Record<PriorityQuadrant, number> = {
      URGENT_IMPORTANT: 100,
      NOT_URGENT_IMPORTANT: 75,
      URGENT_NOT_IMPORTANT: 50,
      NOT_URGENT_NOT_IMPORTANT: 25,
    };
    return scoreMap[quadrant] || 75;
  }

  /**
   * Validate and sanitize quadrant
   */
  private static validateQuadrant(quadrant: string): PriorityQuadrant {
    const validQuadrants: PriorityQuadrant[] = [
      "URGENT_IMPORTANT",
      "NOT_URGENT_IMPORTANT",
      "URGENT_NOT_IMPORTANT",
      "NOT_URGENT_NOT_IMPORTANT",
    ];

    const normalized = quadrant?.toUpperCase().trim();
    return validQuadrants.includes(normalized as PriorityQuadrant)
      ? (normalized as PriorityQuadrant)
      : "NOT_URGENT_IMPORTANT";
  }

  /**
   * Analyze user's past performance to improve future classifications
   */
  static async analyzeUserPerformance(userId: number) {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      // Get execution logs from last 30 days
      const executionLogs = await prisma.executionLog.findMany({
        where: {
          schedule: {
            task: { userId },
          },
          createdAt: { gte: last30Days },
        },
        include: {
          schedule: {
            include: {
              task: {
                include: { category: true },
              },
            },
          },
        },
      });

      if (executionLogs.length === 0) {
        return null;
      }

      // Calculate efficiency per category
      const categoryStats: Record<
        string,
        { total: number; delayed: number; avgDelay: number }
      > = {};

      executionLogs.forEach((log) => {
        const category = log.schedule.task.category?.name || "Uncategorized";
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, delayed: 0, avgDelay: 0 };
        }

        categoryStats[category].total++;
        if (log.schedule.status === "DELAYED") {
          categoryStats[category].delayed++;
        }

        // Calculate delay percentage
        if (log.actualEnd && log.schedule.endTime) {
          const delayMs =
            log.actualEnd.getTime() - log.schedule.endTime.getTime();
          const delayMin = Math.max(0, delayMs / (1000 * 60));
          categoryStats[category].avgDelay += delayMin;
        }
      });

      // Calculate averages
      Object.keys(categoryStats).forEach((category) => {
        const stats = categoryStats[category];
        stats.avgDelay = stats.total > 0 ? stats.avgDelay / stats.total : 0;
      });

      return categoryStats;
    } catch (error) {
      console.error("Error analyzing user performance:", error);
      return null;
    }
  }

  /**
   * Generate smart recommendations for the user
   */
  static async generateRecommendations(userId: number): Promise<string[]> {
    try {
      const userTasks = await prisma.task.findMany({
        where: { userId, isCompleted: false },
        include: { schedules: true },
        orderBy: { priorityScore: "desc" },
        take: 10,
      });

      const overdueTasks = userTasks.filter((task) => {
        const schedule = task.schedules[0];
        return schedule && schedule.status === "DELAYED";
      });

      const recommendations: string[] = [];

      if (overdueTasks.length > 3) {
        recommendations.push(
          "⚠️ Bạn có quá nhiều task bị trễ. Hãy kích hoạt Panic Mode để tái sắp xếp lịch trình.",
        );
      }

      if (userTasks.length > 20) {
        recommendations.push(
          "📌 Bạn có quá nhiều task chưa hoàn thành. Hãy xem xét việc hủy bỏ các task không quan trọng.",
        );
      }

      const urgentImportant = userTasks.filter(
        (t) => t.priorityQuadrant === "URGENT_IMPORTANT",
      );
      if (urgentImportant.length === 0 && userTasks.length > 0) {
        recommendations.push(
          "💡 Bạn không có task Quan Trọng - Khẩn Cấp nào. Hãy đảm bảo bạn không bỏ qua các deadline sắp tới.",
        );
      }

      return recommendations.length > 0
        ? recommendations
        : ["✅ Bạn đang trên đúng hành trình!"];
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [];
    }
  }
}
