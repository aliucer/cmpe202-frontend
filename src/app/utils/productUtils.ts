import listingData from "../mock/listings.json";
import listingPhotosData from "../mock/listing_photos.json";
import categoriesData from "../mock/categories.json";
import type { Listing, ListingPhoto, Category, Product } from "./types";
import { getCategoryIDMap } from "./categoryUtils";

// Transforms listing data into Product format by combing data
//    with photos and categories 
export function transformListingsToProducts(
    listings : Listing[],
    photos : ListingPhoto[],
    categories : Category[]
) : Product[] {
    // get map of ids to category
    const catMap : Map<number, string> = getCategoryIDMap();

    // get map of listing_id to list of photos (in sorted order)
    const photoMap = new Map<number, string[]>();
    [...photos]
        .sort((a,b) => a.sort_order - b.sort_order)
        .forEach(photo => {
            photoMap.set(photo.listing_id, [...(photoMap.get(photo.listing_id)) ?? [], photo.url]);
        });
    // console.log(photoMap);

    // Return all 'active' listings and connect listings to listing photos
    return listings
        .filter(listing => listing.status === "active")
        .map( listing => {
            const catName : string = catMap.get(listing.category_id) || " ";
            const photos : string[] = (photoMap.get(listing.id) || []);

            return {
                id: listing.id.toString(),
                title: listing.title,
                price: listing.price,
                category: catName,
                description: listing.description,
                images: photos,
            };
        });

}

// Gets all products from mock data (calls transform listings to product)
export function getAllProducts(): Product[] {
    return transformListingsToProducts(listingData, listingPhotosData, categoriesData);
}

// // Filter producst based on category and price filters
// export function filterProducts() : Product[] {
//     return [];
// }

//console.log(getAllProducts());