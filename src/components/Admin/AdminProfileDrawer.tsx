"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { clearAuthData } from "@/app/utils/authUtils";

export default function AdminProfileDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear auth data
    clearAuthData();
    
    // Dispatch event to notify Header of auth change
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // Close dropdown
    setIsOpen(false);
    
    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#0033A0]/10 transition"
      >
        <Image
          src="/default-avatar.png"
          alt="User avatar"
          width={26}
          height={26}
          className="object-contain rounded-full grayscale brightness-50 contrast-75 invert-[20%]"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
          <ul className="text-gray-700 text-sm">
            <li 
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600 font-medium"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

