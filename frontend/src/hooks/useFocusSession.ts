import { useState, useEffect, useCallback, useRef } from "react";
import { scheduleService } from "@/services/scheduleService";
import { notificationService } from "@/services/notificationService";

export interface FocusSessionState {
  isActive: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  totalSeconds: number;
}

export interface FocusSessionData {
  scheduleId: number;
  taskTitle: string;
  estimatedDuration: number; // in minutes
  startTime: Date;
}

export function useFocusSession() {
  const [session, setSession] = useState<FocusSessionData | null>(null);
  const [state, setState] = useState<FocusSessionState>({
    isActive: false,
    isPaused: false,
    elapsedSeconds: 0,
    totalSeconds: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Start focus session
  const startSession = useCallback((data: FocusSessionData) => {
    setSession(data);
    setState({
      isActive: true,
      isPaused: false,
      elapsedSeconds: 0,
      totalSeconds: data.estimatedDuration * 60,
    });
    startTimeRef.current = new Date();
    pausedTimeRef.current = 0;
  }, []);

  // Pause/Resume session
  const togglePause = useCallback(() => {
    setState((prev) => {
      if (!prev.isPaused) {
        // Going to pause
        pausedTimeRef.current = prev.elapsedSeconds;
      } else {
        // Resuming
        startTimeRef.current = new Date(
          Date.now() - pausedTimeRef.current * 1000,
        );
      }
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, []);

  // Complete session and send to backend
  const completeSession = useCallback(async () => {
    if (!session) return;

    try {
      const actualStartTime = new Date(
        startTimeRef.current!.getTime(),
      ).toISOString();
      const actualEndTime = new Date().toISOString();

      await scheduleService.completeSchedule(
        session.scheduleId,
        actualStartTime,
        actualEndTime,
        `Focus session completed: ${Math.floor(state.elapsedSeconds / 60)}min`,
      );

      notificationService.success(
        `✅ Hoàn thành! Hiệu suất: ${Math.round(
          (state.elapsedSeconds / state.totalSeconds) * 100,
        )}%`,
      );

      // Reset
      setState({
        isActive: false,
        isPaused: false,
        elapsedSeconds: 0,
        totalSeconds: 0,
      });
      setSession(null);
      startTimeRef.current = null;
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || "Không thể lưu focus session",
      );
    }
  }, [session, state.elapsedSeconds, state.totalSeconds]);

  // Cancel session
  const cancelSession = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      elapsedSeconds: 0,
      totalSeconds: 0,
    });
    setSession(null);
    startTimeRef.current = null;
  }, []);

  // Timer effect
  useEffect(() => {
    if (!state.isActive || state.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current!.getTime()) / 1000,
        );
        const newElapsed = pausedTimeRef.current + elapsed;

        // Auto-complete if time exceeded
        if (newElapsed >= prev.totalSeconds) {
          completeSession();
          return prev;
        }

        return { ...prev, elapsedSeconds: newElapsed };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.isPaused, state.totalSeconds, completeSession]);

  return {
    session,
    state,
    startSession,
    togglePause,
    completeSession,
    cancelSession,
  };
}
