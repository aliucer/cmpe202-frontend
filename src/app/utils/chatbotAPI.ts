import type { Product } from "./types";
import { getApiBaseUrl, getAuthToken } from "./authUtils";

type ChatbotApiResponse = {
    query: string;
    parsed_params: {
        keywords: string | null;
        category: string | null;
        min_price: number | null;
        max_price: number | null;
    };
    listings: ChatbotListing[];
    count: number;
    message?: string;
};

type ChatbotListing = {
    id: string;
    title: string;
    description: string;
    price: string;
    category: {
        id: string;
        name: string;
        slug: string;
    } | null;
    seller: {
        id: string;
        display_name: string;
    } | null;
    photo: string | null;
    created_at: string;
};

const mapChatbotListingToProduct = (listing: ChatbotListing): Product => {
    return {
        id: listing.id,
        title: listing.title,
        price: Number(listing.price),
        category: listing.category?.name ?? "",
        description: listing.description ?? "",
        images: listing.photo ? [listing.photo] : [],
        sellerName: listing.seller?.display_name,
        sellerId: listing.seller?.id ?? "",
        createdAt: listing.created_at,
    };
};

export async function searchWithChatbot(query: string): Promise<{
    products: Product[];
    parsedParams: ChatbotApiResponse["parsed_params"];
    message?: string;
}> {
    const endpoint = `${getApiBaseUrl()}/api/chatbot/query`;
    const token = getAuthToken();

    if (!token) {
        throw new Error("Authentication required for AI search. Please log in.");
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
            cache: "no-store",
        });

        if (!response.ok) {
            let errorMessage = `Failed to search with AI (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                const errorText = await response.text().catch(() => "");
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const payload: ChatbotApiResponse = await response.json();
        
        return {
            products: payload.listings.map(mapChatbotListingToProduct),
            parsedParams: payload.parsed_params,
            message: payload.message,
        };
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error(`Cannot connect to backend server at ${endpoint}. Make sure the backend is running.`);
        }
        // Re-throw other errors
        throw error;
    }
}

