import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Product } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { apiRequestTyped } from '@/lib/queryClient';
import SimilarProductsComparison from '@/components/similar-products-comparison';
import { FullscreenLoading } from '@/components/fullscreen-loading';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, ArrowLeft, Home } from 'lucide-react';
import { ComparePriceButton } from '@/components/compare-price-button';

interface SimilarProductsResponse extends Array<Product> {}

// Kiểu dữ liệu chi tiết so sánh sản phẩm
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
  warranty: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  buyUrl: string;
}

// Kiểu dữ liệu phản hồi so sánh chi tiết
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

export default function SmartComparisonPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const productId = Number(params.get('productId'));
  const [loading, setLoading] = useState(true);
  
  // Query để lấy tất cả sản phẩm
  const { 
    data: products,
    isLoading: isProductsLoading,
    error: productsError
  } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 phút
  });
  
  // Khi có dữ liệu, tắt loading
  useEffect(() => {
    if (!isProductsLoading) {
      setLoading(false);
    }
  }, [isProductsLoading]);
  
  // Tìm sản phẩm hiện tại từ danh sách sản phẩm
  const currentProduct = productId && products && Array.isArray(products) ? 
    products.find((p: Product) => p.id === productId) : undefined;
  
  // Lỗi khi không tìm thấy sản phẩm
  if (!isProductsLoading && (!productId || !currentProduct)) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-12 space-y-4">
          <h1 className="text-3xl font-bold">Không tìm thấy sản phẩm</h1>
          <p className="text-muted-foreground">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={() => setLocation('/')} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
            <Button onClick={() => setLocation('/san-pham')}>
              <BarChart2 className="mr-2 h-4 w-4" />
              Xem tất cả sản phẩm
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Full-screen loading */}
      <FullscreenLoading 
        show={loading}
        message="Đang tải thông tin sản phẩm..."
        loadingText={[
          "Đang tìm kiếm sản phẩm của bạn",
          "Sắp xong rồi, xin vui lòng đợi một chút",
          "Đang chuẩn bị giao diện so sánh",
          "Cảm ơn bạn đã kiên nhẫn chờ đợi"
        ]}
      />
      
      {/* Breadcrumb & Tiêu đề */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={() => setLocation('/')}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setLocation('/san-pham')}
          >
            Sản phẩm
          </Button>
          <span>/</span>
          <span className="font-medium text-foreground">So sánh thông minh</span>
        </div>
        
        <h1 className="text-3xl font-bold">So sánh thông minh</h1>
        <p className="text-muted-foreground mt-1">
          So sánh chi tiết về các tính năng, ưu nhược điểm, và giá cả giữa các sản phẩm tương tự
        </p>
      </div>
      
      {/* Nội dung chính */}
      {currentProduct && (
        <>
          {/* Sản phẩm hiện tại */}
          <Card className="mb-8 glassmorphism overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Sản phẩm bạn đang xem</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </div>
              <CardDescription>
                Thông tin chi tiết về sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="rounded-lg overflow-hidden border bg-white">
                    <img
                      src={currentProduct.image}
                      alt={currentProduct.name}
                      className="w-full h-auto object-cover aspect-square"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-2xl font-bold">{currentProduct.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentProduct.price)}
                    </span>
                    {currentProduct.originalPrice > currentProduct.price && (
                      <span className="text-muted-foreground line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-medium mb-1">Mô tả:</h3>
                    <p className="text-muted-foreground">
                      {currentProduct.description || 'Không có mô tả chi tiết về sản phẩm này.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentProduct.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {currentProduct.category}
                      </span>
                    )}
                    {currentProduct.rating && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {currentProduct.rating} sao
                      </span>
                    )}
                    {currentProduct.stock > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Còn hàng
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button
                onClick={() => window.open(`/product/${currentProduct.slug}`, '_blank')}
                className="w-full md:w-auto"
              >
                Mua ngay
              </Button>
              <ComparePriceButton
                productId={currentProduct.id}
                variant="outline"
                className="w-full md:w-auto mt-2 md:mt-0"
              />
            </CardFooter>
          </Card>
          
          {/* Component so sánh sản phẩm tương tự */}
          <SimilarProductsComparison 
            productId={currentProduct.id} 
            product={currentProduct} 
          />
        </>
      )}
    </div>
  );
}