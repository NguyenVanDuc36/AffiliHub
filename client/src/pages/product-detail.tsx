import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Product } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { apiRequestTyped } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import RelatedProductsSection from '@/components/related-products-section';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { FullscreenLoading } from '@/components/fullscreen-loading';
import { ComparePriceButton } from '@/components/compare-price-button';
import { cn, formatPrice, getDiscountPercentage } from '@/lib/utils';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  Info, 
  CheckCircle, 
  Award, 
  Truck, 
  Shield, 
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  ZoomIn,
  ImageIcon,
  ChevronLeft
} from 'lucide-react';

export default function ProductDetailPage() {
  const [location, setLocation] = useLocation();
  const params = location.split('/');
  const productId = Number(params[params.length - 1]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullImage, setShowFullImage] = useState(false);
  
  // Query để lấy chi tiết sản phẩm
  const { 
    data: product,
    isLoading: isProductLoading,
    error: productError
  } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      return apiRequestTyped<Product>(`/api/products/${productId}`);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
  
  // Query để lấy sản phẩm cùng category
  const {
    data: similarProducts,
    isLoading: isSimilarProductsLoading,
  } = useQuery<Product[]>({
    queryKey: ['/api/products', 'category', product?.category],
    queryFn: async () => {
      return apiRequestTyped<Product[]>(`/api/products?category=${encodeURIComponent(product?.category || '')}`);
    },
    enabled: !!product?.category,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
  
  // Khi có dữ liệu, tắt loading
  useEffect(() => {
    if (!isProductLoading && product) {
      setLoading(false);
    }
  }, [isProductLoading, product]);
  
  // Lỗi khi không tìm thấy sản phẩm
  if (!isProductLoading && !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-12 space-y-4">
          <h1 className="text-3xl font-bold">Không tìm thấy sản phẩm</h1>
          <p className="text-muted-foreground">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={() => setLocation('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
            <Button onClick={() => setLocation('/san-pham')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Xem tất cả sản phẩm
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Chỉ hiển thị các sản phẩm cùng category nhưng khác ID với sản phẩm hiện tại
  const relatedProducts = similarProducts?.filter(p => 
    p.id !== productId && 
    p.category === product?.category
  ).slice(0, 6) || [];
  
  // Tạo mảng ảnh để hiển thị (nhiều góc nhìn của sản phẩm)
  const productImages = product ? [
    product.image,
    // Thêm các ảnh khác dựa vào category của sản phẩm
    ...generateAdditionalProductImages(product)
  ] : [];
  
  // Hàm tạo ảnh bổ sung cho sản phẩm dựa vào category
  function generateAdditionalProductImages(product: Product): string[] {
    // Tạo URL ảnh có số ngẫu nhiên để sử dụng cho ảnh thumbnail
    const baseUrl = product.image.split('?')[0];
    const additionalImages: string[] = [];
    
    // Tạo 3-4 ảnh bổ sung với kích thước khác nhau
    for (let i = 1; i <= 4; i++) {
      additionalImages.push(`${baseUrl}?s=${100 + i * 50}`);
    }
    
    return additionalImages;
  }
  
  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Full-screen loading */}
      <FullscreenLoading 
        show={loading} 
        message="Đang tải thông tin sản phẩm..."
      />
      
      {/* Enhanced Full-screen image viewer with navigation */}
      {showFullImage && product && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
              onClick={() => setShowFullImage(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white py-1 px-3 rounded-full text-sm z-10">
              {currentImageIndex + 1} / {productImages.length}
            </div>
            
            {/* Previous image button */}
            {currentImageIndex > 0 && (
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => Math.max(0, prev - 1));
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}
            
            {/* Next image button */}
            {currentImageIndex < productImages.length - 1 && (
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => Math.min(productImages.length - 1, prev + 1));
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}
            
            {/* Main Image with zoom capability */}
            <div 
              className="w-full h-full flex items-center justify-center"
              onClick={() => setShowFullImage(false)}
            >
              <img 
                src={productImages[currentImageIndex]} 
                alt={product.name}
                className="max-h-[85vh] max-w-[85vw] object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Thumbnail navigation */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  className={cn(
                    "w-16 h-16 rounded-md border overflow-hidden flex-shrink-0",
                    currentImageIndex === idx 
                      ? "border-white ring-2 ring-white/30" 
                      : "border-gray-600 opacity-70 hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} - Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => setLocation('/')}
        >
          Trang chủ
        </Button>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => setLocation('/san-pham')}
        >
          Sản phẩm
        </Button>
        {product?.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => setLocation(`/san-pham?category=${encodeURIComponent(product.category)}`)}
            >
              {product.category}
            </Button>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product?.name || ''}
        </span>
      </div>
      
      {product && (
        <>
          {/* Product Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Product Images */}
            <div className="space-y-4">
              {/* Main image with glassmorphism effects */}
              <div 
                className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm aspect-square group"
                style={{
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Image wrapper with hover effects */}
                <div className="absolute inset-0 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Zoom/Fullscreen button */}
                <button 
                  className="absolute bottom-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-md border z-10 transition-transform transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-300"
                  onClick={() => setShowFullImage(true)}
                >
                  <ZoomIn className="h-5 w-5 text-gray-700" />
                </button>
                
                {/* Image counter */}
                <div className="absolute bottom-3 left-3 bg-black/50 text-white py-1 px-3 rounded-full text-xs z-10 transition-transform transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-300">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
                
                {/* Discount badge */}
                {product.originalPrice > product.price && (
                  <Badge className="absolute top-3 left-3 bg-red-500 shadow-md px-2 py-1 text-sm font-medium">
                    -{getDiscountPercentage(product.originalPrice, product.price)}%
                  </Badge>
                )}
                
                {/* Navigation arrows for desktop */}
                {productImages.length > 1 && (
                  <>
                    {currentImageIndex > 0 && (
                      <button 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-1 rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => Math.max(0, prev - 1));
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                    
                    {currentImageIndex < productImages.length - 1 && (
                      <button 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-1 rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => Math.min(productImages.length - 1, prev + 1));
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {/* Thumbnail images with glassmorphism effect */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-2 px-1">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "h-20 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 hover:scale-105",
                        currentImageIndex === idx 
                          ? "ring-2 ring-primary shadow-md scale-105 z-10" 
                          : "border border-gray-200 opacity-80 hover:opacity-100"
                      )}
                      style={{
                        background: currentImageIndex === idx ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)'
                      }}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <div className="w-full h-full p-1">
                        <img 
                          src={img} 
                          alt={`${product.name} - Hình ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Column - Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx}
                        className={cn(
                          "h-4 w-4",
                          idx < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviewCount} đánh giá)</span>
                  {product.stock > 0 ? (
                    <Badge variant="outline" className="ml-3 text-green-600 border-green-200 bg-green-50">
                      Còn hàng
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-3 text-red-600 border-red-200 bg-red-50">
                      Hết hàng
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-baseline gap-3">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice > product.price && (
                  <div className="text-muted-foreground line-through text-lg">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-medium">Mô tả:</h3>
                <p className="text-muted-foreground">
                  {product.description}
                </p>
              </div>
              
              {/* Quantity selector */}
              <div className="flex items-center space-x-3">
                <span className="font-medium">Số lượng:</span>
                <div className="flex items-center border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 10)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} sản phẩm có sẵn
                </span>
              </div>
              
              {/* Action buttons with enhanced styling */}
              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                {/* Buy Now Button */}
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 h-14 rounded-xl"
                  onClick={() => window.open(`https://example.com/buy/${product.slug}`, '_blank')}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  <span className="font-medium">Mua ngay</span>
                </Button>
                
                {/* Compare Price Button - Glassmorphism style */}
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-all duration-300"></div>
                  <ComparePriceButton 
                    productId={product.id}
                    variant="outline"
                    size="lg"
                    className="relative flex-1 w-full h-14 bg-white/90 border-blue-200 text-blue-700 hover:text-blue-800 hover:border-blue-300 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                  />
                </div>
                
                {/* Wishlist & Share Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-14 w-14 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors duration-300"
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-14 w-14 border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-300"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              {/* Product highlights */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Giao hàng miễn phí</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Bảo hành 12 tháng</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span>Cam kết chất lượng</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details Tabs */}
          <div className="mb-12">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="details">Thông tin chi tiết</TabsTrigger>
                <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá ({product.reviewCount})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="prose max-w-none">
                  <h3>Mô tả chi tiết sản phẩm</h3>
                  <p>{product.description}</p>
                  
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                  </p>
                  
                  <h4>Tính năng nổi bật</h4>
                  <ul>
                    <li>Thiết kế hiện đại, sang trọng</li>
                    <li>Chất lượng âm thanh cao cấp</li>
                    <li>Pin lâu, sạc nhanh</li>
                    <li>Kết nối bluetooth 5.0 ổn định</li>
                    <li>Chống ồn chủ động</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="specs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Thông số</TableHead>
                      <TableHead>Chi tiết</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Thương hiệu</TableCell>
                      <TableCell>Sony</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Model</TableCell>
                      <TableCell>WH-1000XM4</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Màu sắc</TableCell>
                      <TableCell>Đen</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Kết nối</TableCell>
                      <TableCell>Bluetooth 5.0, Jack 3.5mm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Thời lượng pin</TableCell>
                      <TableCell>Lên đến 30 giờ</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Trọng lượng</TableCell>
                      <TableCell>254g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bảo hành</TableCell>
                      <TableCell>12 tháng chính hãng</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <div className="text-center py-8">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Chưa có đánh giá nào</h3>
                  <p className="text-muted-foreground mt-1">
                    Hãy là người đầu tiên đánh giá sản phẩm này
                  </p>
                  <Button className="mt-4">
                    Viết đánh giá
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Related Products */}
          {product && relatedProducts.length > 0 && (
            <RelatedProductsSection product={product} relatedProducts={relatedProducts} />
          )}
        </>
      )}
    </div>
  );
}