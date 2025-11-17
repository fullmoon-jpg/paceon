"use client";

import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        const errors = [];
        if (password.length < minLength) {
            errors.push("Minimum 8 Characters");
        }
        if (!hasUpperCase) {
            errors.push("huruf besar (A-Z)");
        }
        if (!hasLowerCase) {
            errors.push("huruf kecil (a-z)");
        }
        if (!hasNumbers) {
            errors.push("angka (0-9)");
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    const getPasswordStrength = (password: string) => {
        const validation = validatePassword(password);
        if (password.length === 0) return { strength: "", color: "" };
        
        if (validation.isValid) {
            return { strength: "Strong", color: "text-green-600" };
        } else if (password.length >= 6) {
            return { strength: "Medium", color: "text-yellow-600" };
        } else {
            return { strength: "Weak", color: "text-red-600" };
        }
    };

    const handleSignUp = async () => {
        setError("");
        setSuccessMessage("");
        setLoading(true);

        // Validation
        if (!email || !password || !confirmPassword) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid format email");
            setLoading(false);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(`Password must have: ${passwordValidation.errors.join(", ")}`);
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Confirm password does not match");
            setLoading(false);
            return;
        }

        try {
            console.log("🔄 Creating user with Supabase...");
            
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    // 🔧 FIX: Redirect langsung ke matchmaking form untuk email signup
                    emailRedirectTo: `${window.location.origin}/auth/sign-up/matchmakingform?verified=true`,
                    data: {
                        full_name: email.split('@')[0],
                    }
                }
            });

            if (signUpError) throw signUpError;

            console.log("✅ User created:", data.user?.email);

            setSuccessMessage("Account created successfully! Please check your email for verification.");

            // 🔧 FIX: Redirect ke verification page
            setTimeout(() => {
                router.replace("/auth/verify-email");
            }, 2000);
            
        } catch (err) {
            console.error("❌ Signup error:", err);

            const authError = err as AuthError;

            if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
                setError("Email is already registered. Use another email or login.");
            } else if (authError.message.includes("Password")) {
                setError("Password is too weak.");
            } else {
                setError(authError.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError("");

        try {
            console.log("🔄 Starting Google OAuth for signup...");
            
            // 🔧 FIX: Gunakan callback route dengan flow parameter
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?source=signup`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account', // 🔧 Changed: Allow account selection
                    }
                }
            });

            if (error) throw error;

            console.log("✅ Redirecting to Google...");
            
        } catch (err) {
            console.error("❌ Google signup failed:", err);
            const authError = err as AuthError;
            setError(authError.message || "Google signup failed. Please try again.");
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div
            className="relative w-full h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login-img.webp')" }}
        >
            <div className="absolute inset-0 bg-black/50" />
            
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-brand">PACE.ON</h1>
            </div>

            <div className="relative flex items-center justify-center h-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center">
                    <h2 className="text-2xl font-bold text-[#1f4381] mb-6">SIGN UP</h2>

                    {successMessage && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-green-800 font-medium text-sm">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Enter Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="text-black w-full mb-4 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent disabled:bg-gray-100"
                    />

                    <div className="relative mb-2">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="text-black w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent disabled:bg-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {password && (
                        <div className="text-left mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Password Strength:</span>
                                <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Password must have: minimum 8 characters, uppercase letters, lowercase letters, numbers
                            </div>
                        </div>
                    )}

                    <div className="relative mb-6">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            className="text-black w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent disabled:bg-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {confirmPassword && (
                        <div className="text-left mb-4">
                            {password === confirmPassword ? (
                                <div className="text-green-600 text-sm">✓ Password Match</div>
                            ) : (
                                <div className="text-red-600 text-sm">✗ Password not Match</div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-3 text-gray-500 text-sm">Or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="text-black w-full flex items-center justify-center gap-3 bg-gray-50 border border-gray-300 rounded-full py-3 mb-4 hover:bg-gray-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                        <FaGoogle className="text-red-500" />
                        <span>{loading ? "Loading..." : "Sign-up with Google"}</span>
                    </button>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="w-full bg-[#2a6435] text-white py-3 rounded-full hover:bg-green-950 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>

                    <p className="mt-6 text-sm text-gray-600">
                        Have Account?{" "}
                        <button
                            onClick={() => router.push("./login")}
                            disabled={loading}
                            className="text-[#2a6435] hover:text-green-950 hover:underline font-medium disabled:text-gray-400"
                        >
                            Login Here!
                        </button>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}