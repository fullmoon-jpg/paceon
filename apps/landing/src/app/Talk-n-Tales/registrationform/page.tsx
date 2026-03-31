// app/Talk-n-Tales/registrationform/page.tsx
"use client";
import { useEffect } from "react";
import TalkNTalesRegisterPage from "@/app/ui/components/tntform";
import Footer from "@/app/ui/footer";
import { Analytics } from "@vercel/analytics/next";

export default function RegistrationFormPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
    <Analytics />
      <TalkNTalesRegisterPage />
      <Footer />
    </>
  );
}