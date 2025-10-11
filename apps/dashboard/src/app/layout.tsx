// apps/dashboard/src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./clientlayout"; // file baru yang kita buat

// Batangas font untuk seluruh body
const batangas = localFont({
  src: "../../../../packages/lib/font/Batangas-Bold.otf",
  variable: "--font-batangas",
  display: "swap",
});

// Braggadocio font khusus untuk brand
const braggadocio = localFont({
  src: "../../../../packages/lib/font/braggadocio.woff2",
  variable: "--font-braggadocio",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PACE.ON",
  description: "Easy Ways To Booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={braggadocio.variable}>
      <body className={batangas.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}