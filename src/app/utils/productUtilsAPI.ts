import type { Product } from "./types";
import { getApiBaseUrl } from "./authUtils";

type ListingsApiResponse = {
    listings: ApiListing[];
    total: number;
    page: number;
    limit: number;
};

type ApiListing = {
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
    seller?: ApiListingSeller | null;
    category?: ApiListingCategory | null;
    photos?: ApiListingPhoto[] | null;
};

type ApiListingSeller = {
    id: string;
    display_name: string;
    email: string;
};

type ApiListingCategory = {
    id: string;
    name: string;
    slug: string;
};

type ApiListingPhoto = {
    id: string;
    url: string;
    sort_order: number | null;
};

const mapListingToProduct = (listing: ApiListing): Product => {
    const sortedPhotos = [...(listing.photos ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    return {
        id: listing.id,
        title: listing.title,
        price: Number(listing.price),
        category: listing.category?.name ?? "",
        description: listing.description ?? "",
        images: sortedPhotos.map((photo) => photo.url),
        sellerName: listing.seller?.display_name,
        sellerId: listing.seller?.id ?? listing.seller_id,
        createdAt: listing.created_at,
    };
};

export async function fetchProducts(): Promise<Product[]> {
    const endpoint = `${getApiBaseUrl()}/api/listings`;

    try {
        // Try to get auth token if available (optional for listings)
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const headers: HeadersInit = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, { 
            cache: "no-store",
            headers
        });
        
        if (!response.ok) {
            let errorMessage = `Failed to fetch listings (${response.status})`;
            let errorDetails: any = null;
            try {
                const errorData = await response.json();
                errorDetails = errorData;
                errorMessage = errorData.error || errorData.message || errorMessage;
                console.error("Listings fetch error - Full response:", {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData,
                    url: endpoint
                });
            } catch (parseError) {
                const errorText = await response.text().catch(() => "");
                errorDetails = { text: errorText };
                errorMessage = errorText || errorMessage;
                console.error("Listings fetch error (non-JSON) - Full response:", {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    url: endpoint
                });
            }
            throw new Error(errorMessage);
        }

        const payload: ListingsApiResponse = await response.json();
        return (payload.listings ?? [])
            .filter((listing) => listing.status === "active")
            .map(mapListingToProduct);
    } catch (error) {
        // Handle network errors (CORS, connection refused, etc.)
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error(`Cannot connect to backend server at ${endpoint}. Make sure the backend is running on port 4000.`);
        }
        // Re-throw other errors
        throw error;
    }
}

