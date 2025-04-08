import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bolt } from "lucide-react";
import { Link } from "wouter";
import { cn, formatPrice } from "@/lib/utils";
import { type Product } from "@shared/schema";

interface CountdownValues {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function FlashSale() {
  const [countdown, setCountdown] = useState<CountdownValues>({
    hours: 2,
    minutes: 15,
    seconds: 8
  });

  const { data: flashSaleProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/flash-sale'],
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 to-pink-500/10">
      <div className="container mx-auto px-4">
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 bg-pink-500 text-white px-6 py-2 rounded-bl-2xl font-semibold">
            FLASH SALE
          </div>
          
          <div className="flex flex-col lg:flex-row items-center mb-8 pt-6">
            <div className="lg:w-1/2 mb-6 lg:mb-0">
              <h2 className="font-poppins font-bold text-3xl mb-3">Flash Sale Hôm Nay</h2>
              <p className="text-gray-600 mb-4">Ưu đãi đặc biệt chỉ trong hôm nay. Nhanh tay mua ngay!</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-xl font-semibold">Kết thúc sau:</div>
                <div className="flex gap-2">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg w-14 text-center">
                    <div className="text-xl font-bold">{formatTime(countdown.hours)}</div>
                    <div className="text-xs">Giờ</div>
                  </div>
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg w-14 text-center">
                    <div className="text-xl font-bold">{formatTime(countdown.minutes)}</div>
                    <div className="text-xs">Phút</div>
                  </div>
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg w-14 text-center">
                    <div className="text-xl font-bold">{formatTime(countdown.seconds)}</div>
                    <div className="text-xs">Giây</div>
                  </div>
                </div>
              </div>
              
              <Link href="/categories?sale=flash">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-full transition-all hover:-translate-y-1 hover:shadow-lg animate-pulse flex items-center">
                  <Bolt className="mr-2 h-5 w-5" /> Xem tất cả sản phẩm giảm giá
                </Button>
              </Link>
            </div>
            
            <div className="lg:w-1/2 flex flex-wrap justify-center gap-4">
              {isLoading ? (
                // Loading skeleton
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse bg-white/80 rounded-xl overflow-hidden w-40 md:w-48 shadow-md">
                    <div className="bg-gray-200 h-32 w-full"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="h-5 w-20 bg-gray-200 rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
                        </div>
                        <div className="h-6 w-14 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                flashSaleProducts?.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a className="bg-white/80 rounded-xl overflow-hidden w-40 md:w-48 shadow-md hover:shadow-lg transition-all">
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-red-500 text-white font-bold px-2 py-1 rounded-br-lg">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-primary font-bold">{formatPrice(product.price)}</div>
                            <div className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
                          </div>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            product.stock < 5 
                              ? "bg-red-50 text-red-500" 
                              : product.stock < 20 
                                ? "bg-amber-50 text-amber-500" 
                                : "bg-green-50 text-green-500"
                          )}>
                            {product.stock < 5 
                              ? "Sắp hết" 
                              : `Còn ${product.stock}`}
                          </span>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
