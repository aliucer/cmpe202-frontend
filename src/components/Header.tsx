"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MessageDrawer from "@/components/MessageDrawer";
import NotificationDrawer from "@/components/NotificationDrawer";
import ProfileDrawer from "@/components/ProfileDrawer";
import { checkAuthStatus, isAuthenticated as checkHasToken } from "@/app/utils/authUtils";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // Quick check first
      const hasToken = checkHasToken();
      setIsAuthenticated(hasToken);

      // Then verify with backend if token exists
      if (hasToken) {
        const isValid = await checkAuthStatus();
        setIsAuthenticated(isValid);
      }

      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between w-full px-8 py-3">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/cropped-SJSU-Spartan-Logo-colored.png"
              alt="SJSU logo"
              width={55}
              height={55}
              className="object-contain"
              priority
            />
            <span className="text-2xl font-bold text-[#0033A0] tracking-tight">
              SpartaXchange
            </span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-20 text-gray-700 font-medium">
          <Link href="/landingpage" className="hover:text-[#0033A0] transition">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/seller/dashboard"
                className="hover:text-[#0033A0] transition"
              >
                My Dashboard
              </Link>
              <Link
                href="/seller/new-listings"
                className="hover:text-[#0033A0] transition"
              >
                New Listing
              </Link>
            </>
          )}
        </nav>

        {/* Right: Icons (Messages, Notifications, Profile) or Login/Register */}
        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : isAuthenticated ? (
            <>
              {/* Messages */}
              <div className="w-10 h-10 flex items-center justify-center hover:bg-[#0033A0]/10 rounded-full transition">
                <MessageDrawer />
              </div>

              {/* Notifications */}
              <div className="w-10 h-10 flex items-center justify-center hover:bg-[#0033A0]/10 rounded-full transition">
                <NotificationDrawer />
              </div>

              {/* Profile */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#0033A0]/10 transition">
                <ProfileDrawer />
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              {/* Register Button */}
              <Link
                href="/register"
                className="px-4 py-2 bg-[#0033A0] text-white font-medium rounded-md hover:bg-[#0033A0]/90 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
