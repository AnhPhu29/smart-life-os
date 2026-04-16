import { useEffect, useCallback } from "react";
import { socketService } from "@/services/socketService";

export function useSocket(
  event: string,
  callback: (data: any) => void,
  dependencies: any[] = [],
) {
  useEffect(() => {
    // Subscribe to the event
    const unsubscribe = socketService.subscribe(event, callback);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [event, callback, ...dependencies]);
}

export function useSocketConnect(userId?: number) {
  const connect = useCallback(() => {
    if (userId) {
      socketService.connect(userId);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  const isConnected = useCallback(() => {
    return socketService.isConnected();
  }, []);

  return { connect, disconnect, isConnected };
}
