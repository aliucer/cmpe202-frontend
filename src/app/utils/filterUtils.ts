import type { Product } from "./types";


export interface ProductFilter {
    filter(p : Product) : boolean;
}

// CategoryList.tsx filter
export class CategoryFilter implements ProductFilter {
    constructor(private activeCategories : string[]) {};

    filter(p : Product) : boolean {
        return this.activeCategories.length == 0 || 
            this.activeCategories.includes(p.category);
    }
}

// MaxPriceInput.tsx filter
export class MaxPriceFilter implements ProductFilter {
    constructor(private maxPrice : number | undefined) {};

    filter(p : Product) : boolean {
        return (this.maxPrice == null) || (p.price <= this.maxPrice);
    }
}

// PriceRange.tsx filter
export class PriceRangeFilter implements ProductFilter {
    constructor(private minPrice : number | undefined, private maxPrice : number | undefined) {};

    filter(p : Product) : boolean {
        let maxPass : boolean = (this.maxPrice == null) || (p.price <= this.maxPrice);
        let minPass : boolean = (this.minPrice == null) || (p.price >= this.minPrice);
        //if (!minPass) console.log(`${p.title}: ${minPass}`);
        return maxPass && minPass;
    }
}

// SearchBar.tsx filter
export class SearchQueryFilter implements ProductFilter {
    constructor(private query : string) {};

    filter(p : Product) : boolean {
        return this.query == "" || p.title.toLowerCase().trim().includes(
            this.query.toLowerCase().trim());
    }
}

export function applyFilters(products : Product[], filters : ProductFilter[]) : Product[] {
    return products.filter( product => 
        filters.every(filter => filter.filter(product))
    );
}