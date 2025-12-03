// components/ProductCardDrawer.tsx
"use client";

import React from "react";
import Image from "next/image";
import type { Product } from "@/app/utils/types";

interface ProductCardDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;

  // Optional slots to customize content per use-case
  headerSlot?: React.ReactNode;   // e.g. extra info / badges
  actionsSlot?: React.ReactNode;  // e.g. buttons (message seller, delete, etc.)
}

export default function ProductCardDrawer({
  product,
  isOpen,
  onClose,
  headerSlot,
  actionsSlot,
}: ProductCardDrawerProps) {
  if (!product) return null;

  return (
    // BACKDROP
    <div
      className={`fixed inset-0 z-40 flex justify-end transition-opacity duration-300
                  ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      {/* DRAWER PANEL */}
      <div
        className={`
          relative z-50 w-full max-w-md bg-white shadow-xl border-l border-gray-200
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside drawer
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {product.title}
            </h2>
            <p className="text-sm text-gray-500">
              {product.category}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex items-center justify-center rounded-md p-1
                       text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close product details"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Optional custom header content (e.g. status chips, badges) */}
        {headerSlot && (
          <div className="px-4 py-2 border-b border-gray-100">
            {headerSlot}
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Image */}
          {product.images?.[0] && (
            <div className="relative w-full h-56 rounded-md overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          )}

          {/* Price & Description */}
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
            {product.description && (
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            )}
          </div>

          {/* More product metadata (optional) */}
          <div className="text-sm text-gray-500 space-y-1">
            {/* {product.location && (
              <p><span className="font-medium">Location:</span> {product.location}</p>
            )}
            {product.condition && (
              <p><span className="font-medium">Condition:</span> {product.condition}</p>
            )} */}
            {/* Add any extra fields you have on Product */}
          </div>
        </div>

        {/* Footer / Actions */}
        {(actionsSlot) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
            {actionsSlot}
          </div>
        )}
      </div>
    </div>
  );
}
