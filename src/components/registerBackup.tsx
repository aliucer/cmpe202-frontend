
import {useState} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { setAuthData } from "@/app/utils/authUtils";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

const getApiBaseUrl = (): string => {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    display_name: displayName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                setAuthData(data.token, {
                    id: data.id,
                    email: data.email,
                    display_name: data.display_name,
                    is_admin: data.is_admin,
                });

                // Redirect to landing page
                router.push("/landingpage");
                router.refresh(); // Refresh to update header
            } else {
                setError(data.message || data.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error("Registration error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center items-center gap-2 mb-8">
                    <Image
                        src="/cropped-SJSU-Spartan-Logo-colored.png"
                        alt="SJSU logo"
                        width={55}
                        height={55}
                        className="object-contain"
                    />
                    <span className="text-2xl font-bold text-[#0033A0] tracking-tight">
                        SpartaXchange
                    </span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Must use a campus email address (e.g., @sjsu.edu)
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-800">{error}</div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                                Display Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="display_name"
                                    name="display_name"
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0033A0] focus:border-[#0033A0] sm:text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0033A0] focus:border-[#0033A0] sm:text-sm"
                                    placeholder="student@sjsu.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0033A0] focus:border-[#0033A0] sm:text-sm"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0033A0] hover:bg-[#0033A0]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0033A0] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating account..." : "Create account"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="text-center text-sm">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link
                                href="/login"
                                className="font-medium text-[#0033A0] hover:text-[#0033A0]/80"
                            >
                                Sign in here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}