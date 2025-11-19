"use client";

import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Verify Reset Token
    useEffect(() => {
        const verifyToken = async () => {
            if (!accessToken || type !== "recovery") {
                setError("Invalid or expired reset link.");
                setVerifying(false);
                return;
            }

            try {
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: searchParams.get("refresh_token") || "",
                });

                if (error) throw error;

                if (data.user) {
                    setEmail(data.user.email || "");
                } else {
                    throw new Error("No user found");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setError("Invalid or expired reset link.");
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [accessToken, type, searchParams]);

    // Handle Reset Password
    const handleResetPassword = async () => {
        setError("");
        
        if (!newPassword || !confirmPassword) {
            setError("Both fields are required.");
            return;
        }
        
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess(true);
            
            await supabase.auth.signOut();
            
            setTimeout(() => router.replace("/auth/login"), 3000);
        } catch (err) {
            console.error("Reset error:", err);
            const authError = err as AuthError;
            setError(authError.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.push("/auth/login");
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: "", color: "" };
        if (password.length < 6) return { strength: "Weak", color: "text-red-600" };
        if (password.length < 8) return { strength: "Medium", color: "text-[#F0C946]" };
        return { strength: "Strong", color: "text-[#21C36E]" };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    // Loading Verification Screen
    if (verifying) {
        return (
            <AuthLayout>
                <Card>
                    <div className="animate-spin h-12 w-12 border-4 border-[#FB6F7A] border-t-transparent mx-auto mb-4 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-[#3F3E3D]">Verifying Link...</h2>
                </Card>
            </AuthLayout>
        );
    }

    // Success Screen
    if (success) {
        return (
            <AuthLayout>
                <Card>
                    <FaCheckCircle className="text-[#21C36E] text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4 text-[#FB6F7A]">Password Reset Successful!</h2>
                    <p className="mb-6 text-sm text-[#3F3E3D]">
                        Redirecting you to login...
                    </p>
                    <Button onClick={handleBackToLogin}>Go to Login</Button>
                </Card>
            </AuthLayout>
        );
    }

    // Main Reset Form
    return (
        <AuthLayout>
            <Card>
                <h2 className="text-2xl font-bold mb-2 text-[#FB6F7A]">Reset Password</h2>
                {email && <p className="text-sm text-[#3F3E3D] mb-6">For: {email}</p>}
                {error && <Alert>{error}</Alert>}

                <PasswordInput
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNewPassword}
                    toggle={() => setShowNewPassword(!showNewPassword)}
                />

                {newPassword && (
                    <div className="text-left mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#3F3E3D]">Password Strength:</span>
                            <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Password must be at least 8 characters
                        </div>
                    </div>
                )}

                <PasswordInput
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                {confirmPassword && (
                    <div className="text-left mb-5">
                        {newPassword === confirmPassword ? (
                            <div className="text-[#21C36E] text-sm">✓ Passwords Match</div>
                        ) : (
                            <div className="text-[#FB6F7A] text-sm">✗ Passwords Do Not Match</div>
                        )}
                    </div>
                )}

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

/* Reusable Components */
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
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
        className={`w-full py-3 rounded-full font-medium mb-4 transition-colors shadow-lg hover:shadow-xl ${
            secondary
                ? "bg-[#fb6f7a] hover:bg-[#d33181] text-[#f4f4ef]"
                : "bg-[#C5C6D0] hover:bg-[#B0B1BD] text-[#3F3E3D]"
        } disabled:bg-gray-300 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const Alert = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#FB6F7A]/10 border border-[#FB6F7A] text-[#3F3E3D] px-4 py-3 rounded-lg mb-4 text-sm">
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
            className="text-[#3F3E3D] w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent disabled:bg-[#F4F4EF] disabled:cursor-not-allowed"
        />
        <button
            type="button"
            onClick={toggle}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FB6F7A]"
        >
            {show ? <FaEyeSlash /> : <FaEye />}
        </button>
    </div>
);