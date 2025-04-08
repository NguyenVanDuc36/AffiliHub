import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, Search, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequestTyped } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

type ComparisonResult = {
  summary: string;
  recommendations: string;
  mainBenefit: {
    title: string;
    description: string;
  }[];
  comparisonTable: {
    features: string[];
    products: Array<{
      id: number;
      name: string;
      values: string[];
      score: number;
      pros: string[];
      cons: string[];
      bestFor: string;
    }>;
  };
};

export default function ProductComparisonPage() {
  const { toast } = useToast();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [preferences, setPreferences] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [location] = useLocation();
  
  // Flag to track if we've processed URL params
  const urlProcessed = useRef(false);

  // Fetch all products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // State cho bộ lọc sản phẩm
  const [productFilters, setProductFilters] = useState({
    search: "",
    priceRange: "all",
    brand: [] as string[],
    rating: null as number | null,
    category: "" // Lọc theo category
  });
  
  // Parse URL query parameters to auto-fill product from detail page
  useEffect(() => {
    if (
      !urlProcessed.current && 
      products && 
      Array.isArray(products) && 
      !isLoadingProducts &&
      location
    ) {
      try {
        // Get URL params
        const url = new URL(window.location.href);
        const productIdParam = url.searchParams.get('productId');
        
        console.log("URL params parsed:", productIdParam);
        
        if (productIdParam) {
          const productId = parseInt(productIdParam, 10);
          console.log("Parsed productId:", productId);
          
          // Check if product exists
          const productExists = products.some((p: Product) => p.id === productId);
          console.log("Product exists:", productExists);
          
          if (productExists) {
            urlProcessed.current = true; // Mark as processed
            
            // Add the product to selection - LUÔN THÊM VÀO MẢNG, KHÔNG THAY THẾ
            setSelectedProductIds(prev => {
              // Skip if already in the list
              if (prev.includes(productId)) {
                return prev;
              }
              
              // If there's already 3 products, don't add more
              if (prev.length >= 3) {
                toast({
                  title: "Đã đạt giới hạn 3 sản phẩm",
                  description: "Vui lòng bỏ chọn một sản phẩm trước khi thêm sản phẩm mới.",
                  variant: "destructive",
                });
                return prev;
              }
              
              // Otherwise, add to existing selection
              return [...prev, productId];
            });
            
            toast({
              title: "Sản phẩm đã được thêm",
              description: "Sản phẩm từ trang chi tiết đã được thêm vào danh sách so sánh.",
            });
          }
        }
      } catch (error) {
        console.error("Error parsing URL parameters:", error);
      }
    }
  }, [products, isLoadingProducts, location, toast]);

  // Create a mutation for comparing products
  const {
    mutate: compareProducts,
    data: comparisonResult,
    isPending: isComparing,
    isError: hasComparisonError,
    error: comparisonError,
  } = useMutation({
    mutationFn: async ({
      productIds,
      preferences,
    }: {
      productIds: number[];
      preferences?: string;
    }) => {
      return apiRequestTyped<ComparisonResult>(
        "/api/ai/product-comparison",
        {
          method: "POST",
          body: { productIds, preferences },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "So sánh hoàn tất",
        description: "Chúng tôi đã phân tích và so sánh các sản phẩm cho bạn.",
      });
      setShowResults(true);
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi so sánh sản phẩm",
        description: error.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });

  // Handle product selection
  const handleProductSelection = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      // Only allow up to 3 products to be compared
      if (selectedProductIds.length < 3) {
        setSelectedProductIds([...selectedProductIds, productId]);
      } else {
        toast({
          title: "Đã đạt giới hạn",
          description: "Chỉ có thể so sánh tối đa 3 sản phẩm một lúc.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle compare button click
  const handleCompare = () => {
    if (selectedProductIds.length < 2) {
      toast({
        title: "Cần chọn ít nhất 2 sản phẩm",
        description: "Vui lòng chọn ít nhất 2 sản phẩm để so sánh.",
        variant: "destructive",
      });
      return;
    }

    compareProducts({
      productIds: selectedProductIds,
      preferences: preferences || undefined,
    });
  };

  // Reset comparison
  const resetComparison = () => {
    setSelectedProductIds([]);
    setPreferences("");
    setShowResults(false);
  };

  // Helper to get product info by ID
  const getProductById = (id: number): Product | undefined => {
    if (products && Array.isArray(products)) {
      return products.find((p: Product) => p.id === id);
    }
    return undefined;
  };

  return (
    <div className="container py-8">
      <Helmet>
        <title>So sánh sản phẩm thông minh | Mua sắm thông minh</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            So sánh sản phẩm thông minh <Sparkles className="inline h-6 w-6 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground mt-2">
            So sánh các sản phẩm một cách chi tiết với phân tích AI để đưa ra quyết định mua sắm thông minh
          </p>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Chọn sản phẩm để so sánh (tối đa 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {isLoadingProducts ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2">Đang tải danh sách sản phẩm...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedProductIds.map((id) => {
                          const product = getProductById(id);
                          return product ? (
                            <Card key={id} className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                onClick={() => handleProductSelection(id)}
                              >
                                &times;
                              </Button>
                              <CardContent className="p-4">
                                <div className="aspect-square overflow-hidden rounded-md mb-2">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <p className="font-medium line-clamp-2 h-12">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="font-bold">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice > product.price && (
                                    <Badge variant="destructive" className="ml-2">
                                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ) : null;
                        })}

                        {Array.from({ length: 3 - selectedProductIds.length }).map((_, index) => (
                          <Card key={`empty-${index}`} className="border-dashed">
                            <CardContent className="p-4 flex items-center justify-center h-[300px]">
                              <p className="text-muted-foreground text-center">
                                Chọn sản phẩm từ danh sách bên dưới
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        {/* Phần bộ lọc */}
                        <div className="space-y-3 bg-muted/50 p-4 rounded-lg border">
                          <h3 className="font-medium">Bộ lọc sản phẩm:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Tìm kiếm */}
                            <div className="col-span-1 md:col-span-3">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  placeholder="Tìm kiếm sản phẩm..."
                                  className="pl-8 pr-4 py-2 w-full border rounded-md"
                                  value={productFilters.search}
                                  onChange={(e) => setProductFilters({...productFilters, search: e.target.value})}
                                />
                              </div>
                            </div>
                            
                            {/* Lọc giá */}
                            <div>
                              <label className="block text-sm font-medium mb-1">Khoảng giá</label>
                              <select 
                                className="w-full border rounded-md p-2"
                                value={productFilters.priceRange}
                                onChange={(e) => setProductFilters({...productFilters, priceRange: e.target.value})}
                              >
                                <option value="all">Tất cả mức giá</option>
                                <option value="under2m">Dưới 2 triệu</option>
                                <option value="2m-5m">2 - 5 triệu</option>
                                <option value="above5m">Trên 5 triệu</option>
                              </select>
                            </div>
                            
                            {/* Lọc theo rating */}
                            <div>
                              <label className="block text-sm font-medium mb-1">Đánh giá</label>
                              <select 
                                className="w-full border rounded-md p-2"
                                value={productFilters.rating === null ? "" : productFilters.rating.toString()}
                                onChange={(e) => setProductFilters({...productFilters, rating: e.target.value ? Number(e.target.value) : null})}
                              >
                                <option value="">Tất cả đánh giá</option>
                                <option value="4">Từ 4 sao trở lên</option>
                                <option value="3">Từ 3 sao trở lên</option>
                              </select>
                            </div>
                            
                            {/* Lọc theo danh mục */}
                            <div>
                              <label className="block text-sm font-medium mb-1">Loại sản phẩm</label>
                              <select 
                                className="w-full border rounded-md p-2"
                                value={productFilters.category}
                                onChange={(e) => {
                                  // Đặt category filter, nếu sản phẩm đã được chọn, lấy category từ sản phẩm đầu tiên
                                  const newCategory = e.target.value;
                                  setProductFilters({...productFilters, category: newCategory});
                                  
                                  // Nếu có sản phẩm được chọn, ưu tiên lọc theo loại của sản phẩm đầu tiên
                                  if (selectedProductIds.length > 0 && newCategory === "") {
                                    const firstProduct = getProductById(selectedProductIds[0]);
                                    if (firstProduct) {
                                      setProductFilters(prev => ({...prev, category: firstProduct.category}));
                                    }
                                  }
                                }}
                              >
                                <option value="">Tất cả loại</option>
                                {products && Array.isArray(products) 
                                  ? (products
                                      .map(p => p.category)
                                      .filter((category, index, self) => self.indexOf(category) === index))
                                      .map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                      ))
                                  : null}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setProductFilters({
                                search: "",
                                priceRange: "all",
                                brand: [],
                                rating: null,
                                category: ""
                              })}
                            >
                              Xóa bộ lọc
                            </Button>
                          </div>
                        </div>
                        
                        {/* Danh sách sản phẩm có sẵn */}
                        <div className="space-y-2">
                          <h3 className="font-medium">Sản phẩm có sẵn:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {products && Array.isArray(products) ? products
                              .filter((product: Product) => {
                                // Lọc theo tìm kiếm
                                if (productFilters.search && !product.name.toLowerCase().includes(productFilters.search.toLowerCase())) {
                                  return false;
                                }
                                
                                // Lọc theo giá
                                if (productFilters.priceRange !== "all") {
                                  const price = product.price;
                                  
                                  if (productFilters.priceRange === "under2m" && price >= 2000000) return false;
                                  if (productFilters.priceRange === "2m-5m" && (price < 2000000 || price > 5000000)) return false;
                                  if (productFilters.priceRange === "above5m" && price <= 5000000) return false;
                                }
                                
                                // Lọc theo đánh giá
                                if (productFilters.rating !== null && product.rating < productFilters.rating) {
                                  return false;
                                }
                                
                                // Lọc theo danh mục - Nếu đã chọn ít nhất 1 sản phẩm, tự động lọc theo category của sản phẩm đầu tiên
                                if (selectedProductIds.length > 0) {
                                  const firstProduct = getProductById(selectedProductIds[0]);
                                  if (firstProduct && product.category !== firstProduct.category) {
                                    return false;
                                  }
                                } 
                                // Nếu không có sản phẩm nào được chọn, lọc theo category từ bộ lọc
                                else if (productFilters.category && product.category !== productFilters.category) {
                                  return false;
                                }
                                
                                return true;
                              })
                              .map((product: Product) => (
                                <div
                                  key={product.id}
                                  className={`rounded-lg p-3 flex items-center cursor-pointer hover:bg-accent/50 transition-all duration-200 ${
                                    selectedProductIds.includes(product.id)
                                      ? "bg-accent shadow-md"
                                      : "border"
                                  }`}
                                  onClick={() => handleProductSelection(product.id)}
                                >
                                  <div className="w-16 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <p className="font-medium line-clamp-1">
                                      {product.name}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-muted-foreground">
                                        {formatPrice(product.price)}
                                      </p>
                                      <p className="text-sm text-muted-foreground flex items-center">
                                        {product.rating} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                                      </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{product.category}</div>
                                  </div>
                                </div>
                              )) : null}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Thêm yêu cầu của bạn (không bắt buộc)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Mô tả những điều bạn quan tâm. Ví dụ: Tôi cần một sản phẩm bền, phù hợp cho nhu cầu sử dụng hàng ngày..."
                  className="min-h-[100px]"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleCompare}
                disabled={
                  selectedProductIds.length < 2 ||
                  isComparing ||
                  isLoadingProducts
                }
                className="w-full md:w-auto"
              >
                {isComparing ? (
                  <>
                    <span className="animate-spin mr-2">⭘</span>
                    Đang so sánh...
                  </>
                ) : (
                  <>
                    So sánh sản phẩm
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          comparisonResult && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả so sánh sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Tóm tắt so sánh</h3>
                      <p className="text-muted-foreground">
                        {comparisonResult.summary}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Khuyến nghị</h3>
                      <div className="p-4 bg-primary/10 rounded-lg border">
                        {comparisonResult.recommendations}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Yếu tố quyết định</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {comparisonResult.mainBenefit?.map((benefit, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base text-primary">
                                {benefit.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                {benefit.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Bảng so sánh chi tiết</h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">
                                Tính năng / Sản phẩm
                              </th>
                              {comparisonResult.comparisonTable.products.map(
                                (product) => (
                                  <th
                                    key={product.id}
                                    className="px-4 py-3 text-left font-medium"
                                  >
                                    <div>
                                      <p>{product.name}</p>
                                      <div className="flex items-center mt-1">
                                        <div className="w-full bg-muted rounded-full h-2">
                                          <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                              width: `${product.score * 10}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-bold">
                                          {product.score}/10
                                        </span>
                                      </div>
                                    </div>
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {comparisonResult.comparisonTable.features.map(
                              (feature, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 align-top">
                                    <span className="font-medium">{feature}</span>
                                  </td>
                                  {comparisonResult.comparisonTable.products.map(
                                    (product) => (
                                      <td
                                        key={`${product.id}-${index}`}
                                        className="px-4 py-3 align-top"
                                      >
                                        {product.values[index]}
                                      </td>
                                    )
                                  )}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      {comparisonResult.comparisonTable.products.map((product) => (
                        <Card key={product.id}>
                          <CardHeader>
                            <CardTitle className="text-base">{product.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-green-600">Ưu điểm</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {product.pros.map((pro, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground">
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2 text-red-600">Nhược điểm</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {product.cons.map((con, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground">
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-2 pt-2 border-t">
                              <h4 className="text-sm font-medium mb-1">Phù hợp nhất cho</h4>
                              <p className="text-sm">{product.bestFor}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-center pt-6">
                      <Button variant="outline" onClick={resetComparison}>
                        So sánh sản phẩm khác
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
}