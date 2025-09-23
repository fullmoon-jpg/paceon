"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardUrl } from "@paceon/config/constants";
import { Menu, X, ChevronDown } from 'lucide-react';

const PaceNavbar = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const handleGetStarted = () => {
        window.open(getDashboardUrl('/auth/sign-up'), '_blank', 'noopener,noreferrer');
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const handleLogoClick = () => {
        router.push('/');
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const handleHouseRules = () => {
        router.push('/house-rules');
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const handleContact = () => {
        router.push('/contact');
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isDropdownOpen) setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }
            if (
                menuRef.current &&
                !menuRef.current.contains(target) &&
                !(e.target as HTMLElement).closest('.menu-button')
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menu on ESC key
    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, []);

    return (
        <>
        <style jsx>{`
            .logo-underline::after {
                content: '';
                position: absolute;
                bottom: -3px;
                left: 0;
                width: 0;
                height: 3px;
                background: linear-gradient(90deg, #b43892, #352a64);
                transition: width 0.3s ease;
            }
            .logo-underline:hover::after {
                width: 100%;
            }

            .purple-fill::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                background: linear-gradient(135deg, #b43892, #352a64, #b43892);
                transition: height 0.4s ease;
                border-radius: 9999px;
                z-index: -1;
            }
            .purple-fill:hover::before {
                height: 100%;
            }

            .dropdown-enter {
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.2s ease-out;
            }
            
            .dropdown-enter-active {
                opacity: 1;
                transform: translateY(0);
            }

            @media (max-width: 640px) {
                .logo-text {
                    font-size: 1.5rem;
                }
            }
        `}</style>

        {/* Navbar */}
        <nav className="flex justify-between items-center px-4 sm:px-16 md:px-24 lg:px-40 py-4 bg-white backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm">
            
            {/* Logo */}
            <div 
                onClick={handleLogoClick}
                className="logo-underline logo-text relative bg-clip-text text-transparent bg-gradient-to-r from-[#15b392] to-[#2a6435] text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold font-brand tracking-tight cursor-pointer"
            >
                PACE.ON
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
                <button
                    onClick={handleHouseRules}
                    className="text-[#2a6435] hover:text-[#b43892] text-lg transition-colors font-medium"
                >
                    House Rules
                </button>

                <button
                    onClick={handleContact}
                    className="text-[#2a6435] hover:text-[#b43892] text-lg transition-colors font-medium"
                >
                    Contact
                </button>

                <button
                    onClick={handleGetStarted}
                    className="purple-fill relative overflow-hidden bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] text-white font-semibold px-6 py-3 text-base rounded-full transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-purple-600/40 active:transform active:translate-y-0 active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-md shadow-green-400/40"
                >
                    Get Started
                </button>
            </div>

            {/* Mobile/Tablet Dropdown */}
            <div className="md:hidden relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="menu-button flex items-center space-x-2 p-2 text-[#2a6435] hover:text-[#15b392] transition-colors focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <Menu size={24} />
                    <ChevronDown 
                        size={18} 
                        className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${isDropdownOpen ? 'dropdown-enter-active' : 'dropdown-enter'}`}>
                        <button
                            onClick={handleHouseRules}
                            className="w-full text-left px-4 py-3 text-[#2a6435] hover:bg-green-50 hover:text-[#15b392] transition-colors font-medium"
                        >
                            House Rules
                        </button>
                        
                        <button
                            onClick={handleContact}
                            className="w-full text-left px-4 py-3 text-[#2a6435] hover:bg-green-50 hover:text-[#15b392] transition-colors font-medium"
                        >
                            Contact
                        </button>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                            onClick={handleGetStarted}
                            className="w-full mx-2 green-fill relative overflow-hidden bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] text-white font-semibold px-4 py-3 text-sm rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400/50"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            {/* Overlay untuk mobile dropdown */}
            {isDropdownOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-transparent z-40"
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}
        </nav>
        </>
    );
};

export default PaceNavbar;
