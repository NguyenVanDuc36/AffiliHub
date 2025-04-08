import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import { type Product } from "@shared/schema";

interface RelatedProductsSectionProps {
  product: Product;
  relatedProducts: Product[];
}

const CATEGORIES = [
  "Laptop",
  "Điện thoại",
  "Đồng hồ", 
  "Tai nghe", 
  "Máy ảnh", 
  "Loa", 
  "Phụ kiện"
];

export default function RelatedProductsSection({ product, relatedProducts }: RelatedProductsSectionProps) {
  const [, setLocation] = useLocation();

  if (relatedProducts.length === 0) {
    return null;
  }

  // Phân loại category nếu trong danh sách category mặc định
  const categoryDisplay = CATEGORIES.find(cat => 
    product.category.toLowerCase().includes(cat.toLowerCase())
  ) || product.category;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sản phẩm cùng loại: {categoryDisplay}</h2>
        <Button 
          variant="outline" 
          onClick={() => setLocation(`/san-pham?category=${encodeURIComponent(product.category)}`)}
        >
          Xem tất cả
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.map((relatedProduct) => (
          <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={relatedProduct.image} 
                alt={relatedProduct.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
              {relatedProduct.originalPrice > relatedProduct.price && (
                <Badge className="absolute top-2 left-2 bg-red-500">
                  -{getDiscountPercentage(relatedProduct.originalPrice, relatedProduct.price)}%
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate">{relatedProduct.name}</h3>
              <div className="flex items-center mt-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx}
                      className={cn(
                        "h-3 w-3",
                        idx < relatedProduct.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  ({relatedProduct.reviewCount})
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-bold">{formatPrice(relatedProduct.price)}</span>
                {relatedProduct.originalPrice > relatedProduct.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(relatedProduct.originalPrice)}
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => setLocation(`/product/${relatedProduct.id}`)}
              >
                Xem chi tiết
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}