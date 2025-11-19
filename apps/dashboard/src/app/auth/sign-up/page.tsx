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
            errors.push("uppercase letter (A-Z)");
        }
        if (!hasLowerCase) {
            errors.push("lowercase letter (a-z)");
        }
        if (!hasNumbers) {
            errors.push("number (0-9)");
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
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/sign-up/matchmakingform?verified=true`,
                    data: {
                        full_name: email.split('@')[0],
                    }
                }
            });

            if (signUpError) throw signUpError;

            setSuccessMessage("Account created successfully! Please check your email for verification.");

            setTimeout(() => {
                router.replace("/auth/verify-email");
            }, 2000);
            
        } catch (err) {
            console.error("Signup error:", err);

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
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?source=signup`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    }
                }
            });

            if (error) throw error;
            
        } catch (err) {
            console.error("Google signup failed:", err);
            const authError = err as AuthError;
            setError(authError.message || "Google signup failed. Please try again.");
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div
            className="relative w-full h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/auth-img.png')" }}
        >
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                <h1 
                    className="text-xl sm:text-2xl text-white font-brand drop-shadow-lg"
                    style={{ transform: 'rotate(-3deg)' }}
                >
                    PACE ON
                </h1>
            </div>

            <div className="relative flex items-center justify-center h-full py-8">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-[#FB6F7A] mb-6">SIGN UP</h2>

                    {successMessage && (
                        <div className="bg-[#21C36E]/10 border border-[#21C36E] text-[#3F3E3D] px-4 py-3 rounded-lg mb-4 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="bg-[#FB6F7A]/10 border border-[#FB6F7A] text-[#3F3E3D] px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Enter Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="text-[#3F3E3D] w-full mb-4 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent disabled:bg-[#F4F4EF] disabled:cursor-not-allowed"
                    />

                    <div className="relative mb-2">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="text-[#3F3E3D] w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent disabled:bg-[#F4F4EF] disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FB6F7A] disabled:cursor-not-allowed"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {password && (
                        <div className="text-left mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#3F3E3D]">Password Strength:</span>
                                <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Must have: 8+ characters, uppercase, lowercase, numbers
                            </div>
                        </div>
                    )}

                    <div className="relative mb-4">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            className="text-[#3F3E3D] w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent disabled:bg-[#F4F4EF] disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FB6F7A] disabled:cursor-not-allowed"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {confirmPassword && (
                        <div className="text-left mb-5">
                            {password === confirmPassword ? (
                                <div className="text-green-600 text-sm">✓ Password Match</div>
                            ) : (
                                <div className="text-red-600 text-sm">✗ Password not Match</div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="w-full bg-[#FB6F7A] text-[#f4f4ef] py-3 rounded-full hover:bg-[#21c36e] transition-colors font-medium disabled:bg-gray-300 disabled:text-black disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-4"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>

                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-3 text-gray-500 text-sm">Or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="text-[#3F3E3D] w-full flex items-center justify-center gap-3 bg-[#F4F4EF] border border-gray-300 rounded-full py-3 mb-4 hover:bg-gray-100 transition-colors disabled:bg-[#F4F4EF] disabled:cursor-not-allowed"
                    >
                        <FaGoogle className="text-[#F47A49]" />
                        <span>{loading ? "Loading..." : "Sign up with Google"}</span>
                    </button>

                    <p className="mt-4 text-sm text-[#3F3E3D]">
                        Have Account?{" "}
                        <button
                            onClick={() => router.push("./login")}
                            disabled={loading}
                            className="text-[#FB6F7A] hover:text-[#D33181] hover:underline font-medium disabled:text-gray-400"
                        >
                            Login Here!
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}