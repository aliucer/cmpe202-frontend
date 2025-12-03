/**
 * Categories section at the top
 * "Other Filters" section below
 * Vertical layout on the left side of main content
 */
"use client";

import CategoryList from "./CategoryList";
import MaxPriceInput from "./MaxPriceInput";

type FilterProps = {
    categories : string[];
    activeCategories : string[];
    onToggleCategory : (c: string) => void;

    maxPrice : number | undefined;
    onMaxPriceChange : (p: number | undefined) => void;
}

export default function Sidebar({
    categories,
    activeCategories,
    onToggleCategory,
    maxPrice,
    onMaxPriceChange,
}: FilterProps) {
    return (
        <div className="space-y-6">
            <section aria-labelledby="search-heading">
                <h2 id="seach-heading" className="text-lg font-semibold mb-2">Search</h2>
            </section>

            <section aria-labelledby="categories-heading">
                <h2 id="categories-heading" className="text-lg font-semibold mb-2">Categories</h2>
                <CategoryList
                    categories = {categories}
                    active = {activeCategories}
                    onToggle= {onToggleCategory}
                />
            </section>

            <section aria-labelledby="other-filters-heading">
                <h2 id="other-filters-heading" className="text-lg font-semibold mb-2">Other Filters</h2>
                <MaxPriceInput price={maxPrice} onChange={onMaxPriceChange}/>
            </section>
        </div>
    );
}