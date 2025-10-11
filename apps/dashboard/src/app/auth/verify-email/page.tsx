"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../.././../packages/lib/supabase";
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
      if (user?.email) {  // ✅ Add optional chaining
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
    <div className="min-h-screen bg-gradient-to-br from-[#1f4381] via-[#2a6435] to-[#15b392] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full p-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Check Your Email
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-2">
          We've sent a confirmation email to:
        </p>
        <p className="text-[#1f4381] font-semibold mb-6">
          {userEmail || "your email"}
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-blue-900 mb-1">What's next?</p>
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
          className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
            canSkip
              ? "bg-gradient-to-r from-[#2a6435] to-[#15b392] text-white hover:shadow-lg hover:scale-105"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
          Didn't receive the email?{" "}
          <button className="text-[#2a6435] hover:underline font-medium">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}