"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface AIHeaderProps {
  rightSlot?: ReactNode;
  userEmail?: string;
  userDisplayName?: string;
  userAvatar?: string;
  isAuthenticated?: boolean;
}

export default function AIHeader({
  rightSlot,
  userEmail = "admin@campus.edu",
  userDisplayName,
  userAvatar,
  isAuthenticated = true,
}: AIHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    // TODO: Implement logout functionality
    // Example: await fetch('/api/auth/logout', { method: 'POST' });
    console.log("Logout clicked");
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50 w-full">
      <div className="flex items-center justify-between w-full mx-auto px-6 py-2.5">
        {/* Left: Logo - links to admin dashboard */}
        <div className="flex items-center">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="SpartaXchange Admin Dashboard"
          >
            <Image
              src="/cropped-SJSU-Spartan-Logo-colored.png"
              alt="SJSU logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Right: Profile Section */}
        <div className="flex items-center gap-3">
          {rightSlot}
          
          {isAuthenticated && (
            <div className="relative" ref={menuRef}>
              {/* Profile Button */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:ring-offset-2"
                aria-label="Profile menu"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {userDisplayName || "Profile"}
                </span>
                <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 hover:ring-[#0033A0]/30 transition-all">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt="User avatar"
                      width={28}
                      height={28}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xs text-gray-600 font-medium">
                      {userDisplayName?.[0]?.toUpperCase() || userEmail[0]?.toUpperCase() || "A"}
                    </span>
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-opacity duration-200"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {userDisplayName || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {userEmail}
                    </p>
                  </div>
                  
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <Link
                        href="/admin"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                        role="menuitem"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                        role="menuitem"
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                        role="menuitem"
                      >
                        My Profile
                      </Link>
                    </li>
                    <li className="border-t border-gray-200 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600 font-medium"
                        role="menuitem"
                      >
                        Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

