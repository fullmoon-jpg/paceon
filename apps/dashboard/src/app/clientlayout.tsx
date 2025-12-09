// apps/dashboard/src/app/clientlayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ResponsiveNavbar from "./ui/NavDashboard";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ToastProvider } from "@/contexts/ToastContext";

// ✅ SIMPLIFIED: Tidak ada redirect logic, middleware yang handle
function SessionGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();

  // Public pages (untuk hide navbar)
  const publicPages = [
    '/',
    '/auth/login',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/resetpassword',
    '/auth/callback',
    '/auth/success',
  ];

  const isPublicPage = publicPages.some((page) => pathname?.startsWith(page));

  // ✅ HANYA tampilkan loading di protected pages
  // Middleware sudah handle redirect, jadi kita hanya perlu tunggu context ready
  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#242837]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FB6F7A] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Main Layout Component
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages where navbar should NOT show
  const noNavbarPages = [
    '/',
    '/auth/login',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/resetpassword',
    '/auth/callback',
    '/auth/success',
  ];

  const shouldShowNavbar = !noNavbarPages.some((page) =>
    pathname?.startsWith(page)
  );

  return (
    <SessionGuard>
      {shouldShowNavbar ? (
        // Layout WITH Navbar (Dashboard pages)
        <div className="flex min-h-screen bg-[#f4f4ef] dark:bg-[#1a1d29] transition-colors duration-200">
          <ResponsiveNavbar />
          <main className="flex-1 md:ml-20 transition-all duration-300 bg-white dark:bg-[#242837] pt-14 pb-20 md:pt-0 md:pb-0">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      ) : (
        // Layout WITHOUT Navbar (Auth pages)
        <main className="min-h-screen bg-white dark:bg-[#242837] transition-colors duration-200">
          {children}
        </main>
      )}
    </SessionGuard>
  );
}

// Export Main ClientLayout with Providers
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <LayoutContent>{children}</LayoutContent>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}