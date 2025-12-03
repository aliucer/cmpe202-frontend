"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { clearAuthData, getAuthToken, getApiBaseUrl, getUserData, setAuthData } from "@/app/utils/authUtils";
import type { User } from "@/app/utils/authUtils";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    display_name: "",
    email: "",
    photo: "/default-avatar.png",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  // Fetch current user data on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          router.push("/login");
          return;
        }

        // Get user data from localStorage first (quick load)
        const cachedUser = getUserData();
        if (cachedUser) {
          setUser({
            display_name: cachedUser.display_name,
            email: cachedUser.email,
            photo: "/default-avatar.png",
          });
        }

        // Fetch fresh data from backend
        const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData: User = await response.json();
        setUser({
          display_name: userData.display_name,
          email: userData.email,
          photo: "/default-avatar.png",
        });
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, photo: imageUrl }));
    }
  };

  const handleLogout = () => {
    // Clear auth data
    clearAuthData();
    
    // Dispatch event to notify Header of auth change
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // Redirect to landing page
    router.push("/landingpage");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      // Call PUT /api/users/me
      const response = await fetch(`${getApiBaseUrl()}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: user.display_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedUser: User = await response.json();
      
      // Update localStorage with new user data
      setAuthData(token, updatedUser);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <Header />

      <main className="flex-1 px-6 md:px-16 py-10 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-3xl font-bold text-[#0033A0] mb-8">Settings</h1>

          {/* ACCOUNT SETTINGS */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-[#0033A0]">
              Account Settings
            </h2>

            <div className="flex items-center gap-6 mb-6">
              <img
                src={user.photo}
                alt="User avatar"
                className="w-24 h-24 rounded-full object-cover border-0 border-[#0033A0]"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Profile Photo
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium">Display Name</label>
                <input
                  type="text"
                  value={user.display_name}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev, display_name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border border-gray-300 rounded-md p-2 mt-1 bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button className="text-red-600 border border-red-600 px-3 py-2 rounded-md hover:bg-red-600 hover:text-white transition">
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          {/* NOTIFICATION SETTINGS */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-[#0033A0]">
              Notification Settings
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  Email Notifications
                </span>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      email: !prev.email,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    notifications.email ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      notifications.email ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  Push Notifications
                </span>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      push: !prev.push,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    notifications.push ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      notifications.push ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              Profile updated successfully!
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="bg-[#0033A0] text-white px-6 py-2 rounded-md hover:bg-[#002070] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
