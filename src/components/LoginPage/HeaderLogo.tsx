"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeaderLogoOnly() {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="flex items-center gap-3 py-3 px-4"> 
        {/* Logo */}
        <Image
          src="/cropped-SJSU-Spartan-Logo-colored.png"
          alt="SpartaXchange Logo"
          width={40}
          height={40}
          className="object-contain"
        />

        {/* Text */}
        <Link
          href="/"
          className="text-2xl font-semibold text-[#0033A0]" // SJSU blue
        >
          SpartaXchange
        </Link>
      </div>
    </header>
  );
}
