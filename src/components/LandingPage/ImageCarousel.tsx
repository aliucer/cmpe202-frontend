"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const lastIndex = images.length - 1;

  const goPrev = () =>
    setCurrent((prev) => (prev === 0 ? lastIndex : prev - 1));

  const goNext = () =>
    setCurrent((prev) => (prev === lastIndex ? 0 : prev + 1));

  return (
    <div className="relative w-full h-48 overflow-hidden">
      {/* Current image */}
      <Image
        key={images[current]} // helps Next/Image re-render correctly
        src={images[current]}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
      />

      {/* Arrows (only if more than 1 image) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white px-2 py-1 text-sm hover:bg-black/60"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white px-2 py-1 text-sm hover:bg-black/60"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Dots / indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                className={[
                  "h-2 w-2 rounded-full",
                  index === current ? "bg-white" : "bg-white/50",
                ].join(" ")}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
