"use client";

import { useState } from "react";
import ProductCardBuyer from "./ProductCardBuyer";
import type { Product } from "../utils/types";
import ProductDetailedView from "@/components/ProductDetailedView";

function ProductGrid({ products, isLoggedIn } : { products: Product[], isLoggedIn: boolean }) {
    const [curProduct, setCurProduct] = useState<Product | null>(null);
    const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

    const handleCardClick = (product : Product) => {
        setCurProduct(product);
        setIsDetailedViewOpen(true);
    };

    const handleCloseDetailedView = () => {
        setIsDetailedViewOpen(false);
        setTimeout(() => setCurProduct(null), 300); // Wait for animation to complete
    };

    if (!products.length) {
        return (
            <p className="text-sm text-gray-600">
                No products match your filters.
            </p>
        );
    }

    return (
        <div>
            <div
                aria-label="Products"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
                {products.map((p) => (
                    <ProductCardBuyer 
                        key={p.id}
                        product={p}
                        isLoggedIn={isLoggedIn}
                        onClick={() => handleCardClick(p)}
                    />
                ))}
            </div>

            <ProductDetailedView
                product={curProduct}
                isOpen={isDetailedViewOpen}
                onClose={handleCloseDetailedView}
                showActions={true}
                isLoggedIn={isLoggedIn}
                onConversationCreated={(conversationId) => {
                    // Conversation will be opened via custom event
                    console.log("Conversation created:", conversationId);
                }}
            />
        </div>
    );
} 
export default ProductGrid;


// <ProductCardDrawer
//             product={curProduct}
//             isOpen={isDrawerOpen}
//             onClose={handleCloseDrawer}
//             actionsSlot={
//             isLoggedIn && (
//                 <>
//                 {/* Example buyer actions */}
//                 <button className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
//                     Message Seller
//                 </button>
//                 <button className="px-3 py-2 rounded-md border text-sm text-gray-700 hover:bg-gray-100">
//                     Report Listing
//                 </button>
//                 </>
//             )
//             }
//             />