import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./ui/navbar";
import MainWrapper from "./ui/components/MainWrapper";

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
  title: "PACE.ON | Next-Gen Fun Networking & Collaboration Space",
  description:
    "PACE.ON is a next-generation networking and collaboration space for Gen-Z founders. We create authentic connections through relax and fun activities. Designed to help early-stage founders build meaningful relationships, share experiences, and collaborate.",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={soulmaze.variable}>
      <body className={outfit.className}>
        {/* Inject smooth scroll engine */}
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}