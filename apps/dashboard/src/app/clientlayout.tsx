// apps/dashboard/src/app/clientlayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ResponsiveNavbar from "./ui/NavDashboard";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Define pages where navbar should NOT show
  const noNavbarPages = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/reset-password',
    '/auth/callback',
  ];

  // ✅ Check if current path should hide navbar
  const shouldShowNavbar = !noNavbarPages.some((page) =>
    pathname?.startsWith(page)
  );

  return (
      <AuthProvider>
        <DataProvider>
        {shouldShowNavbar ? (
          // ✅ Layout WITH Navbar (Dashboard pages)
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <ResponsiveNavbar />
            <main className="flex-1 md:ml-20 transition-all duration-300 bg-gray-50 dark:bg-gray-900 pt-14 pb-20 md:pt-0 md:pb-0">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        ) : (
          // ✅ Layout WITHOUT Navbar (Auth pages)
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {children}
          </main>
        )}
        </DataProvider>
      </AuthProvider>
  );
}