"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminProfileDrawer from "@/components/Admin/AdminProfileDrawer";


export default function AdminHeader({ rightSlot }: { rightSlot?: ReactNode }) {
  const isAuthenticated = true;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 left-0 right-0 z-50 w-full">
      <div className="flex items-center justify-between w-full mx-auto px-8 py-3">
        {/*Left: Logo + Brand */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/cropped-SJSU-Spartan-Logo-colored.png"
              alt="SJSU logo"
              width={55}
              height={55}
              className="object-contain"
              priority
            />
            <span className="text-2xl font-bold text-[#0033A0] tracking-tight">
              SpartaXchange • Admin
            </span>
          </Link>
        </div>

        {/*Center-left (OPTIONAL): Mention that this is an Admin Page*/}


        {/*Right: Profile*/}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {rightSlot}
          <AdminProfileDrawer/>
        </div>
      </div>
    </header>
  );
}