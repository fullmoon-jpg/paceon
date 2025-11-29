// apps/dashboard/src/app/clientlayout.tsx
"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ResponsiveNavbar from "./ui/NavDashboard";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ToastProvider } from "@/contexts/ToastContext";

// Session Guard Component
function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Public pages that don't require auth
  const publicPages = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/resetpassword',
    '/auth/callback',
    '/auth/success',
  ];

  const isPublicPage = publicPages.some((page) => pathname?.startsWith(page));

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If not authenticated and trying to access protected page
    if (!user && !isPublicPage) {
      console.warn('No user found, redirecting to login');
      router.push('/auth/login?redirectTo=' + encodeURIComponent(pathname || '/'));
      return;
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (user && isPublicPage && pathname !== '/auth/callback') {
      console.log('User already authenticated, redirecting to dashboard');
      router.push('/');
      return;
    }
  }, [user, loading, isPublicPage, pathname, router]);

  // Show loading skeleton for protected pages while checking auth
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

  // Don't render protected content if no user
  if (!loading && !user && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}

// Main Layout Component
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages where navbar should NOT show
  const noNavbarPages = [
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
