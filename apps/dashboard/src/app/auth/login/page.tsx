"use client";

import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../../../../packages/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../../packages/lib/firebaseConfig"; // pastikan db diexport di firebaseConfig.ts

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

  // Ambil role user dari Firestore
  const getUserRole = async (uid: string): Promise<string> => {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return (snap.data().role as string) || "user"; // default user
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
    return "user";
  };

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const role = await getUserRole(uid);

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      const errorObj = err as Record<string, unknown>;
      const code = errorObj?.code as string | undefined;

      switch (code) {
        case "auth/user-not-found":
          setError("Email is not registered. Please register first.");
          break;
        case "auth/wrong-password":
          setError("Wrong password. Please check your password again.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/too-many-requests":
          setError("Too many login attempts. Please try again later.");
          break;
        default:
          setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const uid = result.user.uid;
      const role = await getUserRole(uid);

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const code = errorObj?.code as string | undefined;

      if (code === "auth/popup-closed-by-user") {
        setLoading(false);
        return;
      }

      console.error("Google login failed:", err);
      setError("Google login failed. Please try again.");
    } finally {
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
      // Custom action URL to redirect to your Vercel domain
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`, // Redirect ke /reset-password page
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      
      setResetMessage("Password reset email sent! Check your inbox and follow the instructions.");
      setResetEmail("");
      
      // Auto close modal after 3 seconds
      setTimeout(() => {
        setShowForgotModal(false);
        setResetMessage("");
      }, 3000);

    } catch (err: unknown) {
      console.error("Password reset error:", err);
      
      const errorObj = err as Record<string, unknown>;
      const code = errorObj?.code as string | undefined;

      switch (code) {
        case "auth/user-not-found":
          setResetError("Email is not registered.");
          break;
        case "auth/invalid-email":
          setResetError("Invalid email format.");
          break;
        case "auth/too-many-requests":
          setResetError("Too many requests. Please try again later.");
          break;
        default:
          setResetError("An error occurred. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Open forgot password modal
  const openForgotModal = () => {
    setShowForgotModal(true);
    setResetError("");
    setResetMessage("");
    setResetEmail(email); // Pre-fill with login email if available
  };

  // Close forgot password modal
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
      {/* ✅ Brand Logo */}
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
                className="flex-1 bg-[#2a6435] hover:text-green-950] text-white py-3 rounded-full hover:bg-green-950 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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