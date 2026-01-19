'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isMobileEventOpen, setIsMobileEventOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on homepage
  const isHomePage = pathname === '/';

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside - ✅ FIXED TYPE ERROR
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
    setIsEventDropdownOpen(false);
    setIsMobileEventOpen(false);
  };

  const handleLogoClick = () => {
    router.push('/');
    setIsMenuOpen(false);
    setIsEventDropdownOpen(false);
  };

  const handleLogin = () => {
    window.open('https://app.paceon.id', '_blank', 'noopener,noreferrer');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsMobileEventOpen(false);
    }
  };

  const toggleEventDropdown = () => {
    setIsEventDropdownOpen(!isEventDropdownOpen);
  };

  const toggleMobileEvent = () => {
    setIsMobileEventOpen(!isMobileEventOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isHomePage 
          ? (scrolled ? 'bg-[#f4f4ef] shadow-md' : 'bg-transparent')
          : 'bg-[#f4f4ef] shadow-md'
      }`}
    >
      <div className="max-w-9xl px-4 sm:px-6 lg:px-28 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - PACE ON */}
          <button
            onClick={handleLogoClick}
            className={`font-brand text-2xl sm:text-3xl font-brand transition-colors duration-300 logo-underline ${
              isHomePage && !scrolled ? 'text-[#5F0101]' : 'text-[#5F0101]'
            }`}
          >
            PACE <span className='text-[#FB6F7A]'>ON</span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xl">
            {/* Upcoming Event Link */}
            <button
              onClick={() => handleNavigation('/upcoming-event')}
              className={`logo-underline relative font-semibold transition-colors duration-300 ${
                isHomePage && !scrolled ? 'text-[#f4f4ef]' : 'text-gray-900'
              }`}
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              Upcoming Event
            </button>

            {/* Event Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleEventDropdown}
                className={`logo-underline relative font-semibold transition-colors duration-300 flex items-center gap-1 ${
                  isHomePage && !scrolled ? 'text-[#f4f4ef]' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
              >
                Event
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isEventDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 origin-top ${
                  isEventDropdownOpen
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <button
                  onClick={() => handleNavigation('/Talk-n-Tales')}
                  className="w-full text-left px-4 py-3 hover:bg-[#FB6F7A] hover:text-white transition-colors duration-200 font-semibold text-gray-900"
                  style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                >
                  Talk n Tales
                </button>
                <button
                  onClick={() => handleNavigation('/LOOP')}
                  className="w-full text-left px-4 py-3 hover:bg-[#FB6F7A] hover:text-white transition-colors duration-200 font-semibold text-gray-900"
                  style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                >
                  LOOP
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavigation('/house-rules')}
              className={`logo-underline relative font-bold transition-colors duration-300 ${
                isHomePage && !scrolled ? 'text-[#f4f4ef]' : 'text-gray-900'
              }`}
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              House Rules
            </button>

            <button
              onClick={() => handleNavigation('/contact')}
              className={`logo-underline relative font-bold transition-colors duration-300 ${
                isHomePage && !scrolled ? 'text-[#f4f4ef]' : 'text-gray-900'
              }`}
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              Contact
            </button>

            {/* Login Button - External link */}
            <button
              onClick={handleLogin}
              className="green-fill px-6 py-2 rounded-full font-bold bg-[#FB6F7A] text-[#f4f4ef] transition-all duration-300"
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              LOGIN
            </button>
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <button
            onClick={toggleMenu}
            className={`lg:hidden transition-colors duration-300 ${
              isHomePage && !scrolled && !isMenuOpen ? 'text-[#f4f4ef]' : 'text-gray-900'
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2 pb-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-4 shadow-lg">
            {/* Mobile Upcoming Event Link */}
            <button
              onClick={() => handleNavigation('/upcoming-event')}
              className="logo-underline relative font-semibold text-gray-900 text-left text-base py-2"
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              Upcoming Event
            </button>

            {/* Mobile Event Dropdown */}
            <div>
              <button
                onClick={toggleMobileEvent}
                className="logo-underline relative font-semibold text-gray-900 text-left text-base py-2 w-full flex items-center justify-between"
                style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
              >
                Event
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isMobileEventOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Mobile Event Sub-menu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isMobileEventOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#FB6F7A]">
                  <button
                    onClick={() => handleNavigation('/Talk-n-Tales')}
                    className="text-gray-700 hover:text-[#FB6F7A] text-left text-sm py-2 transition-colors duration-200"
                    style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                  >
                    Talk n Tales
                  </button>
                  <button
                    onClick={() => handleNavigation('/LOOP')}
                    className="text-gray-700 hover:text-[#FB6F7A] text-left text-sm py-2 transition-colors duration-200"
                    style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
                  >
                    LOOP
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleNavigation('/house-rules')}
              className="logo-underline relative font-semibold text-gray-900 text-left text-base py-2"
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              House Rules
            </button>

            <button
              onClick={() => handleNavigation('/contact')}
              className="logo-underline relative font-semibold text-gray-900 text-left text-base py-2"
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              Contact
            </button>

            {/* Mobile Login Button - External link */}
            <button
              onClick={handleLogin}
              className="green-fill px-6 py-2.5 rounded-full font-bold bg-[#D33181] text-white hover:bg-[#b42870] mt-2 transition-all duration-300"
              style={{ fontFamily: 'Outfit, Arial, Helvetica, sans-serif' }}
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .logo-underline {
          position: relative;
        }

        .logo-underline::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 3px;
          background: #21C36E;
          transition: width 0.3s ease;
        }

        .logo-underline:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}