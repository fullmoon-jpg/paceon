// apps/dashboard/src/app/clientlayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ResponsiveNavbar from "./ui/NavDashboard";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ToastProvider } from "@/contexts/ToastContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Define pages where navbar should NOT show
  const noNavbarPages = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/resetpassword',
    '/auth/callback',
    '/auth/success',
  ];

  // ✅ Check if current path should hide navbar
  const shouldShowNavbar = !noNavbarPages.some((page) =>
    pathname?.startsWith(page)
  );

  return (
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            {shouldShowNavbar ? (
              // ✅ Layout WITH Navbar (Dashboard pages)
              <div className="flex min-h-screen bg-[#f4f4ef] dark:bg-[#1a1d29] transition-colors duration-200">
                <ResponsiveNavbar />
                <main className="flex-1 md:ml-20 transition-all duration-300 bg-white dark:bg-[#242837] pt-14 pb-20 md:pt-0 md:pb-0">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            ) : (
              // ✅ Layout WITHOUT Navbar (Auth pages)
              <main className="min-h-screen bg-white dark:bg-[#242837] transition-colors duration-200">
                {children}
              </main>
            )}
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
  );
}