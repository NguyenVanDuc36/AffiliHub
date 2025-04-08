import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequestTyped } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import ProductComparisonPopup from "@/components/product-comparison-popup";
import EnhancedComparisonTable from "@/components/enhanced-comparison-table";

interface SimilarProductsResponse extends Array<Product> {}

interface ProductComparisonDetail {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  brand: string;
  rating: number;
  keyFeatures: string[];
  specs: {
    weight?: string;
    dimensions?: string;
    batteryLife?: string;
    connectivity?: string;
    [key: string]: string | undefined;
  };
  image: string;
  category: string;
  warranty: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  buyUrl: string;
}

interface DetailedComparisonResponse {
  products: ProductComparisonDetail[];
  comparison: {
    summary: string;
    recommendation: string;
    comparisonPoints: {
      category: string;
      description: string;
    }[];
  };
}

export default function SmartComparisonPageV2() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [showPopup, setShowPopup] = useState(true);
  const [initialProductId, setInitialProductId] = useState<number | undefined>(undefined);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [comparisonResult, setComparisonResult] = useState<DetailedComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse URL for initial product ID
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const productId = url.searchParams.get('productId');
      if (productId) {
        const id = parseInt(productId, 10);
        setInitialProductId(id);
        setProductIds([id]);
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
    }
  }, []);

  // Mutation to get detailed product comparison
  const {
    mutate: getDetailedComparison,
    isPending: isComparing,
  } = useMutation({
    mutationFn: (ids: number[]) => {
      return apiRequestTyped<DetailedComparisonResponse>(
        "/api/ai/detailed-product-comparison",
        {
          method: "POST",
          body: { productIds: ids },
        }
      );
    },
    onSuccess: (data) => {
      setComparisonResult(data);
      setIsLoading(false);
      toast({
        title: "So sánh hoàn tất",
        description: "Phân tích chi tiết các sản phẩm đã hoàn thành.",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Lỗi khi so sánh sản phẩm",
        description: error.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });

  // Handle comparison after product selection
  const handleCompare = (selectedIds: number[]) => {
    if (selectedIds.length < 2) {
      toast({
        title: "Cần chọn ít nhất 2 sản phẩm",
        description: "Vui lòng chọn ít nhất 2 sản phẩm để so sánh.",
        variant: "destructive",
      });
      return;
    }

    setProductIds(selectedIds);
    setShowPopup(false);
    setIsLoading(true);
    getDetailedComparison(selectedIds);
  };

  // Reset comparison and show product selection popup
  const resetComparison = () => {
    setShowPopup(true);
    setComparisonResult(null);
  };

  return (
    <div className="pb-16">
      <Helmet>
        <title>So sánh sản phẩm thông minh | Mua sắm thông minh</title>
      </Helmet>
      
      {/* Hero section */}
      <div className="bg-gradient-to-b from-primary/5 to-background pt-10 pb-8">
        <div className="container">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                Mới
              </span>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              So sánh sản phẩm thông minh
            </h1>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              So sánh chi tiết các sản phẩm dựa trên công nghệ AI hiện đại. Chúng tôi giúp bạn so sánh
              đặc điểm, giá cả và tính năng để đưa ra quyết định mua sắm sáng suốt.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-medium">Đang so sánh sản phẩm...</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md">
              AI đang phân tích và so sánh chi tiết các sản phẩm bạn đã chọn. Quá trình này có thể mất vài giây.
            </p>
            
            <div className="mt-6 w-full max-w-md">
              <div className="comparison-progress-bar">
                <div className="comparison-progress-bar-inner animate-progress"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Comparison results */}
        {!isLoading && comparisonResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetComparison}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
            </div>
            
            <EnhancedComparisonTable 
              products={comparisonResult.products}
              summary={comparisonResult.comparison.summary}
              recommendation={comparisonResult.comparison.recommendation}
            />
          </div>
        )}
      </div>
      
      {/* Product selection popup */}
      <ProductComparisonPopup 
        isOpen={showPopup}
        onClose={() => {
          // Nếu đã có kết quả so sánh, thì đóng popup
          // Nếu chưa có, quay về trang trước
          if (comparisonResult) {
            setShowPopup(false);
          } else {
            setLocation("/");
          }
        }}
        onCompare={handleCompare}
        initialProductId={initialProductId}
      />
    </div>
  );
}