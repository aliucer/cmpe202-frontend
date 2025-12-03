"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import AdminHeader from "@/components/Admin/AdminHeader";
import AIHeader from "./AIHeader";
import { getUserData } from "@/app/utils/authUtils";


export default function AdminShell({
    sidebar,
    children,
}: {
    sidebar: ReactNode;
    children: ReactNode;
}) {
    const [adminInfo, setAdminInfo] = useState<{ display_name: string; email: string } | null>(null);

    useEffect(() => {
        const userData = getUserData();
        if (userData) {
            setAdminInfo({
                display_name: userData.display_name,
                email: userData.email,
            });
        }
    }, []);

    const adminInfoSlot = adminInfo ? (
        <div className="flex flex-col items-end text-right">
            <span className="font-medium text-gray-900">{adminInfo.display_name}</span>
            <span className="text-xs text-gray-500">{adminInfo.email}</span>
        </div>
    ) : null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/*Full-width header across the top*/}
            <AdminHeader rightSlot={adminInfoSlot}/>
            
            {/* Fixed sidebar on the left */}
            <aside className="hidden md:block fixed left-0 top-20 bottom-0 w-60 border-r bg-white z-40 overflow-y-auto">
                {sidebar}
            </aside>

            {/* Page content with left margin to account for fixed sidebar */}
            <main className="bg-white-100 md:ml-50 min-h-[calc(100vh-4rem)] pt-8">
                <div className="mx-auto max-w-90/100 px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
