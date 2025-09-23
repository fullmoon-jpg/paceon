"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
    // 🚫 Matikan scroll body pas modal kebuka
    useEffect(() => {
        if (isOpen) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "";
        }
        return () => {
        document.body.style.overflow = "";
        };
    }, [isOpen]);

    

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl mx-auto min-h-screen p-12 relative border border-green-100"
                onClick={(e) => e.stopPropagation()} // 👉 biar klik isi modal ga nutup
            >
                {/* Tombol Close */}
                <button
                onClick={onClose}
                className="absolute top-8 right-8 text-gray-500 hover:text-red-500 transition-colors duration-200 bg-white rounded-full p-2 shadow-lg hover:shadow-xl"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                {title && (
                    <h2 className="text-5xl font-black text-[#1f4381] mb-16 text-center">
                        {title}
                    </h2>
                )}

                {/* Konten Modal */}
                <div className="space-y-24">{children}</div>
            </div>
        </div>
    );
};

export default BaseModal;
