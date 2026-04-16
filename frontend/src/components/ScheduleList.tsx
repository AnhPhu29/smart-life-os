"use client";

import React, { useEffect, useState } from "react";
import { scheduleService, Schedule } from "@/services/scheduleService";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface ScheduleListProps {
  refresh?: number;
}

export function ScheduleList({ refresh = 0 }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const startTime = new Date(selectedDate);
      startTime.setHours(0, 0, 0, 0);

      const endTime = new Date(selectedDate);
      endTime.setHours(23, 59, 59, 999);

      const data = await scheduleService.getSchedules(
        startTime.toISOString(),
        endTime.toISOString(),
      );
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate, refresh]);

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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} />
          Lịch Biểu
        </h3>
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-4">Đang tải lịch biểu...</p>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">Không có lịch biểu nào cho ngày này</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {schedule.task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Clock size={14} />
                    {formatTime(schedule.startTime)} -{" "}
                    {formatTime(schedule.endTime)}
                  </div>

                  {schedule.bufferApplied > 0 && (
                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                      Đệm: {schedule.bufferApplied}m
                    </div>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}
                >
                  {getStatusLabel(schedule.status)}
                </span>
              </div>

              {schedule.panicModeFlag && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  <AlertCircle size={12} />
                  Chế độ Khẩn cấp Được Kích hoạt
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
