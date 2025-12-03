import { getAuthToken, getApiBaseUrl } from "./authUtils";

export type PublicUserProfile = {
    id: string;
    display_name: string;
    created_at: string;
    stats: {
        total_listings: number;
        active_listings: number;
        sold_listings: number;
    };
};

// Get public user profile (requires authentication)
export async function getUserFromID(id: number): Promise<PublicUserProfile> {
    const token = getAuthToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(`${getApiBaseUrl()}/api/users/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: missing or invalid token");
        }
        if (response.status === 404) {
            throw new Error("User not found");
        }

        const text = await response.text();
        throw new Error(
            `Failed to fetch user profile: ${response.status} ${text || response.statusText}`,
        );
    }

    const data = (await response.json()) as PublicUserProfile;
    return data;
}