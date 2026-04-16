"use client";

import React, { useEffect, useState } from "react";
import { TaskCard } from "./TaskCard";
import { Task, taskService } from "@/services/taskService";
import { notificationService } from "@/services/notificationService";

interface TaskListProps {
  refresh?: number;
  showCompleted?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  refresh = 0,
  showCompleted = false,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [refresh, showCompleted]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks(showCompleted ? true : false);
      setTasks(response.content);
    } catch (error: any) {
      notificationService.error("Không thể tải nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await taskService.completeTask(id);
      notificationService.success("Nhiệm vụ đã hoàn thành!");
      await loadTasks();
    } catch (error: any) {
      notificationService.error("Không thể hoàn thành nhiệm vụ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) return;
    try {
      await taskService.deleteTask(id);
      notificationService.success("Nhiệm vụ đã được xóa!");
      await loadTasks();
    } catch (error: any) {
      notificationService.error("Không thể xóa nhiệm vụ");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {showCompleted
            ? "Chưa có nhiệm vụ nào được hoàn thành"
            : "Không có nhiệm vụ đang chờ. Tuyệt vời! 🎉"}
        </p>
      </div>
    );
  }

  // Group by priority quadrant
  const grouped = {
    URGENT_IMPORTANT: tasks.filter(
      (t) => t.priorityQuadrant === "URGENT_IMPORTANT",
    ),
    NOT_URGENT_IMPORTANT: tasks.filter(
      (t) => t.priorityQuadrant === "NOT_URGENT_IMPORTANT",
    ),
    URGENT_NOT_IMPORTANT: tasks.filter(
      (t) => t.priorityQuadrant === "URGENT_NOT_IMPORTANT",
    ),
    NOT_URGENT_NOT_IMPORTANT: tasks.filter(
      (t) => t.priorityQuadrant === "NOT_URGENT_NOT_IMPORTANT",
    ),
  };

  return (
    <div className="space-y-8">
      {/* URGENT & IMPORTANT */}
      {grouped.URGENT_IMPORTANT.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-red-700 mb-3">
            🔴 Urgent & Important (Do First)
          </h2>
          <div className="space-y-3">
            {grouped.URGENT_IMPORTANT.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* NOT URGENT BUT IMPORTANT */}
      {grouped.NOT_URGENT_IMPORTANT.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-blue-700 mb-3">
            🔵 Important (Schedule)
          </h2>
          <div className="space-y-3">
            {grouped.NOT_URGENT_IMPORTANT.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* URGENT NOT IMPORTANT */}
      {grouped.URGENT_NOT_IMPORTANT.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-yellow-700 mb-3">
            🟡 Urgent (Delegate)
          </h2>
          <div className="space-y-3">
            {grouped.URGENT_NOT_IMPORTANT.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* NOT URGENT NOT IMPORTANT */}
      {grouped.NOT_URGENT_NOT_IMPORTANT.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            ⚪ Low Priority (Eliminate)
          </h2>
          <div className="space-y-3">
            {grouped.NOT_URGENT_NOT_IMPORTANT.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
