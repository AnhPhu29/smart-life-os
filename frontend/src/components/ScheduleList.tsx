"use client";

import React, { useEffect, useState } from "react";
import { scheduleService, Schedule } from "@/services/scheduleService";
import { Calendar, Clock, AlertCircle, Play } from "lucide-react";
import { FocusTracker } from "./FocusTracker";

interface ScheduleListProps {
  refresh?: number;
}

export function ScheduleList({ refresh = 0 }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [focusSchedule, setFocusSchedule] = useState<Schedule | null>(null);

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
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "IN_PROGRESS":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "DELAYED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "CANCELLED":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar size={20} />
          Lịch Biểu
        </h3>
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm transition-colors"
        />
      </div>

      {/* Focus Tracker Modal */}
      {focusSchedule && (
        <div className="mb-6 border-t dark:border-slate-700 pt-6">
          <FocusTracker
            scheduleId={focusSchedule.id}
            taskTitle={focusSchedule.task.title}
            estimatedDuration={30}
            onClose={() => {
              setFocusSchedule(null);
              fetchSchedules();
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Đang tải lịch biểu...
        </p>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8">
          <Clock
            size={32}
            className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
          />
          <p className="text-gray-500 dark:text-gray-400">
            Không có lịch biểu nào cho ngày này
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-700/50 bg-gray-50 dark:bg-slate-700/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {schedule.task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Clock size={14} />
                    {formatTime(schedule.startTime)} -{" "}
                    {formatTime(schedule.endTime)}
                  </div>

                  {schedule.bufferApplied > 0 && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded inline-block transition-colors">
                      Đệm: {schedule.bufferApplied}m
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {schedule.status === "PENDING" && (
                    <button
                      onClick={() => setFocusSchedule(schedule)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      title="Bắt đầu focus session"
                    >
                      <Play size={14} />
                      Focus
                    </button>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}
                  >
                    {getStatusLabel(schedule.status)}
                  </span>
                </div>
              </div>

              {schedule.panicModeFlag && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded transition-colors">
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
