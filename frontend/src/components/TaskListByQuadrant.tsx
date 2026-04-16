"use client";

import React, { useEffect, useState } from "react";
import { taskService, Task } from "@/services/taskService";
import { CheckCircle2, Trash2 } from "lucide-react";

interface TaskListByQuadrantProps {
  refresh?: number;
  showCompleted?: boolean;
}

export function TaskListByQuadrant({
  refresh = 0,
  showCompleted = false,
}: TaskListByQuadrantProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTasks(showCompleted, 0, 100);
        setTasks(data.content);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refresh, showCompleted]);

  const handleComplete = async (id: number) => {
    try {
      await taskService.completeTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn?")) {
      try {
        await taskService.deleteTask(id);
        setTasks(tasks.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const quadrants = {
    URGENT_IMPORTANT: {
      label: "🔴 Khẩn cấp và Quan trọng",
      description: "Làm NGAY HÔM NAY",
      color: "border-l-red-500 bg-red-50",
      tasks: tasks.filter((t) => t.priorityQuadrant === "URGENT_IMPORTANT"),
    },
    NOT_URGENT_IMPORTANT: {
      label: "🔵 Không Khẩn cấp, nhưng Quan trọng",
      description: "Lên Kế hoạch",
      color: "border-l-blue-500 bg-blue-50",
      tasks: tasks.filter((t) => t.priorityQuadrant === "NOT_URGENT_IMPORTANT"),
    },
    URGENT_NOT_IMPORTANT: {
      label: "🟡 Khẩn cấp, Không Quan trọng",
      description: "Ủy quyền",
      color: "border-l-yellow-500 bg-yellow-50",
      tasks: tasks.filter((t) => t.priorityQuadrant === "URGENT_NOT_IMPORTANT"),
    },
    NOT_URGENT_NOT_IMPORTANT: {
      label: "⚪ Không Khẩn cấp, Không Quan trọng",
      description: "Tránh",
      color: "border-l-gray-500 bg-gray-50",
      tasks: tasks.filter(
        (t) => t.priorityQuadrant === "NOT_URGENT_NOT_IMPORTANT",
      ),
    },
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(quadrants).map(([key, quadrant]) => (
        <div key={key}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {quadrant.label}
            </h3>
            <p className="text-sm text-gray-600">{quadrant.description}</p>
          </div>

          {quadrant.tasks.length === 0 ? (
            <div className="border-l-4 bg-gray-50 border-gray-300 p-4 rounded text-gray-500 text-sm">
              Không có nhiệm vụ nào trong danh mục này
            </div>
          ) : (
            <div className="space-y-3">
              {quadrant.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border-l-4 ${quadrant.color} p-4 rounded-lg shadow-sm hover:shadow-md transition`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {task.estimatedDuration && (
                          <span>⏱ {task.estimatedDuration}m</span>
                        )}
                        {task.dueDate && (
                          <span>
                            📅{" "}
                            {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                        {task.categoryName && (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                            {task.categoryName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Đánh dấu là hoàn thành"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
