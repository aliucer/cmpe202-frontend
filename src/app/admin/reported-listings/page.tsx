"use client";

import ReportedListingsTable from "@/components/Admin/ReportedListingsTable";
import { getUserData } from "@/app/utils/authUtils";
import { useEffect, useState } from "react";

export default function ReportedListingsPage() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = () => {
            const userData = getUserData();
            if (!userData) {
                // Not logged in - redirect or show error
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            if (!userData.is_admin) {
                // Not an admin
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            // User is admin
            setIsAdmin(true);
            setIsLoading(false);
        };

        checkAdminStatus();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-red-600 text-center">
                    <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                    <p>You don't have permission to access this page. Admin access required.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Reported Listings
                </h1>
                <p className="text-gray-600 text-lg">
                    Review and manage listing reports from users
                </p>
            </div>

            <ReportedListingsTable />
        </div>
    );
}
