"use client";

import React, { useState, useEffect } from "react";
import { scheduleService } from "@/services/scheduleService";
import { notificationService } from "@/services/notificationService";

interface PanicModeButtonProps {
  onSuccess?: () => void;
}

export const PanicModeButton: React.FC<PanicModeButtonProps> = ({
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await scheduleService.activatePanicMode();
      notificationService.success(
        `Chế độ khẩn cấp đã được kích hoạt! Đã hủy ${result.optimization.cancelled} nhiệm vụ, tạo đệm cho ${result.optimization.buffered} nhiệm vụ quan trọng.`,
        "🚨 Chế độ Khẩn cấp",
      );
      onSuccess?.();
    } catch (error: any) {
      notificationService.error("Không thể kích hoạt chế độ khẩn cấp");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
        <p className="text-red-900 font-semibold mb-3">
          ⚠️ Kích hoạt Chế độ Khẩn cấp? Điều này sẽ:
        </p>
        <ul className="text-sm text-red-800 mb-4 space-y-1">
          <li>❌ Hủy nhiệm vụ không quan trọng</li>
          <li>⏰ Tạo đệm cho nhiệm vụ quan trọng</li>
          <li>📅 Sắp xếp lại lịch trình của bạn</li>
        </ul>
        <div className="flex gap-2">
          <button
            onClick={handleActivate}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Đang kích hoạt..." : "Có, Kích hoạt Chế độ Khẩn cấp"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 border border-red-300 text-red-900 py-2 rounded hover:bg-red-100"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition flex items-center justify-center gap-2"
    >
      🚨 Chế độ Khẩn cấp
    </button>
  );
};
