import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { formatPrice } from "@/lib/utils";
import { type Product, type Category } from "@shared/schema";

export default function Categories() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const categoryParam = params.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortOption, setSortOption] = useState<string>("popularity");
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch products with filters
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory, priceRange, sortOption],
  });

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredProducts = products?.filter(product => {
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const categoryName = categories?.find(c => c.slug === selectedCategory)?.name || "Tất cả sản phẩm";

  return (
    <>
      <Helmet>
        <title>{categoryName} - AffiliHub</title>
        <meta name="description" content={`Khám phá các sản phẩm ${categoryName.toLowerCase()} tốt nhất tại AffiliHub với giá ưu đãi và đánh giá từ người dùng thực.`} />
      </Helmet>

      <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-6">
            {categoryName}
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
            Khám phá các sản phẩm chất lượng cao với đánh giá chân thực từ người dùng
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-sm sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Bộ lọc</h2>
              
              <div className="mb-6">
                <Label htmlFor="search" className="mb-2 block">Tìm kiếm</Label>
                <Input 
                  id="search"
                  type="text" 
                  placeholder="Tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Accordion type="single" collapsible defaultValue="category" className="mb-4">
                <AccordionItem value="category">
                  <AccordionTrigger className="text-base font-medium">Danh mục</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="all" 
                          checked={selectedCategory === "all"} 
                          onCheckedChange={() => setSelectedCategory("all")} 
                        />
                        <Label htmlFor="all" className="cursor-pointer">Tất cả</Label>
                      </div>
                      
                      {categories?.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={category.slug} 
                            checked={selectedCategory === category.slug} 
                            onCheckedChange={() => setSelectedCategory(category.slug)} 
                          />
                          <Label htmlFor={category.slug} className="cursor-pointer">{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                  <AccordionTrigger className="text-base font-medium">Giá</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[0, 50000000]}
                        max={50000000}
                        step={1000000}
                        value={[priceRange[0], priceRange[1]]}
                        onValueChange={handlePriceRangeChange}
                        className="mt-6"
                      />
                      <div className="flex justify-between">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="rating">
                  <AccordionTrigger className="text-base font-medium">Đánh giá</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox id={`rating-${rating}`} />
                          <Label htmlFor={`rating-${rating}`} className="cursor-pointer flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <svg 
                                key={i} 
                                className={`h-4 w-4 ${i < rating ? "text-amber-500 fill-current" : "text-gray-300"}`}
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                            <span className="ml-1">& up</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button className="w-full" variant="outline">
                Xóa bộ lọc
              </Button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-gray-600">Hiển thị {filteredProducts?.length || 0} sản phẩm</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Sắp xếp theo:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Phổ biến" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Phổ biến</SelectItem>
                    <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                    <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(9).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse bg-white rounded-2xl h-[400px] w-full overflow-hidden">
                    <div className="bg-gray-200 h-56 w-full"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3 w-32"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md rounded-xl p-8 text-center shadow-sm">
                <h3 className="font-medium text-lg mb-2">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-600">Vui lòng thử lại với các bộ lọc khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts?.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
