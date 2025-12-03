import categoriesData from "../mock/categories.json";
import type { Listing, ListingPhoto, Category, Product } from "./types";
import { getApiBaseUrl } from "./authUtils";

export function getAllCategories() : Category[] {
    //console.log(categoriesData);
    return categoriesData;
}

export function getCategoryNames() : string[] {
    return getAllCategories().map(cat => cat.name);
}

// Fetch categories from backend API
export async function fetchCategories(): Promise<Category[]> {
    const endpoint = `${getApiBaseUrl()}/api/categories`;

    try {
        const response = await fetch(endpoint, { cache: "no-store" });
        
        if (!response.ok) {
            console.error(`Failed to fetch categories (${response.status})`);
            // Fallback to mock data if API fails
            return getAllCategories();
        }

        const categories = await response.json();
        // Convert backend format (id as string) to frontend format (id as number)
        return categories.map((cat: { id: string; name: string; slug: string }) => ({
            id: Number(cat.id),
            name: cat.name,
            slug: cat.slug,
        }));
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to mock data on error
        return getAllCategories();
    }
}

// Fetch category names from backend API
export async function fetchCategoryNames(): Promise<string[]> {
    const categories = await fetchCategories();
    return categories.map(cat => cat.name);
}

export function getCategoryIDMap() : Map<number, string> {
    const categoryMap = new Map<number, string>();
    categoriesData.forEach(cat => {
        categoryMap.set(cat.id, cat.name);
    });
    return categoryMap;
}


// const cats = getAllCategories();
// console.log("Categories:", cats);


// const catNames = getCategoryNames();
// console.log("Category Names:", catNames);