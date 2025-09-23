import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
        <main>{children}</main>
      </body>
    </html>
  );
}
