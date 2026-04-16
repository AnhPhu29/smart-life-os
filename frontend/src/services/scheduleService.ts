import apiClient from "@/lib/apiClient";

export interface Schedule {
  id: number;
  taskId: number;
  startTime: string;
  endTime: string;
  bufferApplied: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "CANCELLED";
  panicModeFlag?: boolean;
  task: {
    id: number;
    title: string;
    priorityScore: number;
    priorityQuadrant: string;
  };
  createdAt: string;
}

export interface CreateSchedulePayload {
  taskId: number;
  startTime: string;
  endTime: string;
  applyBuffer?: boolean;
}

export interface BufferResult {
  schedule: Schedule;
  buffer: {
    originalDuration: number;
    bufferTime: number;
    totalDuration: number;
    bufferPercentage: number;
    reasoning: string;
  };
}

export interface ExecutionLog {
  id: number;
  scheduleId: number;
  actualStart: string;
  actualEnd: string;
  efficiencyRate: number;
  notes?: string;
}

export interface BufferStats {
  totalSchedules: number;
  totalBufferApplied: number;
  averageBuffer: number;
  tasksByBufferRange: {
    noBuffer: number;
    small: number;
    medium: number;
    large: number;
  };
}

export const scheduleService = {
  // Create schedule with optional buffer
  createSchedule: (payload: CreateSchedulePayload) =>
    apiClient.post<Schedule>("/schedules", payload).then((r) => r.data),

  // Get schedules in date range
  getSchedules: (startTime: string, endTime: string) =>
    apiClient
      .get<Schedule[]>("/schedules", {
        params: { start: startTime, end: endTime },
      })
      .then((r) => r.data),

  // Apply buffer to existing schedule
  applyBuffer: (scheduleId: number) =>
    apiClient
      .post<BufferResult>(`/schedules/${scheduleId}/apply-buffer`)
      .then((r) => r.data),

  // Mark schedule as complete
  completeSchedule: (
    scheduleId: number,
    actualStart: string,
    actualEnd: string,
    notes?: string,
  ) =>
    apiClient
      .post<{
        schedule: Schedule;
        executionLog: ExecutionLog;
        efficiency: number;
      }>(`/schedules/${scheduleId}/complete`, {
        actualStart,
        actualEnd,
        notes,
      })
      .then((r) => r.data),

  // Mark schedule as delayed
  delaySchedule: (scheduleId: number, newEndTime: string) =>
    apiClient
      .post<Schedule>(`/schedules/${scheduleId}/delay`, {
        newEndTime,
      })
      .then((r) => r.data),

  // Reschedule (drag-drop)
  rescheduleSchedule: (
    scheduleId: number,
    startTime: string,
    endTime: string,
  ) =>
    apiClient
      .post<{
        message: string;
        schedule: Schedule;
      }>(`/schedules/${scheduleId}/reschedule`, { startTime, endTime })
      .then((r) => r.data),

  // Activate panic mode
  activatePanicMode: () =>
    apiClient
      .post<{
        message: string;
        optimization: {
          cancelled: number;
          buffered: number;
          rescheduled: number;
          criticalTasks: Array<{ id: number; title: string; priority: number }>;
        };
      }>("/schedules/panic-mode/activate")
      .then((r) => r.data),

  // Get buffer statistics
  getBufferStats: () =>
    apiClient.get<BufferStats>("/schedules/stats/buffers").then((r) => r.data),
};
