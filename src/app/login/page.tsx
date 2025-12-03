"use client";

import { useState } from "react";

import Link from "next/link";
import HeaderLogoOnly from "@/components/LoginPage/HeaderLogo";
import PasswordInput from "@/components/LoginPage/PasswordInput";
import { setAuthData, getApiBaseUrl } from "@/app/utils/authUtils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    let valid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email.");
      valid = false;
    } else {
      setEmailError("");
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMessage = "Invalid login.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Login error response:", errorData, "Status:", res.status);
        } catch (parseError) {
          const textError = await res.text().catch(() => "Unknown error");
          console.error("Login error (non-JSON):", textError, "Status:", res.status);
          errorMessage = textError || errorMessage;
        }
        setSubmitError(errorMessage);
        return;
      }

      const data = await res.json();

      // Store auth data using authUtils
      setAuthData(data.token, {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        is_admin: data.is_admin,
      });

      // Dispatch event to notify Header of auth change
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      // Redirect based on admin status
      if (data.is_admin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/landingpage";
      }

    } catch (error: any) {
      console.error("Login network error:", error);
      setSubmitError("Network error. Make sure the backend server is running on port 4000.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderLogoOnly />

      <div className="flex flex-1 justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-96">

          <h1 className="text-2xl font-semibold mb-4 text-center text-[#0033A0]">
            Login
          </h1>

          {submitError && (
            <p className="text-red-500 text-center mb-3">{submitError}</p>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* EMAIL */}
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                className={`border p-2 rounded text-black ${
                  emailError ? "border-red-500" : ""
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            </div>

            {/* PASSWORD WITH TOGGLE */}
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Password"
              error={passwordError}
            />

            <button
              type="submit"
              className="bg-[#0033A0] text-white py-2 rounded hover:bg-[#00297A]"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-700">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#0033A0] font-medium">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
