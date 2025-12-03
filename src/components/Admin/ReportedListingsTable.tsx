"use client";


import type { Listing, ReportedListingRow, ListingPhoto, Product } from "@/app/utils/types";
import { useState, useEffect } from "react";
import { getCategoryIDMap } from "@/app/utils/categoryUtils";
import ProductDetailedView from "@/components/ProductDetailedView";
import { getAuthToken, getApiBaseUrl } from "@/app/utils/authUtils";

// API response types
interface ApiReport {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  resolved_by_admin_id: string | null;
  resolved_at: string | null;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price: string;
    status: string;
    seller_id: string;
    photo: string | null;
  };
  reporter: {
    id: string;
    display_name: string;
    email: string;
  };
  resolved_by: {
    id: string;
    display_name: string;
  } | null;
}

interface ApiReportsResponse {
  reports: ApiReport[];
  total: number;
  page: number;
  limit: number;
}

interface ReportedListingsTableProps {
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

const catMap : Map<number, string> = getCategoryIDMap();

export default function ReportedListingsTable({ pageSize=5 }: ReportedListingsTableProps) {
  const resolvedText = "resolved"
  const openText = "open";

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // API state
  const [rlRows, setRows] = useState<ReportedListingRow[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allPhotos, setAllPhotos] = useState<ListingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissingReportId, setDismissingReportId] = useState<number | null>(null);
  const [removingListingId, setRemovingListingId] = useState<number | null>(null);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${getApiBaseUrl()}/api/admin/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("You don't have permission to view this page.");
          } else {
            setError("Failed to load reports. Please try again.");
          }
          setLoading(false);
          return;
        }

        const data: ApiReportsResponse = await response.json();
        
        // Convert API reports to ReportedListingRow format
        const convertedRows: ReportedListingRow[] = data.reports.map((apiReport) => ({
          id: parseInt(apiReport.id),
          listingId: parseInt(apiReport.listing_id),
          title: apiReport.listing.title,
          seller_id: parseInt(apiReport.listing.seller_id),
          reason: apiReport.reason,
          details: apiReport.details || "",
          reportDate: apiReport.created_at,
          status: apiReport.status,
          datePosted: apiReport.created_at, // We'll need to fetch listing details for accurate date
          lastUpdated: apiReport.resolved_at || apiReport.created_at,
        }));

        // Convert API listings to Listing format and build photos array
        const listingsArray: Listing[] = [];
        const photosArray: ListingPhoto[] = [];
        
        data.reports.forEach((apiReport) => {
          const listingId = parseInt(apiReport.listing.id);
          
          // Add listing if not already added
          if (!listingsArray.find(l => l.id === listingId)) {
            listingsArray.push({
              id: listingId,
              seller_id: parseInt(apiReport.listing.seller_id),
              title: apiReport.listing.title,
              description: "", // Will be filled when viewing
              price: parseFloat(apiReport.listing.price),
              category_id: 0, // Will be filled when viewing
              status: apiReport.listing.status,
              sold_to_user_id: null,
              agreed_price: null,
              sold_at: null,
              created_at: apiReport.created_at, // Approximate, will be accurate when viewing
              updated_at: apiReport.resolved_at || apiReport.created_at,
            });
          }

          // Add photo if exists
          if (apiReport.listing.photo) {
            photosArray.push({
              id: photosArray.length + 1,
              listing_id: listingId,
              url: apiReport.listing.photo,
              sort_order: 0,
            });
          }
        });

        setRows(convertedRows);
        setListings(listingsArray);
        setAllPhotos(photosArray);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("An error occurred while loading reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filtered = rlRows.filter((r) =>
    [r.title]
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

  const handleView = async (row: ReportedListingRow) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      // Fetch full listing details with all photos
      const response = await fetch(`${getApiBaseUrl()}/api/admin/listings/${row.listingId}`, {
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

  const handleDismiss = async (row : ReportedListingRow) => {
    try {
      setDismissingReportId(row.id);
      const token = getAuthToken();
      
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      // Use 'dismiss' action to dismiss the report
      const response = await fetch(`${getApiBaseUrl()}/api/admin/reports/${row.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "dismiss",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(`Failed to dismiss report: ${errorData.error || "Unknown error"}`);
        return;
      }

      // Update local state
      setRows((prev) => prev.map((r) => 
        r.id === row.id ? { ...r, status: "dismissed" } : r
      ));
      
      alert("Report dismissed successfully.");
    } catch (err) {
      console.error("Error dismissing report:", err);
      alert("An error occurred while dismissing the report.");
    } finally {
      setDismissingReportId(null);
    }
  };

  const handleRemove = async (row : ReportedListingRow) => {
    if (!confirm(`Are you sure you want to remove listing "${row.title}"? This will also resolve all open reports for this listing.`)) {
      return;
    }

    try {
      setRemovingListingId(row.listingId);
      const token = getAuthToken();
      
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/admin/listings/${row.listingId}/status`, {
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

      // Remove all reports for this listing from the table
      setRows((prev) => prev.filter((r) => r.listingId !== row.listingId));
      
      alert("Listing removed successfully. All open reports for this listing have been resolved.");
      
      // Refresh the reports list
      window.location.reload();
    } catch (err) {
      console.error("Error removing listing:", err);
      alert("An error occurred while removing the listing.");
    } finally {
      setRemovingListingId(null);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [query, rlRows]);

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
        <div className="text-gray-600">Loading reports...</div>
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
      - id
      - title
      - seller
      - reason
      - details
      - report date
      - status
      - date posted
      - last updated
      */}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Seller</Th>
              <Th>Reason</Th>
              <Th>Details</Th>
              <Th>Report Date</Th>
              <Th>Status</Th>
              <Th>Last Updated</Th>
              <Th>Date Posted</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <Td colSpan={10} className="text-center py-8 text-gray-500">
                  No reports found.
                </Td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <Td>{r.id}</Td>
                  <Td>{r.title}</Td>
                  <Td>{r.seller_id}</Td>
                  <Td>{r.reason}</Td>
                  <Td>{r.details}</Td>
                  <Td>{new Date(r.reportDate).toLocaleDateString()}</Td>
                  <Td>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border capitalize">
                      {r.status}
                    </span>
                  </Td>
                  <Td>{new Date(r.lastUpdated).toLocaleDateString()}</Td>
                  <Td>{new Date(r.reportDate).toLocaleDateString()}</Td>
                  <Td className="text-right">
                    <button 
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 mr-2"
                      onClick={() => handleView(r)}
                    >
                      View
                    </button>
                    <button 
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDismiss(r)}
                      disabled={dismissingReportId === r.id || r.status === "dismissed" || r.status === resolvedText}
                    >
                      {dismissingReportId === r.id ? "Dismissing..." : "Dismiss"}
                    </button>
                    <button 
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleRemove(r)}
                      disabled={removingListingId === r.listingId}
                    >
                      {removingListingId === r.listingId ? "Removing..." : "Remove"}
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
    </div>
  );
}
