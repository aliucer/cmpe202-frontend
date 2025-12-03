"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';


/**
 * RegisterButton Component
 * Displays a register button when user is not logged in, or Profile/Logout buttons when logged in.
 * 
 * Backend Integration Notes:
 * - TODO: Create a registration page/route at /register or /signup
 * - TODO: Implement registration API endpoint in backend (POST /api/auth/register)
 *   - Should accept: email, password, name, and other required user fields
 *   - Should validate input data (email format, password strength, etc.)
 *   - Should check if user already exists before creating new account
 *   - Should hash password before storing in database (use bcrypt or similar)
 *   - Should return appropriate error messages for validation failures
 *   - Should return user data and JWT token on successful registration
 * - TODO: Implement authentication check API endpoint (GET /api/auth/me)
 *   - Should verify JWT token from cookies/headers
 *   - Should return current user data if authenticated, 401 if not
 * - TODO: Implement logout API endpoint (POST /api/auth/logout)
 *   - Should invalidate session/token
 *   - Should clear authentication cookies
 * - TODO: Add form validation on the registration page
 * - TODO: Handle registration errors and display user-friendly messages
 * - TODO: Redirect user to appropriate page after successful registration (e.g., dashboard or home)
 * - TODO: Replace localStorage with proper session management (cookies + JWT tokens)
 * - TODO: Consider using NextAuth.js or similar authentication library for better state management
 */
export default function RegisterButton() {
    const [isAuthenticated] = useState<boolean>(false);
    //const [user, setUser] = useState<User | null>(null);
    const [isLoading] = useState<boolean>(false);
    //const router = useRouter();

    /**
     * Check authentication status on component mount
     * TODO: Replace with actual API call to backend auth endpoint
     * Example: GET /api/auth/me
     */
    useEffect(() => {
        const checkAuthStatus = async () => {
            // try {
            //     // TODO: Replace this with actual API call
            //     // const response = await fetch('/api/auth/me', {
            //     //     credentials: 'include', // Include cookies for authentication
            //     // });
            //     // if (response.ok) {
            //     //     const userData = await response.json();
            //     //     setUser(userData);
            //     //     setIsAuthenticated(true);
            //     // } else {
            //     //     setIsAuthenticated(false);
            //     //     setUser(null);
            //     // }

            //     // Temporary: Check localStorage for development
            //     // TODO: Remove this when backend authentication is implemented
            //     const storedUser = localStorage.getItem('user');
            //     if (storedUser) {
            //         // const userData = JSON.parse(storedUser);
            //         // setUser(userData);
            //         setIsAuthenticated(true);
            //     } else {
            //         setIsAuthenticated(false);
            //         // setUser(null);
            //     }
            // } catch (error) {
            //     console.error('Error checking auth status:', error);
            //     setIsAuthenticated(false);
            //     setUser(null);
            // } finally {
            //     setIsLoading(false);
            // }
        };
        console.log("Checking Authorization");
        checkAuthStatus();
    }, []);

    // Show loading state (optional - can be removed if not needed)
    if (isLoading) {
        return (
            <div className="px-4 py-2 text-gray-500">
                Loading...
            </div>
        );
    }
    // If user is authenticated, show Profile and Logout buttons
    else if (isAuthenticated) {
        return (
            <Link
                href="/register"
                className="px-4 py-2 bg-[#0033A0] text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Register for an account"
            >
                Register
            </Link>
            // <div className="flex items-center gap-3">

            //     <Link
            //         href="/profile"
            //         className="px-4 py-2 text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            //         aria-label="View profile"
            //     >
            //         Profile
            //     </Link>
            //     <button
            //         onClick={handleLogout}
            //         className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            //         aria-label="Logout"
            //     >
            //         Logout
            //     </button>
            // </div>
        );
    }
    else {
        // If user is not authenticated, show Register button
        return (
            <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Register for an account"
            >
                Register
            </Link>
        );
    }
}

