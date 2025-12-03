"use client";

import {useEffect, useMemo, useState} from "react";
import { useRouter } from "next/navigation";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductGrid from "./ProductGrid";
import { fetchProducts } from "../utils/productUtilsAPI";
import { searchWithChatbot } from "../utils/chatbotAPI";
import type { Product } from "../utils/types";
import SearchBar from "./SearchBar";
import { CategoryFilter, PriceRangeFilter, SearchQueryFilter, applyFilters } from "../utils/filterUtils";
import Footer from "@/components/Footer";
import { getUserData } from "@/app/utils/authUtils";

function LandingPage() {
    const router = useRouter();
    
    // Authentication Logic
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // products
    const [products, setProducts] = useState<Product[]>([]);
    const [isShowingAISearch, setIsShowingAISearch] = useState<boolean>(false);

    // filters
    const [activeCategories, setActiveCategories] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Error checking
    const [error, setError] = useState<string | null>(null);

    // Check if user is admin and redirect if so
    useEffect(() => {
        const userData = getUserData();
        if (userData?.is_admin) {
            router.push("/admin");
        }
    }, [router]);

    // THIS IS NEW FROM CURSOR FOR API ENDPOINT INTEGRATION
    useEffect(() => {
        let isMounted = true;

        // Reset error state immediately when component mounts
        setError(null);
        setIsLoading(true);

        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                if (isMounted) {
                    setProducts(data);
                    setError(null); // Clear any previous errors on success
                }
            } catch (err) {
                if (isMounted) {
                    const message = err instanceof Error ? err.message : "Unable to load listings.";
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, []); // Empty array - runs once on mount


    const onSearch = async (query : string) => {
        setSearchQuery(query);
        
        // If we were showing AI search results, reload all products first
        if (isShowingAISearch) {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchProducts();
                setProducts(data);
                setIsShowingAISearch(false);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unable to load listings.";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const onAISearch = async (query : string) => {
        if (!query.trim()) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setSearchQuery(""); // Clear regular search when using AI
            
            const result = await searchWithChatbot(query);
            
            if (result.products.length === 0) {
                setError(result.message || "No listings found matching your query.");
                setProducts([]);
            } else {
                setProducts(result.products);
                setIsShowingAISearch(true);
                setError(null);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to search with AI.";
            setError(message);
            console.error("AI search error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const filtered : Product[] = useMemo( () => {
        const filters = [
            new CategoryFilter(activeCategories),
            new PriceRangeFilter(minPrice, maxPrice),
            new SearchQueryFilter(searchQuery),
        ];
        return applyFilters(products, filters);
    }
    , [searchQuery, activeCategories, maxPrice, minPrice, products]);

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Header/>
            <div className="flex flex-col lg:flex-row flex-1">
                {/* Left column: Filters (as in the wireframe: Search / Categories / Other Filters) */}
                <aside className="w-full lg:w-1/5 bg-[#0033A0] p-6 flex-shrink-0 lg:min-h-[calc(100vh-100px)]">
                    <Sidebar
                        activeCategories={activeCategories}
                        onToggleCategory={(cat) => {
                            setActiveCategories(prev => 
                                prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
                            )
                        }}
                        minPrice = {minPrice}
                        onMinPriceChange={setMinPrice}
                        maxPrice = {maxPrice}
                        onMaxPriceChange={setMaxPrice}
                    />
                </aside>

                <div className="flex-1 bg-white text-black p-8 overflow-auto">
                    <div className="space-y-8">
                        <div className="mt-2 px-2">
                            <SearchBar
                                onAISearch={(query) => onAISearch(query)}
                                onSearch={(query) => onSearch(query)}
                            />
                        </div>
                        {/*Right column: product grid */}
                        <main className="mt-5">
                            {isLoading && (
                                <p className="px-4 py-2 text-sm text-gray-600">Loading listings…</p>
                            )}
                            {!isLoading && error && (
                                <p className="px-4 py-2 text-sm text-red-600">{error}</p>
                            )}
                            {!isLoading && !error && (
                                <ProductGrid
                                    products={filtered}
                                    isLoggedIn={isLoggedIn}
                                />
                            )}
                        </main>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
}
export default LandingPage;