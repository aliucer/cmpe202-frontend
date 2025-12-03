"use client";

import { useState, useEffect } from "react";
import CategoryList from "@/components/Filters/CategoryList";
import PriceRange from "@/components/Filters/PriceRange";
import { fetchCategoryNames } from "@/app/utils/categoryUtils";

type FilterProps = {
  // Category filters - optional, will fetch from API if not provided
  categories?: string[];
  activeCategories: string[];
  onToggleCategory: (c: string) => void;

  // Price filters
  minPrice: number | undefined;
  onMinPriceChange: (p: number | undefined) => void;

  maxPrice: number | undefined;
  onMaxPriceChange: (p: number | undefined) => void;

  showFilters?: boolean;
};

export default function Sidebar({
  categories: propCategories,
  activeCategories,
  onToggleCategory,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  showFilters = true,
}: FilterProps) {
  // Fetch categories from API if not provided as prop
  const [categories, setCategories] = useState<string[]>(propCategories || []);

  useEffect(() => {
    // If categories are provided as prop, use them
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

    // Otherwise, fetch from API
    const loadCategories = async () => {
      try {
        const categoryNames = await fetchCategoryNames();
        setCategories(categoryNames);
      } catch (err) {
        console.error("Failed to load categories:", err);
        // Categories will fallback to mock data in fetchCategoryNames
      }
    };

    loadCategories();
  }, [propCategories]);
  return (
    <aside className="w-72 bg-[#0033A0] flex flex-col text-white h-full">
      <div className="flex flex-col px-2 pt-8 space-y-8">

        {showFilters && (
          <>
            {/* Categories */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <CategoryList
                categories={categories}
                active={activeCategories}
                onToggle={onToggleCategory}
              />
            </section>

            <hr className="border-gray-300 opacity-20" />

            {/* Price Range */}
            <section>
              <PriceRange
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChangeMin={onMinPriceChange}
                onChangeMax={onMaxPriceChange}
              />
            </section>
          </>
        )}

      </div>
    </aside>
  );
}
