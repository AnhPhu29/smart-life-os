"use client";

export const cookieUtils = {
  setToken: (token: string, type: "access" | "refresh") => {
    const key = type === "access" ? "access_token" : "refresh_token";
    document.cookie = `${key}=${token}; path=/; max-age=${type === "access" ? 86400 : 604800}; SameSite=Lax`;
  },

  getToken: (type: "access" | "refresh"): string | null => {
    const key = type === "access" ? "access_token" : "refresh_token";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${key}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },

  removeToken: (type: "access" | "refresh" | "all") => {
    if (type === "access" || type === "all") {
      document.cookie = "access_token=; path=/; max-age=0";
    }
    if (type === "refresh" || type === "all") {
      document.cookie = "refresh_token=; path=/; max-age=0";
    }
  },

  clearAll: () => {
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
};
