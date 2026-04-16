"use client";

import React, { useEffect, useState } from "react";
import { taskService } from "@/services/taskService";
import { notificationService } from "@/services/notificationService";

export const RecommendationsWidget: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const result = await taskService.getRecommendations();
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="h-4 bg-blue-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-4">
      <h3 className="font-semibold text-indigo-900 mb-3">
        💡 Gợi ý Thông minh
      </h3>
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="flex items-start gap-2 text-sm text-indigo-900"
          >
            <span className="text-lg leading-none">→</span>
            <p>{rec}</p>
          </div>
        ))}
      </div>
      <button
        onClick={loadRecommendations}
        className="mt-3 text-xs text-indigo-600 hover:underline"
      >
        🔄 Làm mới
      </button>
    </div>
  );
};
