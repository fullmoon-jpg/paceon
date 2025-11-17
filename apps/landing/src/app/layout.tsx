import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./ui/navbar"; // Sesuaikan path
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={soulmaze.variable}>
      <body className={outfit.className}>
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}