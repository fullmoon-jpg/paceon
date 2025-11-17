"use client";

import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

interface UserProfile {
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  // Handle email login
  const handleEmailLogin = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;

      // Check user role from users_profile table
      const { data: profile } = await supabase
        .from('users_profile')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = (profile as UserProfile | null)?.role || 'user';

      if (role === "admin") {
        router.push("/admin/dashbord");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      const authError = err as AuthError;
      
      if (authError.message?.includes("Invalid login credentials")) {
        setError("Wrong email or password. Please check again.");
      } else if (authError.message?.includes("Email not confirmed")) {
        setError("Please confirm your email first. Check your inbox.");
      } else {
        setError(authError.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error("Google login failed:", err);
      const authError = err as AuthError;
      setError(authError.message || "Google login failed. Please try again.");
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    if (!resetEmail) {
      setResetError("Email is required");
      setResetLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetError("Invalid email format");
      setResetLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      setResetMessage("Password reset email sent! Check your inbox and follow the instructions.");
      setResetEmail("");
      
      setTimeout(() => {
        setShowForgotModal(false);
        setResetMessage("");
      }, 3000);

    } catch (err) {
      console.error("Password reset error:", err);
      const authError = err as AuthError;
      setResetError(authError.message || "An error occurred. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setResetError("");
    setResetMessage("");
    setResetEmail(email);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetError("");
    setResetMessage("");
    setResetEmail("");
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      id="login image"
      style={{ backgroundImage: "url('/images/login-img.webp')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <h1 className="text-xl sm:text-2xl font-bold text-white font-brand">PACE.ON</h1>
      </div>
      
      <div className="relative flex items-center justify-center h-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center">
          <h2 className="text-2xl font-bold text-[#1f4381] mb-6">LOGIN</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="text-black w-full mb-4 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2a6435] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="text-black w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2a6435] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="text-right mb-6">
            <button
              onClick={openForgotModal}
              className="text-sm text-[#2a6435] hover:text-green-950 hover:underline"
            >
              Forgot the password?
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-gray-500 text-sm">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="text-black w-full flex items-center justify-center gap-3 bg-gray-50 border border-gray-300 rounded-full py-3 mb-4 hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <FaGoogle className="text-red-500" />
            <span>{loading ? "Processing..." : "Sign in with Google"}</span>
          </button>

          <button
            onClick={handleEmailLogin}
            disabled={loading || !email || !password}
            className="w-full bg-[#2a6435] text-white py-3 rounded-full hover:bg-green-950 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Login"}
          </button>

          <p className="mt-6 text-sm text-gray-600">
            Don&apos;t have account?{" "}
            <button
              onClick={() => router.push("./sign-up")}
              className="text-[#2a6435] hover:text-green-950 hover:underline font-medium"
            >
              Sign-Up
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center relative">
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h3>
            <p className="text-gray-600 text-sm mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {resetMessage}
              </div>
            )}

            <input
              type="email"
              placeholder="Enter Your Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={resetLoading}
              className="text-black w-full mb-6 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <div className="flex gap-3">
              <button
                onClick={closeForgotModal}
                disabled={resetLoading}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-full hover:bg-gray-300 transition-colors font-medium disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={resetLoading || !resetEmail}
                className="flex-1 bg-[#2a6435] text-white py-3 rounded-full hover:bg-green-950 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
