"use client";

import React, { useEffect, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";

interface DeepWorkModeProps {
  isActive: boolean;
  onClose: () => void;
  elapsedSeconds: number;
  totalSeconds: number;
  taskTitle: string;
  onTimerUpdate?: (elapsed: number) => void;
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

export const DeepWorkMode: React.FC<DeepWorkModeProps> = ({
  isActive,
  onClose,
  elapsedSeconds,
  totalSeconds,
  taskTitle,
  onTimerUpdate,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const timeRemaining = totalSeconds - elapsedSeconds;
  const isOvertime = elapsedSeconds > totalSeconds;

  // Disable notifications and sounds when entering deep work
  useEffect(() => {
    if (isActive) {
      // Disable notifications
      if ("Notification" in window) {
        const originalNotificationPermission = (Notification as any).permission;
        // Store original state
        (window as any).__originalNotificationPermission =
          originalNotificationPermission;
      }

      // Hide UI elements by adding fullscreen class
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black dark:bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Blur background for visual effect */}
      <div className="absolute inset-0 bg-gradient-radial from-slate-800 to-black opacity-50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-8">
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors group"
          title="Thoát chế độ Deep Work (ESC)"
        >
          <X className="w-8 h-8 text-white group-hover:text-red-400 transition-colors" />
        </button>

        {/* Task Title */}
        <div className="text-center space-y-2">
          <p className="text-lg text-gray-300 tracking-widest uppercase">
            Nhiệm vụ hiện tại
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white max-w-2xl">
            {taskTitle}
          </h1>
        </div>

        {/* Large Timer */}
        <div
          className={`text-center space-y-6 ${
            isOvertime ? "animate-pulse" : ""
          }`}
        >
          <div className="text-9xl md:text-[160px] font-mono font-bold tracking-tight">
            <span
              className={`${isOvertime ? "text-red-500" : "text-indigo-400"}`}
            >
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Time Remaining / Overtime Indicator */}
          <div className="flex items-center justify-center gap-4">
            {isOvertime ? (
              <div className="text-2xl font-semibold text-red-400 animate-pulse">
                ⚠️ Vượt giờ: {formatTime(elapsedSeconds - totalSeconds)}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg text-gray-300">Còn lại</p>
                <p className="text-5xl font-bold text-green-400">
                  {formatTime(timeRemaining)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-48 h-48">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isOvertime ? "#ef4444" : "#60a5fa"}
              strokeWidth="3"
              strokeDasharray={`${
                (elapsedSeconds / totalSeconds) * 282.7
              } 282.7`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-semibold text-gray-300">
              {Math.round((elapsedSeconds / totalSeconds) * 100)}%
            </p>
          </div>
        </div>

        {/* Motivational Messages */}
        <div className="text-center space-y-3 text-gray-400 max-w-xl">
          {timeRemaining > 300 ? (
            <p className="text-lg animate-pulse">
              💪 Bạn đang làm tốt! Tiếp tục tập trung...
            </p>
          ) : timeRemaining > 0 ? (
            <p className="text-lg animate-pulse">
              🏁 Gần rồi! Bạn đã rất gần...
            </p>
          ) : (
            <p className="text-lg text-red-400 animate-pulse">
              ⏰ Đã hết thời gian dự kiến!
            </p>
          )}
        </div>

        {/* Sound Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 left-8 p-4 hover:bg-white/10 rounded-full transition-colors group"
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? (
            <VolumeX className="w-8 h-8 text-gray-400 group-hover:text-red-400 transition-colors" />
          ) : (
            <Volume2 className="w-8 h-8 text-gray-400 group-hover:text-green-400 transition-colors" />
          )}
        </button>

        {/* Keyboard Hint */}
        <p className="absolute bottom-8 right-8 text-sm text-gray-500">
          Nhấn <kbd className="bg-white/10 px-2 py-1 rounded">ESC</kbd> để thoát
        </p>
      </div>

      {/* Keyboard Shortcut Handler */}
      <KeyboardShortcutHandler onEscape={onClose} />
    </div>
  );
};

// Keyboard shortcut handler component
const KeyboardShortcutHandler: React.FC<{ onEscape: () => void }> = ({
  onEscape,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);

  return null;
};
