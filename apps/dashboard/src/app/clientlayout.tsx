// apps/dashboard/src/app/ClientLayout.tsx
"use client"
import React from "react";
import { usePathname } from "next/navigation";
import SideNavbar from "./ui/NavDashboard"; // sesuaikan path

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Halaman yang TIDAK perlu sidebar (tambahin sesuai kebutuhan)
  const noSidebarPages = ['/auth', '/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowSidebar = !noSidebarPages.some(page => pathname?.startsWith(page));

  if (!shouldShowSidebar) {
    // Layout tanpa sidebar untuk auth pages
    return <main className="min-h-screen">{children}</main>;
  }

  // Layout dengan sidebar untuk dashboard pages
  return (
    <div className="flex min-h-screen">
      <SideNavbar />
      <main className="flex-1 ml-20 transition-all duration-300 bg-gray-50">
        {children}
      </main>
    </div>
  );
}