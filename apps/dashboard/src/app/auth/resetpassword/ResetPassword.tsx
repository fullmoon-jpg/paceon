"use client";

import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import {
    confirmPasswordReset,
    verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../../../../../packages/lib/firebaseConfig";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // 🔍 Verify Reset Code
    useEffect(() => {
        const verifyCode = async () => {
            if (!oobCode || mode !== "resetPassword") {
                setError("Invalid or expired reset link.");
                setVerifying(false);
                return;
            }

            try {
                const userEmail = await verifyPasswordResetCode(auth, oobCode);
                setEmail(userEmail);
            } catch (err: unknown) {
                if (err && typeof err === "object" && "code" in err) {
                    const error = err as { code: string; message?: string };
                    setError(
                    error.code === "auth/expired-action-code"
                        ? "Reset link expired."
                        : "Invalid reset link."
                    );
                } else {
                    setError("Something went wrong.");
                }
                } finally {
                    setVerifying(false);
            }
        };

    verifyCode();
  }, [oobCode, mode]);

  // 🔑 Handle Reset Password
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err) {
            const error = err as { code: string; message?: string };
            setError(
            error.code === "auth/expired-action-code"
                ? "Reset link expired."
                : "Invalid reset link."
            );
        } else {
            setError("Something went wrong.");
        }
    } finally {
      setLoading(false);
    }
  };

  // 🔙 Back to Login
  const handleBackToLogin = () => router.push("/login");

  // ⏳ Loading Verification Screen
  if (verifying) {
    return (
      <AuthLayout>
        <Card>
          <div className="animate-spin h-12 w-12 border-b-2 border-green-500 mx-auto mb-4 rounded-full"></div>
          <h2 className="text-xl font-semibold">Verifying Link...</h2>
        </Card>
      </AuthLayout>
    );
  }

  // ✅ Success Screen
  if (success) {
    return (
      <AuthLayout>
        <Card>
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Password Reset Successful!</h2>
          <p className="mb-6 text-sm">Redirecting you to login...</p>
          <Button onClick={handleBackToLogin}>Go to Login</Button>
        </Card>
      </AuthLayout>
    );
  }

  // 🔒 Main Reset Form
  return (
    <AuthLayout>
      <Card>
        <h2 className="text-2xl font-bold mb-2 text-[#1f4381]">Reset Password</h2>
        {email && <p className="text-sm text-black mb-6">For: {email}</p>}
        {error && <Alert>{error}</Alert>}

        <PasswordInput
          placeholder="Enter New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          toggle={() => setShowNewPassword(!showNewPassword)}
        />
        <PasswordInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          toggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <Button
          onClick={handleResetPassword}
          disabled={!newPassword || !confirmPassword || loading}
        >
          {loading ? "Updating..." : "Reset Password"}
        </Button>
        <Button secondary onClick={handleBackToLogin}>
          Back to Login
        </Button>
      </Card>
    </AuthLayout>
  );
}

/* 🔹 Reusable Components */
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative w-full h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/images/login-img.webp')" }}
  >
    <div className="absolute inset-0 bg-black/50" />
    
    {/* ✅ Brand Logo */}
    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
      <h1 className="text-xl sm:text-2xl font-bold text-white font-brand">PACE.ON</h1>
    </div>
    
    <div className="relative flex items-center justify-center h-full">
      {children}
    </div>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center">
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  disabled,
  secondary,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 rounded-full font-medium mb-4 transition-colors ${
      secondary
        ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
        : "bg-[#1d4a2d] hover:bg-green-950 text-white"
    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Alert = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[#e3b2b5] border border-red-200 text-[#e33530] px-4 py-3 rounded-lg mb-4 text-sm">
    {children}
  </div>
);

const PasswordInput = ({
  value,
  onChange,
  placeholder,
  show,
  toggle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  toggle: () => void;
}) => (
  <div className="relative mb-4">
    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-black w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
    />
    <button
      type="button"
      onClick={toggle}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
    >
      {show ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
);