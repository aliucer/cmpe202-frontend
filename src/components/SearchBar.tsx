"use client";

import { memo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type Props = {
    onSearch : (q : string) => void;
    initialQuery?: string;
};

function SearchBarImpl({onSearch, initialQuery = ""} : Props) {
    const [query, setQuery] = useState<string>(initialQuery);

    const updateQuery = (newQuery : string) => {
        setQuery(newQuery);
        // If query cleared, call search
        if (newQuery === "") {
            onSearch("");
        }
    };

    const handleSearch = () => {
        onSearch(query);
    };

    const handleKeyDown = (e : React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="flex items-center">
            <input
                type = "search"
                placeholder = "Search products..."
                className = "flex-1 rounded-lg border px-3 py-2"
                value = {query}
                onChange = {(e) => updateQuery(e.target.value)}
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
                <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
        </div>
    );
} 
export default memo(SearchBarImpl);