"use client";

import React, { useState } from "react";
import { taskService, CreateTaskPayload } from "@/services/taskService";
import { notificationService } from "@/services/notificationService";

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [useAI, setUseAI] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      notificationService.error("Tiêu đề nhiệm vụ là bắt buộc");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        estimatedDuration,
      };

      if (useAI) {
        await taskService.createTaskWithAi(payload);
        notificationService.success(`Nhiệm vụ đã được tạo với phân loại AI!`);
      } else {
        await taskService.createTask(payload);
        notificationService.success("Nhiệm vụ đã được tạo thành công!");
      }

      setTitle("");
      setDescription("");
      setEstimatedDuration(30);
      onSuccess?.();
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || "Không thể tạo nhiệm vụ",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tiêu đề Nhiệm vụ *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ví dụ: Học Spring Boot"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mô tả
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Thêm chi tiết về nhiệm vụ của bạn..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Thời gian dự kiến (phút)
        </label>
        <input
          type="number"
          min="5"
          max="480"
          value={estimatedDuration}
          onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 30)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useAI"
          checked={useAI}
          onChange={(e) => setUseAI(e.target.checked)}
          disabled={loading}
          className="w-4 h-4 text-indigo-600 rounded"
        />
        <label
          htmlFor="useAI"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          🤖 Sử dụng AI để phân loại ưu tiên tự động
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Đang tạo..." : "Tạo Nhiệm Vụ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 disabled:bg-gray-100 dark:disabled:bg-slate-800 transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};
