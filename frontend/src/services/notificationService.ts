export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

// Simple notification store (có thể mở rộng thành Zustand/Redux)
let notificationId = 0;
const notifications: Map<string, Notification> = new Map();
const listeners: Set<(notifications: Notification[]) => void> = new Set();

export const notificationService = {
  subscribe: (listener: (notifications: Notification[]) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  show: (notification: Omit<Notification, "id">) => {
    const id = String(++notificationId);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 3000,
    };

    notifications.set(id, newNotification);
    listeners.forEach((listener) =>
      listener(Array.from(notifications.values())),
    );

    // Auto-remove after duration
    if (newNotification.duration) {
      setTimeout(() => {
        notificationService.remove(id);
      }, newNotification.duration);
    }

    return id;
  },

  success: (message: string, title = "Success") =>
    notificationService.show({ type: "success", title, message }),

  error: (message: string, title = "Error") =>
    notificationService.show({ type: "error", title, message }),

  warning: (message: string, title = "Warning") =>
    notificationService.show({ type: "warning", title, message }),

  info: (message: string, title = "Info") =>
    notificationService.show({ type: "info", title, message }),

  remove: (id: string) => {
    notifications.delete(id);
    listeners.forEach((listener) =>
      listener(Array.from(notifications.values())),
    );
  },

  getAll: () => Array.from(notifications.values()),
};
