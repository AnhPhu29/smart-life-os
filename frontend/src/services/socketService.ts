import { io, Socket } from "socket.io-client";
import { Schedule, Task } from "@/types";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(userId: number) {
    if (this.socket?.connected) {
      console.log("Already connected to socket server");
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event
    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      // Join personal user room
      this.socket?.emit("join-user-room", userId);
      this.emit("connection", { connected: true });
    });

    // Disconnection event
    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      this.emit("connection", { connected: false });
    });

    // Task events
    this.socket.on("task:created", (task: Task) => {
      console.log("Task created:", task);
      this.emit("task:created", task);
    });

    this.socket.on("task:updated", (task: Task) => {
      console.log("Task updated:", task);
      this.emit("task:updated", task);
    });

    this.socket.on("task:deleted", (data: { id: number }) => {
      console.log("Task deleted:", data.id);
      this.emit("task:deleted", data);
    });

    // Schedule events
    this.socket.on("schedule:created", (schedule: Schedule) => {
      console.log("Schedule created:", schedule);
      this.emit("schedule:created", schedule);
    });

    this.socket.on("schedule:updated", (schedule: Schedule) => {
      console.log("Schedule updated:", schedule);
      this.emit("schedule:updated", schedule);
    });

    this.socket.on("schedule:deleted", (data: { id: number }) => {
      console.log("Schedule deleted:", data.id);
      this.emit("schedule:deleted", data);
    });

    // Panic mode event
    this.socket.on("schedules:panic-mode-activated", (optimization: any) => {
      console.log("Panic mode activated:", optimization);
      this.emit("panic-mode:activated", optimization);
    });

    // Stats events
    this.socket.on("stats:updated", (stats: any) => {
      console.log("Stats updated:", stats);
      this.emit("stats:updated", stats);
    });

    // Error event
    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
      this.emit("error", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Subscribe to an event
  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  // Emit local event to listeners
  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
