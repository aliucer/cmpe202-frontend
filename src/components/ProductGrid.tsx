"use client";

import ProductCard from "./ProductCard";

type Product = {
    id : string | number;
    title : string;
    price : number;
    category : string;
    img : string;
};

function ProductGrid({ products } : { products: Product[] }) {
    if (!products.length) {
        return (
            <p className="text-sm text-gray-600">
                No products match your filters.
            </p>
        );
    }

    return (
        <div
            aria-label="Products"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
        >
            {products.map((p) => (
                <ProductCard
                    key={String(p.id)}
                    listing={{
                        id: Number(p.id),
                        title: p.title,
                        price: p.price,
                        image: p.img,
                    }}
                />
            ))}
        </div>
    );
} 
export default ProductGrid;
