export type Listing = {
    id: number;
    seller_id: number;
    title: string;
    description: string;
    price: number;
    category_id: number;
    status: string;
    sold_to_user_id: number | null;
    agreed_price: number | null;
    sold_at: string | null;
    created_at: string;
    updated_at: string;
};

export type ListingPhoto = {
    id: number;
    listing_id: number;
    url: string;
    sort_order: number;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
};

export type Product = {
    id: string;
    title: string;
    price: number;
    category: string;
    description: string;
    images: string[];
    // New fields for seller info and listing metadata
    sellerName?: string;
    sellerId?: string;
    createdAt?: string;
    status?: string; // Listing status: 'active', 'sold', 'inactive', etc.
};

export type ListingReport = {
    id: number;
    listing_id: number;
    reporter_id: number;
    reason: string;
    details: string | null;
    status: string;
    resolved_by_admin_id: number | null;
    resolved_at: string | null;
    created_at: string;
};

export type User = {
    "id": number;
    "email": string;
    "display_name": string;
    "is_admin": boolean;
    "is_active": boolean;
    "created_at": string;
};

// Possibly move this into a different file as it is very specific to the reported listings table
export interface ReportedListingRow {
    id: number;           // report id
    listingId: number;    // original listing id (if you want to keep it too)
    title: string;
    seller_id: number;
    reason: string;
    details: string;
    reportDate: string;   // from report.created_at
    status: string;       // from report.status (open / resolved)
    datePosted: string;   // from listing.created_at
    lastUpdated: string;  // from listing.updated_at or resolved_at, etc.
};

// export type User = {
//     id: number;
//     email: string;
//     display_name: string;
//     is_admin: boolean;
//     is_active: boolean;
//     created_at: string;
// };