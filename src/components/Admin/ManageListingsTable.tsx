"use client";


// IMPORTANT: later, add reported column with a css effect

import type { Listing, ListingPhoto, Product } from "@/app/utils/types";
import { useState, useEffect } from "react";
import { getCategoryIDMap } from "@/app/utils/categoryUtils";
import ProductDetailedView from "@/components/ProductDetailedView";
import ReportForm from "@/components/LandingPage/ReportForm";
import { getAuthToken, getApiBaseUrl } from "@/app/utils/authUtils";

const catMap : Map<number, string> = getCategoryIDMap();

// API response types
interface ApiListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: string;
  category_id: string;
  status: string;
  sold_to_user_id?: string | null;
  agreed_price?: string | null;
  sold_at?: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  seller?: {
    id: string;
    display_name: string;
    email: string;
  };
  photo?: string | null;
  open_reports_count?: number;
}

interface ApiListingsResponse {
  listings: ApiListing[];
  total: number;
  page: number;
  limit: number;
}

interface DataTableProps {
  pageSize?: number; // optional, defaults to 5
}

// Custom Table Headers and Table Data columns
function Th({ children, className = "" }: any) {
  return (
    <th className={"px-3 py-2 text-left font-medium " + className}>
      {children}
    </th>
  );
}
function Td({ children, className = "", colSpan }: any & {colSpan? : number}) {
  return (
    <td className={"px-3 py-2 align-middle " + className} colSpan={colSpan}>
      {children}
    </td>
  );
}

export default function ManageListingsTable({ pageSize=5 }: DataTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedListingForReport, setSelectedListingForReport] = useState<Listing | null>(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);

  // API state
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allPhotos, setAllPhotos] = useState<ListingPhoto[]>([]);
  const [removingListingId, setRemovingListingId] = useState<number | null>(null);

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${getApiBaseUrl()}/api/admin/listings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("You don't have permission to view this page.");
          } else {
            setError("Failed to load listings. Please try again.");
          }
          setLoading(false);
          return;
        }

        const data: ApiListingsResponse = await response.json();
        
        // Convert API listings to Listing format
        const convertedListings: Listing[] = data.listings.map((apiListing) => ({
          id: parseInt(apiListing.id),
          seller_id: parseInt(apiListing.seller_id),
          title: apiListing.title,
          description: apiListing.description,
          price: parseFloat(apiListing.price),
          category_id: parseInt(apiListing.category_id),
          status: apiListing.status,
          sold_to_user_id: apiListing.sold_to_user_id ? parseInt(apiListing.sold_to_user_id) : null,
          agreed_price: apiListing.agreed_price ? parseFloat(apiListing.agreed_price) : null,
          sold_at: apiListing.sold_at || null,
          created_at: apiListing.created_at,
          updated_at: apiListing.updated_at,
        }));

        // Build photos array from API listings
        const photosArray: ListingPhoto[] = [];
        data.listings.forEach((apiListing) => {
          if (apiListing.photo) {
            photosArray.push({
              id: photosArray.length + 1, // Temporary ID
              listing_id: parseInt(apiListing.id),
              url: apiListing.photo,
              sort_order: 0,
            });
          }
        });

        setListings(convertedListings);
        setAllPhotos(photosArray);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("An error occurred while loading listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filtered = listings.filter((r) =>
    [r.title, catMap.get(r.category_id)]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const convertListingToProduct = (listing: Listing): Product => {
    // Get photos for this listing
    const listingPhotos = allPhotos
      .filter((p) => p.listing_id === listing.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => p.url);
    
    // Get category name
    const categoryName = catMap.get(listing.category_id) || "";

    return {
      id: listing.id.toString(),
      title: listing.title,
      price: listing.price,
      category: categoryName,
      description: listing.description || "",
      images: listingPhotos,
      sellerId: listing.seller_id.toString(),
      createdAt: listing.created_at,
      status: listing.status,
    };
  };

  const handleView = async (listing: Listing) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      // Fetch full listing details with all photos
      const response = await fetch(`${getApiBaseUrl()}/api/admin/listings/${listing.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Failed to load listing details.");
        return;
      }

      const listingData = await response.json();
      
      // Convert to Product format
      const product: Product = {
        id: listingData.id,
        title: listingData.title,
        price: parseFloat(listingData.price),
        description: listingData.description || "",
        images: listingData.photos?.map((p: any) => p.url) || [],
        sellerId: listingData.seller_id,
        sellerName: listingData.seller?.display_name,
        category: listingData.category?.name || "",
        createdAt: listingData.created_at,
        status: listingData.status,
      };

      setSelectedProduct(product);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Error fetching listing details:", err);
      alert("Failed to load listing details.");
    }
  };

  const handleReport = (listing : Listing) => {
    setSelectedListingForReport(listing);
    setIsReportFormOpen(true);
  };

  const handleReportFormClose = () => {
    setIsReportFormOpen(false);
    setSelectedListingForReport(null);
    // Refresh listings after report is submitted
    window.location.reload();
  };

  const handleRemove = async (listing : Listing) => {
    if (!confirm(`Are you sure you want to remove listing "${listing.title}"?`)) {
      return;
    }

    try {
      setRemovingListingId(listing.id);
      const token = getAuthToken();
      
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/admin/listings/${listing.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "removed",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(`Failed to remove listing: ${errorData.error || "Unknown error"}`);
        return;
      }

      // Update local state
      setListings((prev) => prev.map((ls) => 
        ls.id === listing.id ? { ...ls, status: "removed" } : ls
      ));
      
      alert("Listing removed successfully.");
    } catch (err) {
      console.error("Error removing listing:", err);
      alert("An error occurred while removing the listing.");
    } finally {
      setRemovingListingId(null);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [query, listings]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/pageSize));
  const start = page * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(0);
      
      if (page <= 2) {
        // Near the beginning: show 0, 1, 2, 3, ..., last
        pages.push(1, 2, 3);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (page >= totalPages - 3) {
        // Near the end: show 0, ..., last-3, last-2, last-1, last
        pages.push('...');
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        // In the middle: show 0, ..., current-1, current, current+1, ..., last
        pages.push('...');
        pages.push(page - 1, page, page + 1);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input
      <div className="flex items-center justify-between">
        <input
          className="w-full md:w-80 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Search listings…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div> */}

      
      {/*DATA TABLE WITH:
      - title
      - seller
      - price
      - category
      - status
      - date posted*/}


      {/* Data Table Filters: 
      - keyword search (check title and category)
      - status filter
      - price filter
      - seller filter
      - sort options
      */}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Seller</Th>
              <Th>Price</Th>
              <Th>Status</Th>
              <Th>Category</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <Td colSpan={8} className="text-center py-8 text-gray-500">
                  No listings found.
                </Td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <Td>{r.id}</Td>
                  <Td>{r.title}</Td>
                  <Td>{r.seller_id}</Td>
                  <Td>${r.price.toFixed(2)}</Td>
                  <Td>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border capitalize">
                      {r.status}
                    </span>
                  </Td>
                  <Td>{catMap.get(r.category_id)}</Td>
                  <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
                  <Td className="text-right">
                    <button 
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 mr-2"
                      onClick={() => handleView(r)}
                    >
                      View
                    </button>
                    <button 
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 mr-2"
                      onClick={() => handleReport(r)}
                    >
                      Report
                    </button>
                    <button 
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleRemove(r)}
                      disabled={removingListingId === r.id || r.status === "removed"}
                      >
                        {removingListingId === r.id ? "Removing..." : "Remove"}
                      </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 border-t">
            <span>
              Showing{" "}
              {filtered.length === 0
                ? 0
                : `${start + 1}-${Math.min(start + pageSize, filtered.length)}`}{" "}
              of {filtered.length}
            </span>

            <div className="flex items-center space-x-1">
              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2">
                      ...
                    </span>
                  );
                }
                
                const pageIndex = pageNum as number;
                const isCurrentPage = pageIndex === page;
                
                return (
                  <button
                    key={pageIndex}
                    type="button"
                    onClick={() => setPage(pageIndex)}
                    className={`rounded-md border px-2 py-1 text-xs hover:bg-gray-100 ${
                      isCurrentPage
                        ? 'bg-gray-200 font-semibold'
                        : ''
                    }`}
                  >
                    {pageIndex + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Product Detailed View Modal */}
      <ProductDetailedView
        product={selectedProduct}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProduct(null);
        }}
        showActions={false}
        isLoggedIn={false}
      />

      {/* Report Form Modal */}
      {selectedListingForReport && (
        <ReportForm
          productId={selectedListingForReport.id}
          isOpen={isReportFormOpen}
          onClose={handleReportFormClose}
        />
      )}
    </div>
  );
}
