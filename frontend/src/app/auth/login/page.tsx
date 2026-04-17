"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, LoginPayload } from "@/services/authService";
import { cookieUtils } from "@/lib/cookieUtils";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginPayload>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);
      authService.saveTokens(response);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 text-sm mb-6">
            Quản lý công việc và lịch biểu của bạn
          </p>

          {error && (
            <div className="p-4 bg-red-50 rounded-xl text-sm mb-6 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="text-red-600">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                  errors.username
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  if (errors.username)
                    setErrors({ ...errors, username: undefined });
                }}
                disabled={loading}
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu *
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                  errors.password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl py-3 font-medium transition-all shadow-md shadow-indigo-200 mt-6 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => router.push("/auth/register")}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
