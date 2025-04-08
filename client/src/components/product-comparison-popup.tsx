import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, X, Check, Star, ChevronDown, ChevronUp, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Product } from "@shared/schema";

interface ProductComparisonPopupProps {
  initialProductId?: number;
  isOpen: boolean;
  onClose: () => void;
  onCompare: (productIds: number[]) => void;
}

export default function ProductComparisonPopup({
  initialProductId,
  isOpen,
  onClose,
  onCompare,
}: ProductComparisonPopupProps) {
  const { toast } = useToast();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filters, setFilters] = useState({
    search: "",
    priceRange: "all",
    rating: null as number | null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set initial product if provided
  useEffect(() => {
    if (initialProductId && products && Array.isArray(products)) {
      const initialProduct = products.find((p) => p.id === initialProductId);
      if (initialProduct) {
        setSelectedProductIds([initialProductId]);
        setSelectedCategory(initialProduct.category);
      }
    }
  }, [initialProductId, products]);

  const filteredProducts = () => {
    if (!products || !Array.isArray(products)) return [];
    
    return products.filter((product: Product) => {
      // Filter by selected category if one exists
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }
      
      // Filter by search
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      
      // Filter by price
      if (filters.priceRange !== "all") {
        const price = product.price;
        if (filters.priceRange === "under2m" && price >= 2000000) return false;
        if (filters.priceRange === "2m-5m" && (price < 2000000 || price > 5000000)) return false;
        if (filters.priceRange === "above5m" && price <= 5000000) return false;
      }
      
      // Filter by rating
      if (filters.rating !== null && product.rating < filters.rating) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get all unique categories
  const categories = products && Array.isArray(products)
    ? Array.from(new Set(products.map((p: Product) => p.category)))
    : [];

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      // If removing the last or only selected product, also clear the category filter
      if (selectedProductIds.length === 1) {
        setSelectedCategory("");
      }
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      // If this is the first selection, set the category filter to this product's category
      if (selectedProductIds.length === 0 && products && Array.isArray(products)) {
        const product = products.find((p: Product) => p.id === productId);
        if (product) {
          setSelectedCategory(product.category);
        }
      }
      
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
  
  // Get selected products details
  const selectedProducts = products && Array.isArray(products)
    ? products.filter((p: Product) => selectedProductIds.includes(p.id))
    : [];

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      priceRange: "all",
      rating: null,
    });
  };

  // Handle comparison
  const handleCompare = () => {
    if (selectedProductIds.length < 2) {
      toast({
        title: "Cần chọn ít nhất 2 sản phẩm",
        description: "Vui lòng chọn ít nhất 2 sản phẩm để so sánh.",
        variant: "destructive",
      });
      return;
    }
    
    onCompare(selectedProductIds);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glassmorphism-modal z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">So sánh sản phẩm</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Selected products */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Sản phẩm đã chọn {selectedProductIds.length > 0 && `(${selectedProductIds.length}/3)`}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {selectedProducts.map((product) => (
              <div key={`selected-${product.id}`} className="glassmorphism-card relative p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/70 hover:bg-white/90"
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                
                <div className="aspect-square overflow-hidden rounded-md mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
                  />
                </div>
                
                <p className="font-medium line-clamp-2 mb-1">{product.name}</p>
                <div className="flex items-center text-amber-500 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "fill-amber-500" : "fill-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm ml-1 text-gray-600">{product.rating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <Badge variant="destructive">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% giảm
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {selectedProductIds.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-auto aspect-square p-4 text-gray-500">
                <p className="text-center">Chọn sản phẩm từ danh sách bên dưới</p>
                <p className="text-sm text-center mt-2">Tối đa 3 sản phẩm</p>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Filters section */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Sản phẩm có sẵn</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <span>Bộ lọc</span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glassmorphism-card p-4 mt-2 mb-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Danh mục</label>
                  <select
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Khoảng giá</label>
                  <select
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  >
                    <option value="all">Tất cả mức giá</option>
                    <option value="under2m">Dưới 2 triệu</option>
                    <option value="2m-5m">2 - 5 triệu</option>
                    <option value="above5m">Trên 5 triệu</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Đánh giá</label>
                  <select
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    value={filters.rating === null ? "" : filters.rating.toString()}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">Tất cả đánh giá</option>
                    <option value="4">Từ 4 sao trở lên</option>
                    <option value="3">Từ 3 sao trở lên</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto p-1">
          {isLoadingProducts ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredProducts().length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Không tìm thấy sản phẩm phù hợp với bộ lọc
            </div>
          ) : (
            filteredProducts().map((product: Product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl p-3 flex items-center cursor-pointer hover:bg-gray-50 border transition-all duration-200 ${
                  selectedProductIds.includes(product.id)
                    ? "bg-primary/5 border-primary/30"
                    : "border-gray-200"
                }`}
                onClick={() => toggleProductSelection(product.id)}
              >
                <div className="w-20 h-20 rounded-md overflow-hidden mr-3 flex-shrink-0 border">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                  />
                </div>
                
                <div className="flex-grow overflow-hidden">
                  <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                  <div className="flex items-center text-amber-500 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating) ? "fill-amber-500" : "fill-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs ml-1 text-gray-600">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </p>
                    <Checkbox 
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Comparison button - fixed at the bottom */}
        <div className="mt-6 flex justify-center">
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ 
              boxShadow: "0 10px 15px -3px rgba(var(--primary), 0.2), 0 4px 6px -4px rgba(var(--primary), 0.2)" 
            }}
            className={`button-compare ${selectedProductIds.length >= 2 ? "animate-gentle-pulse" : ""}`}
            onClick={handleCompare}
            disabled={selectedProductIds.length < 2}
          >
            So sánh ngay
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}