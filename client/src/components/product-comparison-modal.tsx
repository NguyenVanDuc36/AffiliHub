import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequestTyped, queryClient } from "@/lib/queryClient";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Product } from "@shared/schema";
import { BarChart, Filter, Search, Star, X, CheckCircle, ChevronRight, Loader2 } from "lucide-react";

interface ProductComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product;
  onCompare: (selectedProductIds: number[]) => void;
}

type FilterOptions = {
  search: string;
  priceRange: string;
  brand: string[];
  rating: number | null;
  category: string[];
};

export function ProductComparisonModal({
  open,
  onOpenChange,
  selectedProduct,
  onCompare
}: ProductComparisonModalProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([selectedProduct.id]);
  const [isComparing, setIsComparing] = useState(false);
  
  // State cho bộ lọc
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    priceRange: "all",
    brand: [],
    rating: null,
    category: [],
  });
  
  // Reset lại trạng thái khi modal đóng
  useEffect(() => {
    if (!open) {
      setSelectedProductIds([selectedProduct.id]);
      setIsComparing(false);
      setFilters({
        search: "",
        priceRange: "all",
        brand: [],
        rating: null,
        category: [],
      });
    } else {
      // Khi mở modal, luôn chọn sản phẩm hiện tại
      setSelectedProductIds([selectedProduct.id]);
    }
  }, [open, selectedProduct.id]);
  
  // Query để lấy sản phẩm tương tự
  const { 
    data: similarProducts, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["/api/products/similar", selectedProduct.id],
    queryFn: async () => {
      return apiRequestTyped<Product[]>(
        `/api/products/${selectedProduct.id}/similar?max=8`
      );
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
  
  // Query để lấy tất cả sản phẩm (cho việc lọc)
  const { 
    data: allProducts 
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
  
  // Lấy danh sách thương hiệu từ sản phẩm
  const getBrands = () => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    
    const brands = new Set<string>();
    allProducts.forEach((p: Product) => {
      const brand = extractBrand(p.name);
      if (brand) brands.add(brand);
    });
    
    return Array.from(brands);
  };
  
  // Lấy danh sách danh mục từ sản phẩm
  const getCategories = () => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    
    const categories = new Set<string>();
    allProducts.forEach((p: Product) => {
      if (p.category) categories.add(p.category);
    });
    
    return Array.from(categories);
  };
  
  // Hàm trích xuất thương hiệu từ tên sản phẩm
  function extractBrand(productName: string): string {
    const commonBrands = [
      "Sony", "Apple", "Samsung", "Bose", "JBL", "Xiaomi", "Huawei", 
      "Dell", "HP", "Lenovo", "Asus", "Acer", "LG", "Nike", "Adidas"
    ];
    
    for (const brand of commonBrands) {
      if (productName.includes(brand)) {
        return brand;
      }
    }
    
    // Lấy từ đầu tiên như thương hiệu nếu không tìm thấy
    return productName.split(" ")[0];
  }
  
  // Lọc sản phẩm dựa trên bộ lọc
  const filteredProducts = () => {
    if (!similarProducts) return [];
    
    return similarProducts.filter(product => {
      // Lọc theo tìm kiếm
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Lọc theo giá
      if (filters.priceRange !== "all") {
        const price = product.price;
        
        if (filters.priceRange === "under2m" && price >= 2000000) return false;
        if (filters.priceRange === "2m-5m" && (price < 2000000 || price > 5000000)) return false;
        if (filters.priceRange === "above5m" && price <= 5000000) return false;
      }
      
      // Lọc theo thương hiệu
      if (filters.brand.length > 0) {
        const brand = extractBrand(product.name);
        if (!filters.brand.includes(brand)) return false;
      }
      
      // Lọc theo đánh giá
      if (filters.rating) {
        if (product.rating < filters.rating) return false;
      }
      
      // Lọc theo danh mục
      if (filters.category.length > 0) {
        if (!filters.category.includes(product.category)) return false;
      }
      
      return true;
    });
  };
  
  // Xử lý khi chọn/hủy chọn sản phẩm để so sánh
  const handleToggleProduct = (productId: number) => {
    setSelectedProductIds(prev => {
      // Không thể hủy chọn sản phẩm gốc
      if (productId === selectedProduct.id) return prev;
      
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // Giới hạn tối đa 4 sản phẩm
        if (prev.length >= 4) {
          toast({
            title: "Tối đa 4 sản phẩm",
            description: "Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc.",
            variant: "destructive"
          });
          return prev;
        }
        return [...prev, productId];
      }
    });
  };
  
  // Xử lý khi nhấn nút "So sánh ngay"
  const handleCompare = () => {
    if (selectedProductIds.length < 2) {
      toast({
        title: "Cần chọn ít nhất 2 sản phẩm",
        description: "Vui lòng chọn thêm ít nhất 1 sản phẩm nữa để so sánh.",
        variant: "destructive"
      });
      return;
    }
    
    setIsComparing(true);
    onCompare(selectedProductIds);
    
    // Đóng modal sau 1 khoảng thời gian ngắn
    setTimeout(() => {
      onOpenChange(false);
    }, 500);
  };
  
  // Render theo loại device (mobile/desktop)
  const renderContent = () => (
    <>
      <div className="flex flex-col md:flex-row gap-4 h-full max-h-[70vh] md:max-h-[80vh]">
        {/* Bộ lọc - bên trái */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="space-y-4">
            {/* Tìm kiếm */}
            <div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Các bộ lọc */}
            <Accordion type="multiple" defaultValue={["price", "brand", "rating"]} className="w-full">
              {/* Lọc giá */}
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium">Khoảng giá</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={filters.priceRange}
                    onValueChange={(val) => setFilters({...filters, priceRange: val})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="price-all" value="all" />
                      <Label htmlFor="price-all">Tất cả mức giá</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="price-under2m" value="under2m" />
                      <Label htmlFor="price-under2m">Dưới 2 triệu</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="price-2m-5m" value="2m-5m" />
                      <Label htmlFor="price-2m-5m">2 - 5 triệu</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="price-above5m" value="above5m" />
                      <Label htmlFor="price-above5m">Trên 5 triệu</Label>
                    </div>
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
              
              {/* Lọc theo thương hiệu */}
              <AccordionItem value="brand">
                <AccordionTrigger className="text-sm font-medium">Thương hiệu</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {getBrands().map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`brand-${brand}`} 
                          checked={filters.brand.includes(brand)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({...filters, brand: [...filters.brand, brand]});
                            } else {
                              setFilters({...filters, brand: filters.brand.filter(b => b !== brand)});
                            }
                          }}
                        />
                        <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Lọc theo đánh giá */}
              <AccordionItem value="rating">
                <AccordionTrigger className="text-sm font-medium">Đánh giá</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={filters.rating?.toString() || ""}
                    onValueChange={(val) => setFilters({...filters, rating: val ? Number(val) : null})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="rating-all" value="" />
                      <Label htmlFor="rating-all">Tất cả đánh giá</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="rating-4" value="4" />
                      <Label htmlFor="rating-4" className="flex items-center">
                        <span>Từ 4</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                        <span>trở lên</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="rating-3" value="3" />
                      <Label htmlFor="rating-3" className="flex items-center">
                        <span>Từ 3</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                        <span>trở lên</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
              
              {/* Lọc theo danh mục */}
              <AccordionItem value="category">
                <AccordionTrigger className="text-sm font-medium">Loại sản phẩm</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {getCategories().map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={filters.category.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({...filters, category: [...filters.category, category]});
                            } else {
                              setFilters({...filters, category: filters.category.filter(c => c !== category)});
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setFilters({
                search: "",
                priceRange: "all",
                brand: [],
                rating: null,
                category: [],
              })}
            >
              <X className="h-4 w-4 mr-2" /> Xóa bộ lọc
            </Button>
          </div>
        </div>
        
        {/* Danh sách sản phẩm - bên phải */}
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col space-y-2">
            {/* Sản phẩm đã chọn */}
            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-md border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-medium text-sm truncate">{selectedProduct.name}</h4>
                  <p className="text-sm text-primary">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
              </div>
              <Badge className="ml-2 bg-primary/10 text-primary border-primary/30">
                Sản phẩm đã chọn
              </Badge>
            </div>
            
            <Separator />
            
            <h4 className="font-medium">Sản phẩm tương tự ({isLoading ? "..." : filteredProducts().length})</h4>
            
            {/* Loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
                    <Skeleton className="w-14 h-14 rounded-md" />
                    <div className="space-y-2 flex-grow">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-sm" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-700">
                Đã xảy ra lỗi khi tải sản phẩm tương tự. Vui lòng thử lại sau.
              </div>
            )}
            
            {/* Empty state */}
            {!isLoading && filteredProducts().length === 0 && (
              <div className="text-center p-8">
                <Filter className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h4 className="font-medium">Không tìm thấy sản phẩm nào</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Hãy thử điều chỉnh bộ lọc của bạn để xem nhiều sản phẩm hơn.
                </p>
              </div>
            )}
            
            {/* Product list */}
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-3`}>
              {!isLoading && filteredProducts().map(product => (
                <div 
                  key={product.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-md transition-all",
                    selectedProductIds.includes(product.id) 
                      ? "border-primary/50 bg-primary/5" 
                      : "hover:border-gray-300"
                  )}
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="overflow-hidden flex-grow">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm font-medium">
                        {formatPrice(product.price)}
                      </p>
                      {product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-xs mt-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 inline-block mr-1" />
                      <span>{product.rating || "N/A"}</span>
                    </div>
                  </div>
                  <Checkbox 
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={() => handleToggleProduct(product.id)}
                    className="ml-auto flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="sticky bottom-0 mt-4 pt-4 border-t bg-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">
              Đã chọn {selectedProductIds.length}/4 sản phẩm
            </span>
          </div>
          <Button
            onClick={handleCompare}
            disabled={selectedProductIds.length < 2 || isComparing}
          >
            {isComparing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang so sánh...
              </>
            ) : (
              <>
                So sánh ngay
                <BarChart className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
  
  // Render dựa trên thiết bị
  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Sản phẩm tương tự</SheetTitle>
          <SheetDescription>
            Chọn tối đa 4 sản phẩm để so sánh chi tiết
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 h-full overflow-y-auto">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Sản phẩm tương tự</DialogTitle>
          <DialogDescription>
            Chọn tối đa 4 sản phẩm để so sánh chi tiết
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}