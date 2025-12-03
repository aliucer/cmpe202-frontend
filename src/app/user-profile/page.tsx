"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserFromID, type PublicUserProfile } from "@/app/utils/userUtils";
import { getAuthToken, getUserData } from "@/app/utils/authUtils";

export default function UserProfilePage() {
  const params = useParams();
  const userIdParam = params?.id as string | undefined;
  
  // Get current logged-in user
  const currentUser = getUserData();
  const currentUserId = currentUser?.id;

  // Determine which user profile to show (use URL param or current user)
  const targetUserId = userIdParam || currentUserId;

  // State
  const [viewedUser, setViewedUser] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId && targetUserId && currentUserId === targetUserId;

  // Fetch user profile
  useEffect(() => {
    async function fetchProfileData() {
      if (!targetUserId) {
        setError("User ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const token = getAuthToken();
        if (!token) {
          setError("Please log in to view profiles");
          setLoading(false);
          return;
        }

        // Fetch user profile
        const userProfile = await getUserFromID(parseInt(targetUserId));
        setViewedUser(userProfile);
      } catch (err: any) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [targetUserId]);

  // ============================
  // 🎯 PAGE UI
  // ============================

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white text-black">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-gray-600">Loading profile...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white text-black">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!viewedUser) {
    return (
      <div className="flex flex-col min-h-screen bg-white text-black">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-gray-600">User not found</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />

      <main className="flex-1 bg-white text-black p-8 overflow-auto">
        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center mb-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <img
              src="/default-avatar.png"
              alt="User"
              className="w-28 h-28 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#0033A0]">
                {viewedUser.display_name}
              </h1>
              <p className="text-gray-700 mt-1">
                Member since:{" "}
                <span className="font-semibold">
                  {new Date(viewedUser.created_at).toLocaleDateString()}
                </span>
              </p>
              <div className="mt-3 flex gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-semibold">{viewedUser.stats.total_listings}</span>{" "}
                  Total Listings
                </div>
                <div>
                  <span className="font-semibold">{viewedUser.stats.active_listings}</span>{" "}
                  Active
                </div>
                <div>
                  <span className="font-semibold">{viewedUser.stats.sold_listings}</span>{" "}
                  Sold
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          {isOwner ? (
            <div className="flex gap-4 mt-6 md:mt-0">
              <Link href="/settings">
                <button className="bg-[#0033A0] text-white px-5 py-2 rounded-md hover:bg-[#00257a] transition">
                  Edit Profile
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 mt-6 md:mt-0">
              <button className="bg-[#0033A0] text-white px-5 py-2 rounded-md hover:bg-[#00257a] transition">
                Message
              </button>
              <button className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition">
                Report User
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
