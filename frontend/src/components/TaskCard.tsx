"use client";

import React from "react";
import { Task } from "@/services/taskService";
import Link from "next/link";

interface TaskCardProps {
  task: Task;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

const getPriorityColor = (quadrant: string) => {
  switch (quadrant) {
    case "URGENT_IMPORTANT":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        badge: "bg-red-100 text-red-800",
      };
    case "NOT_URGENT_IMPORTANT":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        badge: "bg-blue-100 text-blue-800",
      };
    case "URGENT_NOT_IMPORTANT":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        badge: "bg-yellow-100 text-yellow-800",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        badge: "bg-gray-100 text-gray-800",
      };
  }
};

const getPriorityLabel = (quadrant: string) => {
  const labels: Record<string, string> = {
    URGENT_IMPORTANT: "🔴 Khẩn cấp & Quan trọng",
    NOT_URGENT_IMPORTANT: "🔵 Quan trọng",
    URGENT_NOT_IMPORTANT: "🟡 Khẩn cấp",
    NOT_URGENT_NOT_IMPORTANT: "⚪ Ưu tiên thấp",
  };
  return labels[quadrant] || "Chưa biết";
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  loading,
}) => {
  const colors = getPriorityColor(task.priorityQuadrant);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded-lg shadow-sm hover:shadow-md transition ${
        task.isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={`text-lg font-semibold ${task.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${colors.badge}`}
            >
              {getPriorityLabel(task.priorityQuadrant)}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>⏱️ {task.estimatedDuration} min</span>
            <span>⭐ {task.priorityScore}%</span>
            {task.categoryName && (
              <span className="px-2 py-1 bg-white rounded text-gray-700">
                📁 {task.categoryName}
              </span>
            )}
            {dueDate && (
              <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                📅 {dueDate.toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Link
            href={`/tasks/${task.id}`}
            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm transition"
          >
            Xem
          </Link>
          {!task.isCompleted && (
            <button
              onClick={() => onComplete?.(task.id)}
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm transition"
            >
              ✓ Hoàn thành
            </button>
          )}
          <button
            onClick={() => onDelete?.(task.id)}
            disabled={loading}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm transition"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
