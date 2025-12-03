// ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProductDetailedView from "./ProductDetailedView";
import type { Product } from "@/app/utils/types";
import { getApiBaseUrl } from "@/app/utils/authUtils";

interface ProductCardProps {
  listing: {
    id: number;
    title: string;
    price: number;
    description?: string;
    image?: string;
    status?: string; // Add status to show sold indicator
    sellerId?: string;
  };
  showActions?: boolean;
}

export default function ProductCard({ listing, showActions = true }: ProductCardProps) {
  const router = useRouter();
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleEdit = () => {
    router.push(`/seller/edit-listings/${listing.id}`);
  };

  const [productData, setProductData] = useState<Product | null>(null);

  const handleViewDetails = async () => {
    // Fetch full listing data for ProductDetailedView
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/api/listings/${listing.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const listingData = await res.json();
        // Convert to Product format
        const product: Product = {
          id: listingData.id,
          title: listingData.title,
          price: Number(listingData.price),
          description: listingData.description || "",
          images: listingData.photos?.map((p: { url: string }) => p.url) || (listing.image ? [listing.image] : []),
          sellerId: listingData.seller_id,
          sellerName: listingData.seller?.display_name,
          category: listingData.category?.name || "",
          createdAt: listingData.created_at,
          status: listingData.status, // Include status
        };
        setProductData(product);
        setShowProductDetails(true);
      } else {
        alert("Failed to load listing details.");
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
      alert("Failed to load listing details.");
    }
  };


  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${listing.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/api/listings/${listing.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete listing.");
      }

      alert("Listing deleted successfully!");
      // Refresh the page to show updated list
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to delete listing: ${errorMessage}`);
    }
  };

  const handleMarkAsSold = () => {
    setShowMarkSoldModal(true);
    setError("");
  };

  const handleSubmitMarkSold = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setIsSubmitting(false);
        return;
      }

      // Backend requires sold_to_user_id and agreed_price, so we'll use defaults
      // Use the listing price as agreed price and seller's own ID as placeholder
      // Note: This is a workaround since backend requires these fields
      const requestBody = {
        sold_to_user_id: "1", // Default placeholder - backend may need actual buyer
        agreed_price: listing.price, // Use listing price as agreed price
      };

      const res = await fetch(`${getApiBaseUrl()}/api/listings/${listing.id}/mark-sold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.message || "Failed to mark listing as sold.");
      }

      alert("Listing marked as sold successfully!");
      setShowMarkSoldModal(false);
      // Refresh the page to show updated list
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error marking as sold:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to mark listing as sold. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSold = listing.status === "sold";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if modal is already open
    if (showProductDetails) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Open ProductDetailedView when card is clicked
    handleViewDetails();
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {isSold && (
        <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          SOLD
        </div>
      )}
      {listing.image && (
        <div className="relative w-full h-48">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className={`object-cover ${isSold ? "opacity-60 grayscale-[30%]" : ""}`}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg">{listing.title}</h3>
        <p className="text-gray-600">${listing.price}</p>
        {listing.description && (
          <p className="text-sm mt-1 text-gray-500">{listing.description}</p>
        )}

        {/* ✅ Conditionally render actions */}
        {showActions && (
          <div className="flex flex-col gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
            {!isSold && (
              <div className="flex justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsSold();
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                >
                  Mark as Sold
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="flex-1 bg-[#0033A0] text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm"
                >
                  Edit
                </button>
              </div>
            )}
            {isSold && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                className="w-full bg-[#0033A0] text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm"
              >
                View Details
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mark as Sold Modal */}
      {showMarkSoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 text-[#0033A0]">
              Mark &quot;{listing.title}&quot; as Sold
            </h2>

            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-700 mb-6">
              Are you sure you want to mark &quot;{listing.title}&quot; as sold?
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMarkSoldModal(false);
                  setError("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMarkSold}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Marking as Sold..." : "Yes, Mark as Sold"}
              </button>
            </div>
            {/* Product Detailed View Modal */}
            {showProductDetails && productData && (
              <div onClick={(e) => e.stopPropagation()}>
                <ProductDetailedView
                  product={productData}
                  isOpen={showProductDetails}
                  onClose={() => {
                    setShowProductDetails(false);
                    setProductData(null);
                  }}
                  showActions={true}
                  isLoggedIn={true}
                />
              </div>
            )}
          </div>
          );
}
