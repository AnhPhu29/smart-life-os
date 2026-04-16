import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes không cần authentication
const publicRoutes = ["/auth/login", "/auth/register", "/api"];
const authRoutes = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Nếu là trang chủ (/), xử lý riêng
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Nếu là auth route (login/register) và đã authenticated, redirect sang dashboard
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Nếu là API route, cho phép truy cập
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Kiểm tra token cho các protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
