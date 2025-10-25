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
  title: "PACE.ON | Build Your Connection Through Sports",
  description:
    "Ready? Set? Go? With PACE.ON you can play padel, tennis, and meet like-minded people while staying active. Sports + networking = win-win!",
  keywords: [
    "PACE.ON",
    "Networking",
    "Sports Networking",
    "Founders",
    "Professionals",
    "Founder Networking",
    "Padel",
    "Tennis",
    "Matchmaking",
    "Event",
    "Business",
    "Networking Event",
    "LinkedIn",
    "Coffee",
    "Booking",
    "Jakarta",
    "Sport",
    "PACE ON"
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PACE.ON | Build Your Connection Through Sports",
    description:
      "Connect with founders and professionals through sports like padel and tennis. Build real connections while staying active.",
    url: "https://paceon.id",
    siteName: "PACE.ON",
    images: [
      {
        url: "/images/og-image.png", // ganti dengan gambar promo kamu
        width: 1200,
        height: 630,
        alt: "PACE.ON - Networking Through Sports",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PACE.ON | Build Your Connection Through Sports",
    description:
      "Meet founders and professionals through sports activities. Play. Network. Win.",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: "https://paceon.id",
  },
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

