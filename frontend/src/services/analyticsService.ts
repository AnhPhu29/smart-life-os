import apiClient from "@/lib/apiClient";

export const analyticsService = {
  async getOverview() {
    const response = await apiClient.get(`/analytics/overview`);
    return response.data;
  },

  async getWeeklyTrend() {
    const response = await apiClient.get(`/analytics/weekly`);
    return response.data;
  },

  async getCategoryPerformance() {
    const response = await apiClient.get(`/analytics/category-performance`);
    return response.data;
  },

  async getCompletionRate() {
    const response = await apiClient.get(`/analytics/completion-rate`);
    return response.data;
  },

  async getQuadrantDistribution() {
    const response = await apiClient.get(`/analytics/quadrant-distribution`);
    return response.data;
  },

  async getBufferEffectiveness() {
    const response = await apiClient.get(`/analytics/buffer-effectiveness`);
    return response.data;
  },
};
