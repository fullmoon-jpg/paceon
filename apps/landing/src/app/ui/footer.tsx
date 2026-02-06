"use client"
import React from "react";
import Link from "next/link";
import { Phone, Instagram, Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-[#3f3e3d] text-white py-12 sm:py-16">
      <div className="w-full px-6 sm:px-8 lg:px-28">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Left: Contact Button + Info */}
          <div>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 yellow-fill bg-white text-black px-6 py-3 rounded-full font-brand transition-colors mb-6"
            >
              <Phone className="w-5 h-5" />
              Contact
            </Link>

            <div className="mt-8">
              <h3 className="font-brand text-3xl mb-3">
                PACE ON
              </h3>
              <p className="font-body text-white/80 mb-2">
                Keep The Pace On
              </p>
              <p className="font-body text-white/80">
                (+62) 819-9553-8939
              </p>
            </div>
          </div>

          {/* Right: Nav Links + Social */}
          <div className="flex flex-col items-start md:items-end">
            {/* Navigation Links */}
            <nav className="flex gap-6 mb-6">
              <Link 
                href="/"
                className="font-semibold font-outfit sm:text-md text-md md:text-xl lg:text-xl text-white hover:text-white/70 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/house-rules"
                className="font-semibold font-outfit sm:text-md text-md md:text-xl lg:text-xl text-white hover:text-white/70 transition-colors"
              >
                House Rules
              </Link>
              <Link 
                href="/upcoming-event"
                className="font-semibold font-outfit sm:text-md text-md md:text-xl lg:text-xl text-white hover:text-white/70 transition-colors"
              >
                Upcoming Event
              </Link>
              <Link 
                href="https://www.app.paceon.id"
                className="font-semibold font-outfit sm:text-md text-md md:text-xl lg:text-xl text-white hover:text-white/70 transition-colors"
              >
                Dashboard
              </Link>
            </nav>

            {/* Social Media Icons */}
            <div className="flex gap-3">
              <Link 
                href="https://instagram.com/paceon.id"
                target="_blank"
                className="w-12 h-12 border-2 border-white rounded-lg flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                aria-label="instagram-link"
              >
                <Instagram className="w-6 h-6" />
              </Link>
              <Link 
                href="https://wa.me/+6281995538939"
                target="_blank"
                className="w-12 h-12 border-2 border-white rounded-lg flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                aria-label="whatsapp-link"
              >
                <FaWhatsapp className="w-6 h-6" />
              </Link>
              <Link 
                href="https://linkedin.com/company/pace-on"
                target="_blank"
                className="w-12 h-12 border-2 border-white rounded-lg flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                aria-label="linkedin-link"
              >
                <Linkedin className="w-6 h-6" />
              </Link>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/20 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <p className="font-body text-sm text-white/70">
            © 2025 PACEON. All rights reserved. Build with Tech no Phi Agency
          </p>

          {/* Email + Back to Top */}
          <div className="flex items-center gap-6">
            <Link 
              href="mailto:hi@paceon.id"
              className="font-brand text-2xl sm:text-3xl md:text-4xl text-white hover:text-white/70 transition-colors"
            >
              HI@PACEON.ID
            </Link>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="up-button"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18" 
                />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;