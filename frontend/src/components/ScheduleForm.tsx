"use client";

import React, { useEffect, useState } from "react";
import {
  scheduleService,
  CreateSchedulePayload,
} from "@/services/scheduleService";
import { taskService, Task } from "@/services/taskService";
import { Calendar, Clock } from "lucide-react";

interface ScheduleFormProps {
  onSuccess?: () => void;
}

export function ScheduleForm({ onSuccess }: ScheduleFormProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    taskId: "",
    startTime: "",
    endTime: "",
    applyBuffer: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getTasks(false, 0, 100);
        setTasks(data.content.filter((t) => !t.isCompleted));
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.taskId || !formData.startTime || !formData.endTime) {
      setMessage({
        type: "error",
        text: "Vui lòng điền tất cả các trường bắt buộc",
      });
      return;
    }

    // Validate that endTime is after startTime
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    if (endDate <= startDate) {
      setMessage({
        type: "error",
        text: "Thời gian kết thúc phải sau thời gian bắt đầu",
      });
      return;
    }

    try {
      setLoading(true);
      await scheduleService.createSchedule({
        taskId: parseInt(formData.taskId),
        startTime: formData.startTime,
        endTime: formData.endTime,
        applyBuffer: formData.applyBuffer,
      } as CreateSchedulePayload);

      setMessage({
        type: "success",
        text: "Lịch biểu đã được tạo thành công!",
      });

      setFormData({
        taskId: "",
        startTime: "",
        endTime: "",
        applyBuffer: true,
      });

      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      setMessage({
        type: "error",
        text: "Lỗi khi tạo lịch biểu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Lịch Biểu Mới
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nhiệm vụ *
          </label>
          <select
            value={formData.taskId}
            onChange={(e) =>
              setFormData({ ...formData, taskId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            required
          >
            <option value="">Chọn một nhiệm vụ</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thời gian bắt đầu *
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thời gian kết thúc *
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.applyBuffer}
            onChange={(e) =>
              setFormData({ ...formData, applyBuffer: e.target.checked })
            }
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Áp dụng đệm thích ứng
          </span>
        </label>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm transition-colors ${
              message.type === "success"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
            }`}
          >
            {message.type === "success" && "✓ "}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Đang tạo..." : "Tạo Lịch Biểu"}
        </button>
      </div>
    </form>
  );
}
