"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { Product } from "@/app/utils/types";
import ReportButton from "./LandingPage/ReportButton";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/app/utils/authUtils";

interface ProductDetailedViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  showActions?:boolean;
  isLoggedIn?: boolean;
  onConversationCreated?: (conversationId: string) => void;
}

export default function ProductDetailedView({
  product,
  isOpen,
  onClose,
  showActions = false,
  isLoggedIn = false,
  onConversationCreated,
}: ProductDetailedViewProps) {
  const router = useRouter();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMarkingSold, setIsMarkingSold] = useState(false);
  const [showMarkSoldForm, setShowMarkSoldForm] = useState(false);
  const [markSoldData, setMarkSoldData] = useState({ buyerId: "", agreedPrice: "" });
  const [markSoldError, setMarkSoldError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current user ID
  useEffect(() => {
    async function getCurrentUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUserId(null);
        return;
      }

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    }

    if (isOpen && isLoggedIn) {
      getCurrentUser();
    }
  }, [isOpen, isLoggedIn]);

  // Check if current user is the seller
  const isSeller = currentUserId && product?.sellerId && currentUserId === product.sellerId;
  const isSold = product?.status === "sold";

  if (!product || !isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Date not available";
    }
  };

  const handleMessageSeller = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMessageError(null);

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to message the seller.");
      router.push("/login");
      return;
    }

    // Check if product has required data
    if (!product.id) {
      setMessageError("Product information is missing.");
      return;
    }

    setIsCreatingConversation(true);

    try {
      // Create or find conversation with the seller
      const response = await fetch(`${getApiBaseUrl()}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: product.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to create conversation");
      }

      const conversation = await response.json();
      
      // Trigger callback if provided
      if (onConversationCreated && conversation.id) {
        onConversationCreated(conversation.id.toString());
      }
      
      // Dispatch custom event to open conversation in MessageDrawer
      if (conversation.id) {
        const event = new CustomEvent('openConversation', {
          detail: { conversationId: conversation.id.toString() }
        });
        window.dispatchEvent(event);
      }
      
      // Close the product view
      onClose();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create conversation. Please try again.";
      setMessageError(errorMessage);
      console.error("Error creating conversation:", error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleMarkAsSold = async () => {
    setMarkSoldError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMarkSoldError("You are not logged in.");
      return;
    }

    if (!markSoldData.buyerId || !markSoldData.agreedPrice) {
      setMarkSoldError("Please fill in all fields.");
      return;
    }

    setIsMarkingSold(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/listings/${product.id}/mark-sold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sold_to_user_id: markSoldData.buyerId,
          agreed_price: Number(markSoldData.agreedPrice),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to mark listing as sold");
      }

      alert("Listing marked as sold successfully!");
      setShowMarkSoldForm(false);
      setMarkSoldData({ buyerId: "", agreedPrice: "" });
      onClose();
      // Refresh the page or update the listing status
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark listing as sold. Please try again.";
      setMarkSoldError(errorMessage);
      console.error("Error marking listing as sold:", error);
    } finally {
      setIsMarkingSold(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("You are not logged in.");
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/listings/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete listing";
        try {
          const errorData = await response.json();
          console.error("Delete error response:", errorData, "Status:", response.status);
          // Handle empty object or missing error property
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch {
          // If response is not JSON, try to get text
          const textError = await response.text().catch(() => "Unknown error");
          console.error("Delete error (non-JSON):", textError, "Status:", response.status);
          errorMessage = textError || errorMessage;
        }
        
        // Provide more helpful error messages based on status code or error message
        if (response.status === 500 || errorMessage.toLowerCase().includes("internal server error") || errorMessage === "Failed to delete listing") {
          throw new Error("Cannot delete listing. This listing may have active reports or conversations. Please contact support if you need assistance.");
        }
        
        throw new Error(errorMessage);
      }

      alert("Listing deleted successfully!");
      onClose();
      // Refresh the page to show updated list
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete listing: ${errorMessage}`);
      console.error("Error deleting listing:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close the modal when clicking on the backdrop
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    // Backdrop overlay - clicking closes the modal
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleBackdropClick} />

      {/* Detailed Product Card - centered */}
      <article
        className="relative z-10 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden
                   max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto
                   transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center
                     bg-white/90 hover:bg-white rounded-full shadow-md
                     text-gray-600 hover:text-gray-900 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {/* Product Image - larger than ProductCardBuyer */}
        {product.images?.[0] ? (
          <div className="relative w-full h-80 sm:h-96">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 800px, (min-width: 1024px) 700px, (min-width: 640px) 600px, 100vw"
            />
          </div>
        ) : (
            // No image Available block
          <div className="w-full h-80 sm:h-96 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500 text-lg font-medium">No Image Available</p>
          </div>
        )}

        {/* Product Details */}
        <div className="p-6 space-y-4">
          {/* Title, Price, Category*/}
          <div>
            <h2 className="font-bold text-2xl sm:text-3xl mb-2">{product.title}</h2>
            <p className="text-gray-600 text-xl sm:text-2xl font-semibold">
              ${product.price.toFixed(2)}
            </p>
            {product.category && (
              <p className="text-gray-500 text-sm mt-1 capitalize">{product.category}</p>
            )}
          </div>

          {/* Seller Info and Post Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-200">
            <div>
              {product.sellerName ? (
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">Seller:</span> {product.sellerName}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Seller: Not available</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">Posted:</span> {formatDate(product.createdAt)}
              </p>
            </div>
          </div>

          {/* Full Description - no line clamp */}
          {product.description && (
            <div className="pt-2 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons - Bottom Row */}
        {showActions && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {isSeller ? (
              // Seller Actions
              isSold ? (
                // Sold items: Only Delete button
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium
                               hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                               transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteListing}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : (
                // Active items: Mark as Sold, Edit, and Delete
                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium
                               hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                               transition-colors duration-200"
                    onClick={() => setShowMarkSoldForm(true)}
                  >
                    Mark as Sold
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                 transition-colors duration-200"
                      onClick={() => {
                        router.push(`/seller/edit-listings/${product.id}`);
                        onClose();
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium
                                 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                                 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDeleteListing}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Buyer Actions: Report and Message Seller
              <div className="flex justify-between gap-4">
                <ReportButton productId={product.id} />
                <div className="flex flex-col items-end">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                               hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                               transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleMessageSeller}
                    disabled={isCreatingConversation}
                  >
                    {isCreatingConversation ? "Creating..." : "Message Seller"}
                  </button>
                  {messageError && (
                    <p className="text-red-500 text-xs mt-1">{messageError}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mark as Sold Form Modal */}
        {showMarkSoldForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Mark Listing as Sold</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Buyer User ID</label>
                  <input
                    type="text"
                    value={markSoldData.buyerId}
                    onChange={(e) => setMarkSoldData({ ...markSoldData, buyerId: e.target.value })}
                    className="w-full border rounded-md p-2"
                    placeholder="Enter buyer's user ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Agreed Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={markSoldData.agreedPrice}
                    onChange={(e) => setMarkSoldData({ ...markSoldData, agreedPrice: e.target.value })}
                    className="w-full border rounded-md p-2"
                    placeholder="Enter final sale price"
                  />
                </div>

                {markSoldError && (
                  <p className="text-red-500 text-sm">{markSoldError}</p>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMarkSoldForm(false);
                      setMarkSoldData({ buyerId: "", agreedPrice: "" });
                      setMarkSoldError(null);
                    }}
                    className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkAsSold}
                    disabled={isMarkingSold || !markSoldData.buyerId || !markSoldData.agreedPrice}
                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium
                               hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMarkingSold ? "Marking..." : "Mark as Sold"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

