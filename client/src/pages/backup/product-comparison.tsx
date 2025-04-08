import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequestTyped, queryClient } from "@/lib/queryClient";
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
  const [_, search] = useSearch() || "";

  // Fetch all products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Sử dụng một ref để theo dõi xem URL đã được xử lý chưa
  const processedRef = useRef(false);

  // Parse URL query parameters to auto-fill product from detail page
  useEffect(() => {
    if (products && Array.isArray(products) && !isLoadingProducts && !processedRef.current) {
      // Parse productId from URL
      const params = new URLSearchParams(search || "");
      const productIdParam = params.get('productId');
      
      console.log("URL params:", search, "productId:", productIdParam);
      
      if (productIdParam) {
        const productId = parseInt(productIdParam, 10);
        console.log("Parsed productId:", productId);
        
        // Check if product exists and is not already selected
        const productExists = products.some((p: Product) => p.id === productId);
        console.log("Product exists:", productExists, "Already selected:", selectedProductIds.includes(productId));
        
        if (productExists) {
          // Add product to selected products automatically
          if (!selectedProductIds.includes(productId)) {
            processedRef.current = true; // Đánh dấu là đã xử lý
            
            setSelectedProductIds(prev => {
              // If there's already 3 products, replace the first one
              if (prev.length >= 3) {
                return [productId, ...prev.slice(1, 3)];
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
      }
    }
  }, [products, isLoadingProducts, search, selectedProductIds, toast]);

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

                      <div className="space-y-2">
                        <h3 className="font-medium">Sản phẩm có sẵn:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {products && Array.isArray(products) ? products.map((product: Product) => (
                            <div
                              key={product.id}
                              className={`rounded-lg p-3 flex items-center cursor-pointer hover:bg-accent/50 ${
                                selectedProductIds.includes(product.id)
                                  ? "bg-accent"
                                  : ""
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
                                <p className="text-sm text-muted-foreground">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </div>
                          )) : null}
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

                    <Tabs defaultValue="pros-cons">
                      <TabsList className="grid grid-cols-1 md:grid-cols-2">
                        <TabsTrigger value="pros-cons">Ưu/Nhược điểm</TabsTrigger>
                        <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                      </TabsList>
                      <TabsContent value="pros-cons" className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {comparisonResult.comparisonTable.products.map(
                            (product) => (
                              <Card key={product.id}>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">
                                    {product.name}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                                        <ChevronUp className="h-4 w-4 mr-1" />
                                        Ưu điểm
                                      </h4>
                                      <ul className="text-sm space-y-1">
                                        {product.pros.map((pro, index) => (
                                          <li key={index} className="flex">
                                            <span className="text-green-600 mr-2">✓</span>
                                            {pro}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                                        <ChevronDown className="h-4 w-4 mr-1" />
                                        Nhược điểm
                                      </h4>
                                      <ul className="text-sm space-y-1">
                                        {product.cons.map((con, index) => (
                                          <li key={index} className="flex">
                                            <span className="text-red-600 mr-2">✗</span>
                                            {con}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="mt-4 pt-3 border-t">
                                      <h4 className="text-sm font-medium mb-1">
                                        Phù hợp nhất cho:
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {product.bestFor}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="products" className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {comparisonResult.comparisonTable.products.map(
                            (product) => {
                              const fullProduct = getProductById(product.id);
                              return fullProduct ? (
                                <Card key={product.id}>
                                  <CardContent className="p-4">
                                    <div className="aspect-square overflow-hidden rounded-md mb-2">
                                      <img
                                        src={fullProduct.image}
                                        alt={fullProduct.name}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                    <h3 className="font-medium line-clamp-2 h-12">{fullProduct.name}</h3>
                                    <p className="text-sm text-muted-foreground">{fullProduct.category}</p>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="font-bold">
                                        {formatPrice(fullProduct.price)}
                                      </span>
                                      {fullProduct.originalPrice > fullProduct.price && (
                                        <Badge
                                          variant="destructive"
                                          className="ml-2"
                                        >
                                          -{Math.round(
                                            ((fullProduct.originalPrice - fullProduct.price) /
                                              fullProduct.originalPrice) *
                                              100
                                          )}%
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="mt-4">
                                      <p className="text-sm">{fullProduct.description}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : null;
                            }
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button onClick={resetComparison}>
                  So sánh các sản phẩm khác
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}