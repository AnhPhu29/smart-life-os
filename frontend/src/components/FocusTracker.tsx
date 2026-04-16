"use client";

import React from "react";
import { Play, Pause, X, Clock, Maximize2 } from "lucide-react";
import { useFocusSession, FocusSessionData } from "@/hooks/useFocusSession";
import { DeepWorkMode } from "./DeepWorkMode";

interface FocusTrackerProps {
  scheduleId: number;
  taskTitle: string;
  estimatedDuration: number; // in minutes
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const getProgressPercentage = (elapsed: number, total: number): number => {
  return Math.min(100, (elapsed / total) * 100);
};

export const FocusTracker: React.FC<FocusTrackerProps> = ({
  scheduleId,
  taskTitle,
  estimatedDuration,
  onClose,
}) => {
  const {
    session,
    state,
    startSession,
    togglePause,
    completeSession,
    cancelSession,
  } = useFocusSession();
  const [showDeepWork, setShowDeepWork] = React.useState(false);

  React.useEffect(() => {
    if (!session && state.isActive === false) {
      const data: FocusSessionData = {
        scheduleId,
        taskTitle,
        estimatedDuration,
        startTime: new Date(),
      };
      startSession(data);
    }
  }, []);

  const handleCompleteDeepWork = async () => {
    setShowDeepWork(false);
    await completeSession();
    onClose();
  };

  const handleCancel = () => {
    if (confirm("Bạn có chắc chắn muốn hủy focus session này?")) {
      cancelSession();
      onClose();
    }
  };

  const handleComplete = async () => {
    await completeSession();
    onClose();
  };

  const timeRemaining = state.totalSeconds - state.elapsedSeconds;
  const progress = getProgressPercentage(
    state.elapsedSeconds,
    state.totalSeconds,
  );
  const isOvertime = state.elapsedSeconds > state.totalSeconds;

  // Render DeepWorkMode when active
  if (showDeepWork) {
    return (
      <DeepWorkMode
        isActive={showDeepWork}
        onClose={() => setShowDeepWork(false)}
        elapsedSeconds={state.elapsedSeconds}
        totalSeconds={state.totalSeconds}
        taskTitle={taskTitle}
      />
    );
  }

  return (
    <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border-2 border-indigo-500 dark:border-indigo-400 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Đang Focus
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs">
              {taskTitle}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Hủy focus session"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Timer Display */}
      <div
        className={`text-center py-6 rounded-lg ${
          isOvertime
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-indigo-50 dark:bg-indigo-900/20"
        }`}
      >
        <div className="text-5xl font-bold font-mono tracking-wider mb-2">
          <span
            className={
              isOvertime
                ? "text-red-600 dark:text-red-400"
                : "text-indigo-600 dark:text-indigo-400"
            }
          >
            {formatTime(state.elapsedSeconds)}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isOvertime ? (
            <span className="text-red-600 dark:text-red-400 font-medium">
              ⚠️ Vượt giờ{" "}
              {formatTime(state.elapsedSeconds - state.totalSeconds)}
            </span>
          ) : (
            <span>
              Còn lại:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {formatTime(timeRemaining)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Tiến độ</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOvertime ? "bg-red-500" : "bg-indigo-500"
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={togglePause}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            state.isPaused
              ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
              : "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white"
          }`}
        >
          {state.isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Tiếp tục
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Tạm dừng
            </>
          )}
        </button>

        <button
          onClick={handleComplete}
          className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors"
        >
          ✅ Hoàn thành
        </button>

        <button
          onClick={() => setShowDeepWork(true)}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          title="Vào chế độ toàn màn hình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Deep Work Mode Toggle */}
      <button
        onClick={() => setShowDeepWork(!showDeepWork)}
        className="w-full px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
      >
        {showDeepWork ? "🎯 Chế độ Deep Work: BẬT" : "👁️ Chế độ Deep Work: TẮT"}
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Thời gian dự kiến
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {estimatedDuration} phút
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Đã làm</p>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {Math.floor(state.elapsedSeconds / 60)} phút
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Hiệu suất</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round((state.elapsedSeconds / state.totalSeconds) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};
