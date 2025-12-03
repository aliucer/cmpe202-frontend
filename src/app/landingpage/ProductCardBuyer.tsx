import Image from "next/image";
import type { Product } from "../utils/types";
import ImageCarousel from "@/components/LandingPage/ImageCarousel";

// type Product = {
//     id : string;
//     title : string;
//     price : number;
//     category : string;
//     img : string;
// };

// What to add to the product card?
// 1. Add isLoggedIn prop to the component (DONE)
// 2. If isLoggedIn is true, add message button (bottom left)
// 2.5 Add report button (bottom right)
// 3. Change style to match Kalyani's design
// 4. (OPTIONAL) Add a "view details" action when clicking product card
// 4.5 - For simplicity, just have it be a drawer

interface ProductCardProps {
  product: Product;
  isLoggedIn: boolean;
  onClick?: () => void;
}

function ProductCardBuyer(
  { product, isLoggedIn, onClick}: ProductCardProps
) {
  return (
    <article
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden
                        transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      {/* WIREFRAME FOR IMAGE CAROUSEL
      {product.images && product.images.length > 0 && (
        <ImageCarousel images={product.images} alt={product.title} />
      )} */}
      {/*WIREFRAME FOR SINGLE IMAGE*/}
      {product.images[0] && (
        <div className="relative w-full h-48">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
          />
        </div>
      )}

      {/* Wireframe labels "Product Title" and "$Price" */}
      <div className="p-4">
        <h3 className="font-bold text-lg">{product.title}</h3>
        <p className="text-gray-600">${product.price.toFixed(2)}</p>
        {product.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
      </div>
    </article>
  );
}
export default ProductCardBuyer;