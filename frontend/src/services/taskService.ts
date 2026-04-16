import apiClient from "@/lib/apiClient";

export interface Task {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  categoryName: string | null;
  priorityQuadrant:
    | "URGENT_IMPORTANT"
    | "NOT_URGENT_IMPORTANT"
    | "URGENT_NOT_IMPORTANT"
    | "NOT_URGENT_NOT_IMPORTANT";
  priorityScore: number;
  estimatedDuration: number;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  categoryId?: number;
  priorityQuadrant?: Task["priorityQuadrant"];
  estimatedDuration?: number;
  dueDate?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const taskService = {
  getTasks: (completed = false, page = 0, size = 20) =>
    apiClient
      .get<PageResponse<Task>>("/tasks", { params: { completed, page, size } })
      .then((r) => r.data),

  getTask: (id: number) =>
    apiClient.get<Task>(`/tasks/${id}`).then((r) => r.data),

  createTask: (payload: CreateTaskPayload) =>
    apiClient.post<Task>("/tasks", payload).then((r) => r.data),

  createTaskWithAi: (payload: CreateTaskPayload) =>
    apiClient
      .post<Task & { aiReasoning: string }>("/tasks/ai-classify", payload)
      .then((r) => r.data),

  updateTask: (id: number, payload: CreateTaskPayload) =>
    apiClient.put<Task>(`/tasks/${id}`, payload).then((r) => r.data),

  completeTask: (id: number) =>
    apiClient.patch<Task>(`/tasks/${id}/complete`).then((r) => r.data),

  deleteTask: (id: number) => apiClient.delete(`/tasks/${id}`),

  getRecommendations: () =>
    apiClient
      .get<{ recommendations: string[] }>("/tasks/ai/recommendations")
      .then((r) => r.data),

  getPerformance: () =>
    apiClient.get("/tasks/ai/performance").then((r) => r.data),
};
