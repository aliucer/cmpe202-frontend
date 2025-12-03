"use client";

import { useState } from "react";

import Link from "next/link";
import HeaderLogoOnly from "../../components/LoginPage/HeaderLogo";
import PasswordInput from "../../components/LoginPage/PasswordInput";
import { setAuthData, getApiBaseUrl } from "@/app/utils/authUtils";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    let valid = true;

    // Name
    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    // Email
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email.");
      valid = false;
    } else if (!email.toLowerCase().endsWith("@sjsu.edu")) {
      setEmailError("Please use your SJSU email address (ends with @sjsu.edu).");
      valid = false;
    } else {
      setEmailError("");
    }

    // Password
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Registration failed.");
        return;
      }

      // Store auth data using authUtils
      setAuthData(data.token, {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        is_admin: data.is_admin,
      });

      // Dispatch event to notify Header of auth change
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      window.location.href = "/landingpage";

    } catch {
      setSubmitError("Network error. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderLogoOnly />

      <div className="flex flex-1 justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-96">

          <h1 className="text-2xl font-semibold mb-4 text-center text-[#0033A0]">
            Register
          </h1>

          {submitError && (
            <p className="text-red-500 text-center mb-3">{submitError}</p>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            {/* FULL NAME */}
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Full Name"
                className={`border p-2 rounded text-black ${
                  nameError ? "border-red-500" : ""
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
            </div>

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

            {/* PASSWORD */}
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
              Register
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-700">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0033A0] font-medium">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
