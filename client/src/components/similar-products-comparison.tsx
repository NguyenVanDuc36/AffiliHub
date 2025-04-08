import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequestTyped } from '@/lib/queryClient';
import { Product } from '@shared/schema';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, ChevronRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FullscreenLoading } from './fullscreen-loading';
import { ProductComparisonModal } from './product-comparison-modal';
import { formatPrice } from '@/lib/utils';

interface SimilarProductsComparisonProps {
  productId: number;
  product: Product;
}

export default function SimilarProductsComparison({ productId, product }: SimilarProductsComparisonProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([productId]);
  const [isComparing, setIsComparing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  
  // Query để lấy sản phẩm tương tự
  const { 
    data: similarProducts, 
    isLoading: isSimilarProductsLoading, 
    error: similarProductsError 
  } = useQuery({
    queryKey: ['/api/products/similar', productId],
    queryFn: async () => {
      return apiRequestTyped<Product[]>(`/api/products/${productId}/similar?max=3`);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
  
  // Query để lấy chi tiết so sánh
  const {
    refetch: fetchComparisonDetails,
    isLoading: isComparisonLoading
  } = useQuery({
    queryKey: ['/api/product-comparison', selectedProductIds.join('-')],
    queryFn: async () => {
      const response = await apiRequestTyped(`/api/ai/product-comparison`, {
        method: 'POST',
        body: { productIds: selectedProductIds }
      });
      return response;
    },
    enabled: false, // Không tự động gọi
    staleTime: 10 * 60 * 1000, // 10 phút
  });
  
  // Hàm thực hiện so sánh
  const handleCompare = async (productIds: number[]) => {
    setSelectedProductIds(productIds);
    setIsComparing(true);
    
    try {
      const result = await fetchComparisonDetails();
      setComparisonResult(result.data);
    } catch (error) {
      console.error('Error fetching comparison details:', error);
    } finally {
      setIsComparing(false);
    }
  };
  
  // Xử lý khi nhấn nút "So sánh thêm sản phẩm"
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  // Nếu đang tải sản phẩm tương tự
  if (isSimilarProductsLoading) {
    return (
      <div className="space-y-8 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sản phẩm tương tự</h2>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="w-full h-48" />
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="border-t p-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Nếu có lỗi khi tải sản phẩm tương tự
  if (similarProductsError) {
    return (
      <div className="my-8 p-6 border border-red-200 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Không thể tải sản phẩm tương tự</h2>
        <p className="text-red-600">
          Đã xảy ra lỗi khi tải sản phẩm tương tự. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }
  
  // Nếu không có sản phẩm tương tự
  if (!similarProducts || similarProducts.length === 0) {
    return (
      <div className="my-8 p-6 border border-gray-200 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm tương tự</h2>
        <p className="text-gray-600">
          Hiện không có sản phẩm tương tự để so sánh với {product.name}.
        </p>
      </div>
    );
  }
  
  // Chuẩn bị product IDs cho trường hợp mặc định (1 sản phẩm hiện tại + tối đa 3 sản phẩm tương tự)
  const defaultProductIds = [
    productId, 
    ...similarProducts.slice(0, 3).map(p => p.id)
  ];
  
  return (
    <div className="space-y-8 my-8">
      {/* Full-screen loading khi đang so sánh */}
      <FullscreenLoading 
        show={isComparing} 
        message="Đang phân tích và so sánh sản phẩm..."
        loadingText={[
          "Đang tìm kiếm thông tin chi tiết sản phẩm",
          "Đang phân tích các yếu tố quan trọng",
          "Đang so sánh tính năng và giá cả",
          "Đang xem xét điểm mạnh và điểm yếu",
          "Sắp hoàn thành, chỉ còn một chút nữa"
        ]}
      />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sản phẩm tương tự</h2>
        <Button 
          variant="outline" 
          onClick={handleOpenModal}
          className="hover-scale"
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          So sánh thêm sản phẩm
        </Button>
      </div>
      
      {/* Hiển thị sản phẩm tương tự dạng card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sản phẩm hiện tại */}
        <Card className="overflow-hidden border-primary/30 shadow-md">
          <Badge className="absolute top-2 right-2 bg-primary text-white">
            Sản phẩm đã chọn
          </Badge>
          <CardHeader className="p-0">
            <div className="w-full h-48 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform hover:scale-105" 
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <CardTitle className="text-xl truncate">{product.name}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {product.description || 'Không có mô tả chi tiết'}
            </CardDescription>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button 
              className="w-full"
              onClick={() => handleCompare(defaultProductIds)}
              disabled={isComparing}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              So sánh với sản phẩm tương tự
            </Button>
          </CardFooter>
        </Card>
        
        {/* Sản phẩm tương tự */}
        {similarProducts.slice(0, 3).map((similarProduct) => (
          <Card key={similarProduct.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-0">
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={similarProduct.image} 
                  alt={similarProduct.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <CardTitle className="text-xl truncate">{similarProduct.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  {formatPrice(similarProduct.price)}
                </span>
                {similarProduct.originalPrice > similarProduct.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(similarProduct.originalPrice)}
                  </span>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {similarProduct.description || 'Không có mô tả chi tiết'}
              </CardDescription>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleCompare([productId, similarProduct.id])}
                disabled={isComparing}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                So sánh với sản phẩm hiện tại
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Kết quả phân tích chi tiết */}
      {comparisonResult && (
        <div className="mt-12 space-y-8">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold">Phân tích & So sánh chi tiết</h2>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-sparkle" />
          </div>
          
          {/* Tóm tắt */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Tóm tắt & Đề xuất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Tổng quan:</h3>
                  <p className="text-muted-foreground">{comparisonResult.summary}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Đề xuất:</h3>
                  <p className="text-muted-foreground">{comparisonResult.recommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lợi ích chính */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonResult.mainBenefit.map((benefit: any, index: number) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Bảng so sánh chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle>Bảng so sánh chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table className="comparison-table w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Tính năng</TableHead>
                      {comparisonResult.comparisonTable.products.map((p: any) => (
                        <TableHead key={p.id}>
                          <div>
                            <div className="font-medium truncate max-w-[200px]">{p.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Score: {p.score}/10
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonResult.comparisonTable.features.map((feature: string, featureIndex: number) => (
                      <TableRow key={featureIndex}>
                        <TableCell className="font-medium">{feature}</TableCell>
                        {comparisonResult.comparisonTable.products.map((p: any) => (
                          <TableCell key={`${p.id}-${featureIndex}`}>
                            {p.values[featureIndex]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    
                    {/* Ưu điểm */}
                    <TableRow className="bg-green-50/50">
                      <TableCell className="font-medium">Ưu điểm</TableCell>
                      {comparisonResult.comparisonTable.products.map((p: any) => (
                        <TableCell key={`${p.id}-pros`}>
                          <ul className="list-disc ml-4 text-sm space-y-1">
                            {p.pros.map((pro: string, i: number) => (
                              <li key={i} className="text-green-700">
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Nhược điểm */}
                    <TableRow className="bg-red-50/50">
                      <TableCell className="font-medium">Nhược điểm</TableCell>
                      {comparisonResult.comparisonTable.products.map((p: any) => (
                        <TableCell key={`${p.id}-cons`}>
                          <ul className="list-disc ml-4 text-sm space-y-1">
                            {p.cons.map((con: string, i: number) => (
                              <li key={i} className="text-red-700">
                                {con}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Best For */}
                    <TableRow>
                      <TableCell className="font-medium">Phù hợp nhất</TableCell>
                      {comparisonResult.comparisonTable.products.map((p: any) => (
                        <TableCell key={`${p.id}-bestFor`}>
                          <span className="best-for-badge">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {p.bestFor}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* CTA */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              className="animate-gentle-pulse"
              onClick={handleOpenModal}
            >
              <BarChart2 className="mr-2 h-5 w-5" />
              So sánh thêm sản phẩm
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Modal để chọn thêm sản phẩm để so sánh */}
      <ProductComparisonModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedProduct={product}
        onCompare={handleCompare}
      />
    </div>
  );
}