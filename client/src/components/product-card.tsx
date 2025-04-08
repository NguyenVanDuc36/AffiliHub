import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { type Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const hasDiscount = product.originalPrice > product.price;

  return (
    <div className={className}>
      <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden h-full transition-all hover:shadow-lg">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-56 object-cover"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
          {product.tag && (
            <span className={cn(
              "absolute top-3 left-3 text-white text-xs px-2 py-1 rounded-full",
              !hasDiscount && "block",
              hasDiscount && "hidden"
            )}>
              {product.tag === "hot" && <span className="bg-amber-500 px-2 py-1 rounded-full">Hot</span>}
              {product.tag === "bestseller" && <span className="bg-green-500 px-2 py-1 rounded-full">Bestseller</span>}
              {product.tag === "trending" && <span className="bg-amber-500 px-2 py-1 rounded-full">Trending</span>}
            </span>
          )}
          <button 
            className="absolute top-3 right-3 bg-white/80 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-primary text-primary" : "text-primary")} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg line-clamp-2">{product.name}</h3>
          </div>
          <div className="flex items-center mb-2">
            <div className="flex text-amber-500">
              {Array(5).fill(0).map((_, i) => (
                <svg 
                  key={i} 
                  className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-current" : i < product.rating ? "fill-current opacity-50" : "stroke-current opacity-30")} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
              <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-end mb-3">
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-full transition-all hover:-translate-y-1 hover:shadow-md">
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
