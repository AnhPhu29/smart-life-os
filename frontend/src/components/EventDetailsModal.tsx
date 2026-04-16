"use client";

import React, { useState } from "react";
import { Schedule, scheduleService } from "@/services/scheduleService";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface EventDetailsModalProps {
  event: Schedule | null;
  onClose: () => void;
  onReschedule: () => void;
}

export function EventDetailsModal({
  event,
  onClose,
  onReschedule,
}: EventDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [newStartTime, setNewStartTime] = useState<string>("");
  const [newEndTime, setNewEndTime] = useState<string>("");
  const [isReschedueling, setIsRescheduling] = useState(false);

  if (!event) return null;

  const handleReschedule = async () => {
    if (!newStartTime || !newEndTime) {
      alert("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }

    try {
      setLoading(true);
      await scheduleService.rescheduleSchedule(
        event.id,
        new Date(newStartTime).toISOString(),
        new Date(newEndTime).toISOString(),
      );
      onReschedule();
      onClose();
    } catch (error) {
      console.error("Error rescheduling:", error);
      alert("Lỗi khi lập lại lịch");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "DELAYED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Đang chờ",
      IN_PROGRESS: "Đang tiến hành",
      COMPLETED: "Hoàn thành",
      DELAYED: "Bị trễ",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Chi Tiết Sự Kiện</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {event.task.title}
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}
            >
              {getStatusLabel(event.status)}
            </span>
          </div>

          {/* Time Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-indigo-600" />
              <div>
                <p className="text-xs text-gray-600">Thời gian bắt đầu</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(event.startTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-indigo-600" />
              <div>
                <p className="text-xs text-gray-600">Thời gian kết thúc</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(event.endTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Buffer Info */}
          {event.bufferApplied && event.bufferApplied > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={18} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-900">
                  Đệm Đã Áp Dụng
                </p>
                <p className="text-sm text-blue-800">
                  {event.bufferApplied} phút
                </p>
              </div>
            </div>
          )}

          {/* Priority Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-xs text-indigo-600 font-medium">Ưu Tiên</p>
              <p className="text-lg font-bold text-indigo-900">
                {event.task.priorityScore}%
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium">Loại</p>
              <p className="text-sm font-bold text-purple-900">
                {event.task.priorityQuadrant.split("_").join(" ")}
              </p>
            </div>
          </div>

          {/* Reschedule Section */}
          {!isReschedueling ? (
            <button
              onClick={() => {
                setIsRescheduling(true);
                setNewStartTime(
                  new Date(event.startTime).toISOString().slice(0, 16),
                );
                setNewEndTime(
                  new Date(event.endTime).toISOString().slice(0, 16),
                );
              }}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              ✏️ Lập Lại Lịch
            </button>
          ) : (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReschedule}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded font-medium text-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded font-medium text-sm hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
