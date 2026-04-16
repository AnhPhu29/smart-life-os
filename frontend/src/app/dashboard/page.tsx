"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskListByQuadrant } from "@/components/TaskListByQuadrant";
import { PanicModeButton } from "@/components/PanicModeButton";
import { RecommendationsWidget } from "@/components/RecommendationsWidget";
import { StatsCard } from "@/components/StatsCard";
import { ScheduleList } from "@/components/ScheduleList";
import { ScheduleForm } from "@/components/ScheduleForm";
import { CalendarView } from "@/components/CalendarView";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useRouter } from "next/navigation";
import { cookieUtils } from "@/lib/cookieUtils";
import { LogOut, Wifi, WifiOff } from "lucide-react";
import { socketService } from "@/services/socketService";
import { useSocket } from "@/hooks/useSocket";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

// Use dynamic import for ThemeToggle to avoid SSR issues
const DynamicThemeToggle = dynamic(
  () =>
    import("@/components/ThemeToggle").then((mod) => ({
      default: mod.ThemeToggle,
    })),
  { ssr: false },
);

export default function Dashboard() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "matrix">("matrix");
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Initialize real-time notifications
  useRealtimeNotifications();

  // Get user ID from localStorage (client-side only)
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id || null);
      }
    } catch {
      setUserId(null);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      socketService.connect(userId);
      setIsConnected(socketService.isConnected());
    }

    return () => {
      // Optional: disconnect on unmount
      // socketService.disconnect();
    };
  }, [userId]);

  // Listen to connection changes
  useSocket("connection", (data: any) => {
    setIsConnected(data.connected);
  });

  // Listen to real-time updates and refresh
  useSocket("task:created", () => setRefresh((r) => r + 1));
  useSocket("task:updated", () => setRefresh((r) => r + 1));
  useSocket("task:deleted", () => setRefresh((r) => r + 1));
  useSocket("schedule:created", () => setRefresh((r) => r + 1));
  useSocket("schedule:updated", () => setRefresh((r) => r + 1));
  useSocket("schedule:deleted", () => setRefresh((r) => r + 1));
  useSocket("stats:updated", () => setRefresh((r) => r + 1));
  useSocket("panic-mode:activated", () => setRefresh((r) => r + 1));

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      cookieUtils.clearAll();
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ⏰ Smart Life OS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hệ thống Quản lý Thời gian Thích ứng
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                isConnected
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Kết nối
                  </span>
                </>
              ) : (
                <>
                  <WifiOff
                    size={16}
                    className="text-red-600 dark:text-red-400"
                  />
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">
                    Ngắt kết nối
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center gap-2"
            >
              ✚ Nhiệm vụ Mới
            </button>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              📅 Lập Lịch
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              Đăng Xuất
            </button>
            <DynamicThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Task Form */}
          {showForm && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <TaskForm
                onSuccess={() => {
                  setShowForm(false);
                  setRefresh((r) => r + 1);
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Schedule Form */}
          {showScheduleForm && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <ScheduleForm
                onSuccess={() => {
                  setShowScheduleForm(false);
                  setRefresh((r) => r + 1);
                }}
              />
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard />
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🚨 Chế độ Khẩn cấp
              </h3>
              <PanicModeButton onSuccess={() => setRefresh((r) => r + 1)} />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                Kích hoạt khi bạn bị quá tải. Sẽ tự động hủy các nhiệm vụ không
                quan trọng và thêm đệm cho các nhiệm vụ quan trọng.
              </p>
            </div>
          </div>

          {/* Calendar View */}
          <div>
            <CalendarView refresh={refresh} />
          </div>

          {/* Schedules */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📅 Lịch Biểu
            </h2>
            <ScheduleList refresh={refresh} />
          </div>

          {/* Tasks by Quadrant */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📋 Nhiệm vụ (Ma trận Eisenhower)
            </h2>
            <TaskListByQuadrant refresh={refresh} showCompleted={false} />
          </div>

          {/* Recommendations */}
          <div>
            <RecommendationsWidget />
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📊 Phân Tích & Thống Kê
            </h2>
            <AnalyticsDashboard refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}
