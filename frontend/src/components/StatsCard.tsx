"use client";

import React, { useEffect, useState } from "react";
import { scheduleService, BufferStats } from "@/services/scheduleService";
import { taskService } from "@/services/taskService";

export function StatsCard() {
  const [stats, setStats] = useState<BufferStats | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [bufferStats, perfData] = await Promise.all([
          scheduleService.getBufferStats(),
          taskService.getPerformance(),
        ]);
        setStats(bufferStats);
        setPerformance(perfData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Thống kê</h3>
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Thống kê</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tổng Lịch Biểu</p>
            <p className="text-2xl font-bold text-indigo-600">
              {stats?.totalSchedules || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng Đệm</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(stats?.totalBufferApplied || 0)}m
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">Phân bố Đệm</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Không có Đệm</span>
              <span className="font-semibold">
                {stats?.tasksByBufferRange.noBuffer || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Nhỏ (0-15%)</span>
              <span className="font-semibold">
                {stats?.tasksByBufferRange.small || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Trung bình (15-30%)</span>
              <span className="font-semibold">
                {stats?.tasksByBufferRange.medium || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lớn (&gt;30%)</span>
              <span className="font-semibold">
                {stats?.tasksByBufferRange.large || 0}
              </span>
            </div>
          </div>
        </div>

        {performance?.avgEfficiency !== undefined && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Hiệu suất Trung bình</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    performance.avgEfficiency >= 80
                      ? "bg-green-500"
                      : performance.avgEfficiency >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(performance.avgEfficiency, 100)}%`,
                  }}
                ></div>
              </div>
              <span className="text-lg font-bold">
                {Math.round(performance.avgEfficiency)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
