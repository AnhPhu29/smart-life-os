import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useToast } from "@/providers/ToastProvider";

export function useRealtimeNotifications() {
  const { addToast } = useToast();

  // Task events
  useSocket("task:created", (task: any) => {
    addToast(`✨ Nhiệm vụ mới: ${task.title}`, "success");
  });

  useSocket("task:updated", (task: any) => {
    addToast(`📝 Cập nhật: ${task.title}`, "info");
  });

  useSocket("task:deleted", (data: any) => {
    addToast(`🗑️ Nhiệm vụ đã xóa`, "warning");
  });

  // Schedule events
  useSocket("schedule:created", (schedule: any) => {
    addToast(`📅 Lịch mới: ${schedule.task?.title || "Sự kiện"}`, "success");
  });

  useSocket("schedule:updated", (schedule: any) => {
    addToast(`🔄 Cập nhật lịch: ${schedule.task?.title || "Sự kiện"}`, "info");
  });

  useSocket("schedule:deleted", (data: any) => {
    addToast(`❌ Lịch đã xóa`, "warning");
  });

  // Panic mode event
  useSocket("panic-mode:activated", (optimization: any) => {
    addToast(
      `🚨 Chế độ Panic: Đã hủy ${optimization.cancelled} nhiệm vụ, thêm đệm cho ${optimization.buffered} nhiệm vụ`,
      "warning",
      5000,
    );
  });

  // Stats updates
  useSocket("stats:updated", (stats: any) => {
    if (stats.efficiency) {
      addToast(`📊 Hiệu suất: ${Math.round(stats.efficiency)}%`, "info", 2000);
    }
  });

  // Connection status
  useSocket("connection", (data: any) => {
    if (data.connected) {
      addToast(`🟢 Kết nối thành công`, "success", 2000);
    } else {
      addToast(`🔴 Mất kết nối - Đang cố gắng kết nối lại...`, "error");
    }
  });

  // Error events
  useSocket("error", (error: any) => {
    addToast(`⚠️ Lỗi: ${error?.message || "Có lỗi xảy ra"}`, "error");
  });
}
