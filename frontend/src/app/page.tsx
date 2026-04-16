"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cookieUtils } from "@/lib/cookieUtils";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token =
      cookieUtils.getToken("access") || localStorage.getItem("access_token");

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4 animate-pulse">
          <span className="text-white text-3xl">⏰</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Life OS</h1>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}
