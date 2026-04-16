"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle,
  InfoIcon,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

interface ToastContainerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function ToastContainer({
  position = "bottom-right",
}: ToastContainerProps) {
  const { toasts, removeToast } = useToast();

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-600" size={20} />;
      case "error":
        return <AlertCircle className="text-red-600" size={20} />;
      case "warning":
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case "info":
      default:
        return <InfoIcon className="text-blue-600" size={20} />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 space-y-2 pointer-events-none`}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getColors(toast.type)} border rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
