import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { type Product } from "@shared/schema";

export default function TrendingProducts() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slidesCount = 4;

  const { data: trendingProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/trending'],
  });

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
  };

  // Auto slide change
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidesCount);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl flex items-center">
            <Flame className="h-6 w-6 mr-2 text-orange-500" /> Sản phẩm trending
          </h2>
          <Link href="/categories">
            <Button variant="link" className="text-primary hover:text-pink-500 font-medium">
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="relative">
          <div className="slider-track pb-4 flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {isLoading ? (
              // Loading skeleton
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="snap-start min-w-[280px] sm:min-w-[320px] animate-pulse">
                  <div className="bg-white rounded-2xl h-[400px] w-full overflow-hidden">
                    <div className="bg-gray-200 h-56 w-full"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3 w-32"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              trendingProducts?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="snap-start min-w-[280px] sm:min-w-[320px]"
                />
              ))
            )}
          </div>
        </div>
        
        {/* Slider Controls */}
        <div className="flex justify-center mt-6 gap-2">
          {Array(slidesCount).fill(0).map((_, index) => (
            <button 
              key={index}
              onClick={() => handleSlideChange(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === activeSlide ? "bg-primary" : "bg-gray-300 hover:bg-primary/50"
              )}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
