"use client";

import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../../../../../packages/lib/firebaseConfig";

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
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

  // Get password strength indicator
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

    // Send welcome email function
    const sendWelcomeEmail = async (userEmail: string, userName?: string) => {
        if (!userEmail) {
            console.warn("No email provided, skipping welcome email.");
            return;
        }

        try {
        console.log("Sending welcome email to:", userEmail);
        
        const response = await fetch("/api/sendWelcomeEmail", {
            method: "POST",
            headers: { 
            "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
            email: userEmail, 
            name: userName || userEmail.split('@')[0]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server returned error:", errorText);
            return;
        }

        const data = await response.json();
        console.log("Welcome email sent:", data);

        } catch (err) {
        console.error("Network request failed:", err);
        }
    };

    // Handle email signup
    const handleSignUp = async () => {
        // Reset error
        setError("");

        // Basic validation
        if (!email || !password || !confirmPassword) {
        setError("All fields are required.");
        return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        setError("Invalid format email");
        return;
        }

        // Password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
        setError(`Password must have: ${passwordValidation.errors.join(", ")}`);
        return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
        setError("Confirm password does not match");
        return;
        }

        try {
        console.log("🔄 Creating user with email:", email);
        
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("User created successfully");

        // Send welcome email
        await sendWelcomeEmail(email, email.split('@')[0]);

        // Redirect to matchmaking
        router.push("/auth/sign-up/matchmakingform");
        
        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "code" in err) {
                const errorCode = (err as { code: string }).code;

                switch (errorCode) {
                    case "auth/email-already-in-use":
                        setError("Email is already registered. Use another email or login.");
                        break;
                    case "auth/weak-password":
                        setError("Password is too weak. Use a combination of letters, numbers, and symbols.");
                        break;
                    case "auth/invalid-email":
                        setError("Invalid format email.");
                        break;
                    default:
                        setError("An error occurred. Please try again later.");
                }
            } else {
                console.error("Unexpected signup error:", err);
                setError("Something went wrong. Please try again.");
            }
        }
    };

    // Handle Google signup
    const handleGoogleSignUp = async () => {
        try {
        console.log("Starting Google signup...");
        
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        const userEmail = result.user.email || "";
        const userName = result.user.displayName || userEmail.split('@')[0];

        console.log("Google signup successful");

        // Send welcome email
        await sendWelcomeEmail(userEmail, userName);

        // Redirect to matchmaking
        router.push("./sign-up/matchmakingform");
        
        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "code" in err) {
                const errorCode = (err as { code: string }).code;

                if (errorCode === "auth/popup-closed-by-user") {
                    console.log("ℹ User closed popup");
                    return;
                }
            }

            console.error("Google signup failed:", err);
            setError("Google signup failed. Please try again.");
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
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
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center">
            <h2 className="text-2xl font-bold text-[#1f4381] mb-6">SIGN UP</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
                </div>
            )}

            {/* Email Input */}
            <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black w-full mb-4 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
            />

            {/* Password Input */}
            <div className="relative mb-2">
                <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            {/* Password Strength Indicator */}
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

            {/* Confirm Password Input */}
            <div className="relative mb-6">
                <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-black w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent"
                />
                <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
                <div className="text-left mb-4">
                {password === confirmPassword ? (
                    <div className="text-green-600 text-sm">✓ Password Match</div>
                ) : (
                    <div className="text-red-600 text-sm">✗ Password not Match</div>
                )}
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-3 text-gray-500 text-sm">Or</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Google Sign Up Button */}
            <button
                onClick={handleGoogleSignUp}
                className="text-black w-full flex items-center justify-center gap-3 bg-gray-50 border border-gray-300 rounded-full py-3 mb-4 hover:bg-gray-100 transition-colors"
            >
                <FaGoogle className="text-red-500" />
                <span>Sign-up with Google</span>
            </button>

            {/* Email Sign Up Button */}
            <button
                onClick={handleSignUp}
                className="w-full bg-[#2a6435] text-white py-3 rounded-full hover:bg-green-950 transition-colors font-medium"
            >
                Sign Up
            </button>

            {/* Login Link */}
            <p className="mt-6 text-sm text-gray-600">
                Have Account?{" "}
                <button
                onClick={() => router.push("./login")}
                className="text-[#2a6435] hover:text-green-950 hover:underline font-medium"
                >
                Login Here!
                </button>
            </p>
            </div>
        </div>
        </div>
    );
}