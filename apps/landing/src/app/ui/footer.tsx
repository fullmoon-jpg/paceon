"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Linkedin, Instagram, ArrowUp } from 'lucide-react';
import { getDashboardUrl } from '@paceon/config/constants';

const PaceOnFooter: React.FC = () => {
    const router = useRouter();

    const scrollToTop = (): void => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGetStarted = (): void => {
        window.open(getDashboardUrl('/auth/sign-up'), '_blank', 'noopener,noreferrer');
    };

    const handleLogin = (): void => {
        window.open(getDashboardUrl('/auth/login'), '_blank', 'noopener,noreferrer');
    };

    const handleHouseRules = () => {
        router.push('/house-rules');
    }

    const handleContact = () => {
        router.push('/contact');
    }

    // Navigation handlers untuk cross-page navigation
    const handleAboutUs = (): void => {
        // Cek apakah sudah di home page atau belum
        if (window.location.pathname === '/') {
            // Kalo di home, scroll ke section about
            const aboutSection = document.getElementById('about-us');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Kalo di page lain, redirect ke home dengan hash
            router.push('/#about-us');
        }
    };

    const handleUserFlow = (): void => {
        if (window.location.pathname === '/') {
            const userFlowSection = document.getElementById('user-flow');
            if (userFlowSection) {
                userFlowSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            router.push('/#user-flow');
        }
    };

    const handleHome = (): void => {
        if (window.location.pathname === '/') {
            scrollToTop();
        } else {
            router.push('/');
        }
    };

    const menuItems = [
        { name: "About Us", action: handleAboutUs },
        { name: "User Flow", action: handleUserFlow },
        { name: "House Rulse", action: handleHouseRules },
    ];

    const quickLinks = [
        { name: "Home", action: handleHome },
        { name: "Sign Up", action: handleGetStarted },
        { name: "Login", action: handleLogin },
        { name: "Contact", action: handleContact },
    ];

    return (
        <footer className="bg-white border-t-4 border-gray-100 py-12 px-10 md:px-20 lg:px-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                
                    {/* Left Section - Logo & Description */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <img 
                                src="/images/logo-paceon.png"
                                alt="PACE.ON Logo"
                                className="w-16 h-16 object-contain"
                            />
                            <h3 className="text-3xl lg:text-4xl font-brand font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#15b392] to-[#2a6435]">
                                PACE.ON
                            </h3>
                        </div>
                        <p className="text-black text-base lg:text-lg max-w-md leading-relaxed mb-6">
                            Build Real Connection, Keep The Pace On
                        </p>
                        <p className="text-gray-700 text-sm max-w-md leading-relaxed">
                            Connect with founders and professionals through sports activities. 
                            Play padel, tennis, and build meaningful relationships while staying active.
                        </p>
                        
                        {/* Social Media */}
                        <div className="mt-8">
                            <h4 className="text-black font-semibold mb-4 text-lg">Connect With Us</h4>
                            <div className="flex gap-3">
                                <a 
                                    href="mailto:hi@paceon.id" 
                                    className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 transition-all duration-200"
                                    aria-label="Email us"
                                >
                                    <Mail size={20} />
                                </a>
                                <a 
                                    href="https://wa.me/628558451534" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-green-500 hover:text-white hover:border-green-500 hover:scale-105 transition-all duration-200"
                                    aria-label="WhatsApp us"
                                >
                                    <Phone size={20} />
                                </a>
                                <a 
                                    href="https://www.linkedin.com/company/pace-on/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 transition-all duration-200"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin size={20} />
                                </a>
                                <a 
                                    href="https://www.instagram.com/paceon.id" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:scale-105 transition-all duration-200"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Navigation */}
                    <div className="flex flex-col lg:-mt-20 lg:flex-row gap-12 lg:gap-20">
                        {/* PACE.ON Links */}
                        <div>
                            <h4 className="text-black font-semibold mb-6 text-lg">Explore</h4>
                            <ul className="space-y-3">
                                {menuItems.map((item, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={item.action}
                                            className="text-gray-700 hover:text-[#15b392] transition-colors text-base font-open-sans font-bold text-left"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-black font-semibold mb-6 text-lg">Quick Actions</h4>
                            <ul className="space-y-3">
                                {quickLinks.map((item, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={item.action}
                                            className="text-gray-700 hover:text-[#15b392] transition-colors text-base font-open-sans font-bold text-left"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-16 pt-8 border-t border-gray-200">
                    <div className="text-center sm:text-left">
                        <p className="text-black text-sm mb-2">
                            © 2025 PACE.ON | All Rights Reserved.
                        </p>
                        <p className="text-gray-700 text-xs">
                            Made with ❤️ for sports networking community
                        </p>
                    </div>
                    
                    {/* Scroll to Top Button */}
                    <button
                        onClick={scrollToTop}
                        className="mt-6 sm:mt-0 w-10 h-10 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-full flex items-center justify-center hover:from-[#2a6435] hover:to-[#15b392] hover:scale-110 transition-all duration-200 shadow-lg"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default PaceOnFooter;