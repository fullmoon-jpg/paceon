"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabaseclient";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Get user email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    router.push("/auth/sign-up/matchmakingform");
  };

  return (
    <div className="min-h-screen bg-[#F4F4EF] flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <h1 
          className="text-xl sm:text-2xl text-[#FB6F7A] font-brand"
          style={{ transform: 'rotate(-3deg)' }}
        >
          PACE ON
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-[#FB6F7A] rounded-full p-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#FB6F7A] mb-3">
          Check Your Email
        </h1>

        {/* Description */}
        <p className="text-[#3F3E3D] mb-2">
          We&apos;ve sent a confirmation email to:
        </p>
        <p className="text-[#007AA6] font-semibold mb-6">
          {userEmail || "Your email"}
        </p>

        {/* Info Box */}
        <div className="bg-[#007AA6]/10 border border-[#007AA6] rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#007AA6] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#3F3E3D]">
              <p className="font-medium text-[#007AA6] mb-1">What&apos;s next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Click the confirmation link in your email</li>
                <li>• Or continue to complete your profile</li>
                <li>• You can verify your email later</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!canSkip}
          className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
            canSkip
              ? "bg-[#fb6f7a] text-[#f4f4ef] hover:bg-[#21c36e]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canSkip ? (
            <>
              Continue to Profile Setup
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            `Continue in ${countdown}s`
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          Didn&apos;t receive the email?{" "}
          <button className="text-[#FB6F7A] hover:text-[#D33181] hover:underline font-medium">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}