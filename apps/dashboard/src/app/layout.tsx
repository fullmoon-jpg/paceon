// apps/dashboard/src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./clientlayout"; // file baru yang kita buat

// Soulmaze font untuk seluruh body
const soulmaze = localFont({
  src: "../../../../packages/lib/font/Soulmaze.otf",
  variable: "--font-soulmaze",
  display: "swap",
});

// Outfit font khusus untuk brand
const outfit = localFont({
  src: "../../../../packages/lib/font/Outfit-Regular.otf",
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PACE.ON",
  description: "Easy Ways To Booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={soulmaze.variable}>
      <body className={outfit.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}