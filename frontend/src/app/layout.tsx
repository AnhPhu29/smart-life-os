import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider, ToastContainer } from "@/providers/ToastProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NotificationToast } from "@/components/NotificationToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Life OS - Adaptive Time Management",
  description:
    "AI-powered time management system that learns your habits and optimizes your schedule.",
  keywords: [
    "productivity",
    "AI",
    "time management",
    "Eisenhower matrix",
    "scheduling",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
              <NotificationToast />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
