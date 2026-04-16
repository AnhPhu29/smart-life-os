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
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
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
    const errorMessage = err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Tài khoản hoặc mật khẩu không đúng";
      setError(errorMessagenewErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
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
      // Lưu vào both localStorage và cookies
      localStorage.setItem("access_token", response4 rounded-xl text-sm mb-6 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
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
                errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (errors.username) setErrors({ ...errors, username: undefined });
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
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: undefined });
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-4
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              required
              type="text"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              required
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-medium transition-all shadow-md shadow-indigo-200 mt-4 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Đăng nhập
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
  );
}
