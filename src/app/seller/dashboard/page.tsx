"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import { getApiBaseUrl, getUserData } from "@/app/utils/authUtils";

interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  category_id?: number;
  status: string;
  photos?: { url: string }[];
  image?: string | null;
}

const CATEGORY_MAP: Record<number, string> = {
  1: "Textbooks",
  2: "Electronics",
  3: "Furniture",
  4: "Essentials",
  5: "Clothing",
  6: "Sports & Outdoors",
};

const CATEGORY_LIST = [
  "Textbooks",
  "Electronics",
  "Furniture",
  "Essentials",
  "Clothing",
  "Sports & Outdoors",
];

function getCategoryName(listing: Listing): string | undefined {
  return listing.category_id ? CATEGORY_MAP[listing.category_id] : undefined;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if user is admin and redirect if so
  useEffect(() => {
    const userData = getUserData();
    if (userData?.is_admin) {
      router.push("/admin");
    }
  }, [router]);

  // ⭐ Fetch real listings from backend
  useEffect(() => {
    async function fetchMyListings() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch(`${getApiBaseUrl()}/api/listings/my-listings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || errorData.error || "Failed to fetch listings");
        }

        const data = await res.json();

        const mappedListings = data.listings.map((l: Listing & { category_id: string | number, photos: { url: string }[] }) => ({
          ...l,
          price: Number(l.price),
          category_id: Number(l.category_id),
          image: l.photos?.[0]?.url || null,
        }));

        setListings(mappedListings);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchMyListings();
  }, []);

  // ⭐ Filtering logic (same as yours)
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const catName = getCategoryName(l);
      const passesCategory =
        activeCategories.length === 0 ||
        (catName && activeCategories.includes(catName));

      const passesMax =
        maxPrice === undefined || l.price <= maxPrice;

      const passesMin =
        minPrice === undefined || l.price >= minPrice;

      return passesCategory && passesMax && passesMin;
    });
  }, [listings, activeCategories, maxPrice, minPrice]);

  const handleToggleCategory = (category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;
  if (error)
    return <p className="p-6 text-red-500 font-semibold">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-1/5 bg-[#0033A0] p-6 flex-shrink-0 min-h-[calc(100vh-100px)]">
          <Sidebar
            activeCategories={activeCategories}
            onToggleCategory={handleToggleCategory}
            minPrice={minPrice}
            onMinPriceChange={setMinPrice}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white text-black p-8 overflow-auto">
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold capitalize">My Listings</h1>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <ProductCard
                    key={listing.id}
                    listing={{
                      id: Number(listing.id),
                      title: listing.title,
                      price: listing.price,
                      description: listing.description ?? "",
                      image: listing.image ?? undefined,
                      status: listing.status, // Pass status to ProductCard
                      sellerId: listing.seller_id, // Pass seller ID for ProductDetailedView
                    }}
                  />
                ))
              ) : listings.length === 0 ? (
                <div className="col-span-3 text-center text-gray-600 py-12">
                  <p className="text-lg mb-2">You haven&apos;t created any listings yet.</p>
                  <p className="text-sm">Create your first listing to get started!</p>
                </div>
              ) : (
                <p className="col-span-3 text-center text-gray-600">
                  No listings match your filters.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
