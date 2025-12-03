"use client";

import { memo, useState, useEffect } from "react";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { isAuthenticated as hasAuthToken } from "@/app/utils/authUtils";

type Props = {
    onSearch : (q : string) => void;
    onAISearch : (q : string) => void;
    initialQuery?: string;
};

function SearchBarImpl({onSearch, onAISearch, initialQuery = ""} : Props) {
    const [query, setQuery] = useState<string>(initialQuery);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Simple, synchronous check based on stored auth token
        setIsAuthenticated(hasAuthToken());
    }, []);

    const updateQuery = (newQuery: string) => {
        setQuery(newQuery);
        // If query cleared, call search
        if (newQuery === "") {
            onSearch("");
        }
    };

    const handleAISearch = () => {
        if (!isAuthenticated) return;
        onAISearch(query);
    };

    const handleSearch = () => {
        onSearch(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="flex items-center">
            <input
                type="search"
                placeholder="Search products..."
                className="flex-1 rounded-lg border px-3 py-2"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search products"
                suppressHydrationWarning
            />
            <button
                type="button"
                onClick={handleSearch}
                className="rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Search products"
                suppressHydrationWarning
            >
                <div className="flex items-center">
                    <span className="pr-2">Search</span>
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
            </button>
            <button
                type="button"
                onClick={handleAISearch}
                disabled={!isAuthenticated}
                className={`rounded-lg bg-orange-600 p-2.5 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isAuthenticated
                        ? "hover:bg-orange-700"
                        : "opacity-50 cursor-not-allowed"
                }`}
                aria-label="Search products with AI"
                title={
                    isAuthenticated
                        ? "Search products with AI"
                        : "Sign in to use AI search"
                }
                suppressHydrationWarning
            >
                <div className="flex items-center">
                    <span className="pr-2">Ask AI</span>
                    <SparklesIcon className="h-5 w-5" />
                </div>
            </button>
        </div>
    );
}
export default memo(SearchBarImpl);