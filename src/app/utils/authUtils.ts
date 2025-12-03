// NOTE: THIS MAY BE DEPRECATED WITH WHAT KALYANI HAS DONE



const DEFAULT_API_BASE_URL = "http://localhost:4000";

export const getApiBaseUrl = (): string => {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

const TOKEN_KEY = "token"; // Changed to match what login/register pages use
const USER_KEY = "user_data";

export type User = {
    id: string;
    email: string;
    display_name: string;
    is_admin: boolean;
};

/**
 * Get the stored authentication token
 */
export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store authentication token and user data
 */
export function setAuthData(token: string, user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored user data
 */
export function getUserData(): User | null {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    try {
        return JSON.parse(userData) as User;
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated by verifying token with backend
 */
export async function checkAuthStatus(): Promise<boolean> {
    const token = getAuthToken();
    if (!token) return false;

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const userData = await response.json();
            // Update stored user data in case it changed
            setAuthData(token, userData);
            return true;
        } else if (response.status === 401 || response.status === 403) {
            // Only clear token on authentication errors, not server errors
            console.warn("Token is invalid, clearing auth data");
            clearAuthData();
            return false;
        } else {
            // Server error (500, etc.) - don't clear token, might be backend issue
            console.error("Backend error checking auth status:", response.status);
            // Return true if we have a token, even if backend check failed
            // This prevents users from being logged out due to backend issues
            return true;
        }
    } catch (error) {
        console.error("Error checking auth status:", error);
        // On network error, don't clear token - might be backend down
        // Return true if token exists, to prevent false logouts
        return token !== null;
    }
}

/**
 * Check if user is authenticated (synchronous check using stored token)
 * This is a quick check without API call - use checkAuthStatus for verification
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

