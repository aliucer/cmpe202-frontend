"use client";

import { useEffect, useState } from "react";
import { getAuthToken, getApiBaseUrl } from "@/app/utils/authUtils";

interface ApiListingsResponse {
  listings: any[];
  total: number;
  page: number;
  limit: number;
}

interface ApiReportsResponse {
  reports: any[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminDashboard() {
  const [numListings, setNumListings] = useState<number>(0);
  const [numReports, setNumReports] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch all metrics in parallel using existing endpoints
        const [listingsResponse, reportsResponse] = await Promise.all([
          // Get total listings count - using limit=1 to minimize data transfer, we only need the total
          fetch(`${getApiBaseUrl()}/api/admin/listings?limit=1`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          // Get total reports count - using limit=1 to minimize data transfer, we only need the total
          fetch(`${getApiBaseUrl()}/api/admin/reports?limit=1`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // Check if any request failed
        if (!listingsResponse.ok || !reportsResponse.ok) {
          if (listingsResponse.status === 401 || reportsResponse.status === 401) {
            setError("You don't have permission to view this page.");
          } else {
            setError("Failed to load dashboard data. Please try again.");
          }
          setLoading(false);
          return;
        }

        // Parse responses
        const listingsData: ApiListingsResponse = await listingsResponse.json();
        const reportsData: ApiReportsResponse = await reportsResponse.json();

        // Update state with counts
        setNumListings(listingsData.total);
        setNumReports(reportsData.total);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        setError("An error occurred while loading dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-center text-5xl font-bold text-gray-900 mb-16 mt-6">
          Admin Dashboard
        </h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-center text-5xl font-bold text-gray-900 mb-16 mt-6">
          Admin Dashboard
        </h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center text-5xl font-bold text-gray-900 mb-16 mt-6">
        Admin Dashboard
      </h1>
      
      <div className="space-y-4">
        {/*KPI Cards:
              Stats and Overview */}
        <h2 className="text-2xl font-bold text-gray-900 mt-6">Key Performance Indicators</h2>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Total Listings", value: numListings },
            { label: "Reported Listings", value: numReports },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-500">{kpi.label}</div>
              <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}