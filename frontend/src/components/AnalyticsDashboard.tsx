"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsService } from "@/services/analyticsService";
import { TrendingUp, Target, CheckCircle, Zap } from "lucide-react";

interface OverviewStats {
  totalTasks: number;
  completedTasks: number;
  pendingSchedules: number;
  avgEfficiency: number;
}

interface WeeklyData {
  day: string;
  efficiency: number;
  tasks: number;
}

interface CategoryData {
  category: string;
  efficiency: number;
  tasksCompleted: number;
}

interface QuadrantData {
  name: string;
  value: number;
}

interface CompletionRate {
  total: number;
  completed: number;
  completionRate: number;
}

interface BufferStats {
  totalWithBuffer: number;
  successfulWithBuffer: number;
  effectiveness: number;
}

const COLORS = ["#4f46e5", "#ec4899", "#f59e0b", "#14b8a6"];

export function AnalyticsDashboard({ refresh = 0 }: { refresh?: number }) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [quadrantData, setQuadrantData] = useState<QuadrantData[]>([]);
  const [completionRate, setCompletionRate] = useState<CompletionRate | null>(
    null,
  );
  const [bufferStats, setBufferStats] = useState<BufferStats | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [refresh]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewData, weekly, categories, quadrant, completion, buffer] =
        await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getWeeklyTrend(),
          analyticsService.getCategoryPerformance(),
          analyticsService.getQuadrantDistribution(),
          analyticsService.getCompletionRate(),
          analyticsService.getBufferEffectiveness(),
        ]);

      setOverview(overviewData);
      setWeeklyData(weekly);
      setCategoryData(categories);
      setQuadrantData(quadrant);
      setCompletionRate(completion);
      setBufferStats(buffer);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng Nhiệm vụ</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {overview?.totalTasks || 0}
              </p>
            </div>
            <Target className="text-blue-600" size={32} />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Hoàn Thành (30 ngày)
              </p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {overview?.completedTasks || 0}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Tỷ lệ Hoàn thành
              </p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {completionRate?.completionRate || 0}%
              </p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>

        {/* Average Efficiency */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">
                Hiệu Suất Trung Bình
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-2">
                {overview?.avgEfficiency || 0}%
              </p>
            </div>
            <Zap className="text-amber-600" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Efficiency Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📊 Xu Hướng Hiệu Suất (7 Ngày)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#4f46e5"
                name="Hiệu Suất (%)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#ec4899"
                name="Nhiệm Vụ"
                strokeWidth={2}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🏆 Hiệu Suất Theo Danh Mục
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#4f46e5" name="Hiệu Suất (%)" />
              <Bar dataKey="tasksCompleted" fill="#14b8a6" name="Hoàn Thành" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Quadrant Distribution */}
        {quadrantData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🎯 Phân Bố Nhiệm Vụ (Eisenhower)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quadrantData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quadrantData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Buffer Effectiveness */}
        {bufferStats && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ⏰ Hiệu Quả Đệm (Buffer)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lịch Có Đệm:</span>
                <span className="font-bold text-lg text-indigo-600">
                  {bufferStats.totalWithBuffer}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Thành Công (80%+):</span>
                <span className="font-bold text-lg text-green-600">
                  {bufferStats.successfulWithBuffer}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-3 rounded-full"
                  style={{
                    width: `${bufferStats.effectiveness}%`,
                  }}
                ></div>
              </div>
              <p className="text-center text-lg font-bold text-indigo-600">
                {bufferStats.effectiveness}% Hiệu Quả
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Completion Rate Details */}
      {completionRate && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📈 Chi Tiết Tỷ lệ Hoàn thành (30 Ngày)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Tổng Lịch</p>
              <p className="text-3xl font-bold text-indigo-600">
                {completionRate.total}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Hoàn Thành</p>
              <p className="text-3xl font-bold text-green-600">
                {completionRate.completed}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Tỷ lệ</p>
              <p className="text-3xl font-bold text-purple-600">
                {completionRate.completionRate}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4 mt-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${completionRate.completionRate}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          💡 Thông Tin Chi Tiết
        </h3>
        <ul className="space-y-2 text-blue-800">
          {overview && overview.avgEfficiency >= 80 && (
            <li>
              ✅ Hiệu suất của bạn xuất sắc! Tiếp tục duy trì nhịp độ tốt.
            </li>
          )}
          {completionRate && completionRate.completionRate >= 80 && (
            <li>
              🎯 Tỷ lệ hoàn thành cao, bạn đang quản lý thời gian rất tốt!
            </li>
          )}
          {bufferStats && bufferStats.effectiveness >= 70 && (
            <li>⏰ Đệm dự trữ của bạn rất hiệu quả, hãy tiếp tục sử dụng.</li>
          )}
          {categoryData.length > 0 && (
            <li>
              📊 Bạn có {categoryData.length}
              {categoryData.length === 1 ? " danh mục" : " danh mục"} được theo
              dõi với hiệu suất trung bình{" "}
              {Math.round(
                categoryData.reduce((sum, c) => sum + c.efficiency, 0) /
                  categoryData.length,
              )}
              %.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
