"use client";

import React, { useEffect, useState } from "react";
import {
  notificationService,
  Notification,
} from "@/services/notificationService";

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "✅";
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📢";
  }
};

const getColors = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-900";
    case "error":
      return "bg-red-50 border-red-200 text-red-900";
    case "warning":
      return "bg-yellow-50 border-yellow-200 text-yellow-900";
    case "info":
      return "bg-blue-50 border-blue-200 text-blue-900";
    default:
      return "bg-gray-50 border-gray-200 text-gray-900";
  }
};

export const NotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((nots) => {
      setNotifications(nots);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 shadow-lg ${getColors(notification.type)} animate-in slide-in-from-right-4`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none">
              {getIcon(notification.type)}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => notificationService.remove(notification.id)}
              className="text-lg leading-none opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
