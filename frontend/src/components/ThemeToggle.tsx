"use client";

import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
      title={`Chuyển sang ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      {theme === "light" ? (
        <Moon size={20} className="text-gray-800" />
      ) : (
        <Sun size={20} className="text-yellow-400" />
      )}
    </button>
  );
}
