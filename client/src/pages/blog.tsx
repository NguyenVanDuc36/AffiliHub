import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import BlogCard from "@/components/blog-card";
import { type BlogPost, type Category } from "@shared/schema";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Search for:", searchQuery);
  };

  const filteredPosts = blogPosts?.filter(post => {
    // Filter by search query
    if (
      searchQuery && 
      !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by category
    if (activeCategory !== "all" && post.category !== activeCategory) {
      return false;
    }
    
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Blog - AffiliHub</title>
        <meta name="description" content="Khám phá các bài viết mới nhất về sản phẩm, công nghệ, sức khỏe, làm đẹp và nhiều chủ đề khác tại AffiliHub." />
      </Helmet>

      <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-6">
            Blog
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
            Khám phá các bài viết mới nhất về sản phẩm, công nghệ, sức khỏe, làm đẹp và nhiều chủ đề khác
          </p>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <Search className="h-4 w-4 text-gray-500" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveCategory("all")}
          >
            Tất cả
          </Button>
          {categories?.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.slug ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-2xl overflow-hidden">
                <div className="bg-gray-200 h-52 w-full"></div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts?.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-xl p-8 text-center shadow-sm max-w-md mx-auto">
            <h3 className="font-medium text-lg mb-2">Không tìm thấy bài viết nào</h3>
            <p className="text-gray-600 mb-4">Vui lòng thử lại với từ khóa khác hoặc chọn danh mục khác</p>
            <Button variant="outline" onClick={() => {setSearchQuery(""); setActiveCategory("all");}}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts?.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
        
        {filteredPosts && filteredPosts.length > 0 && (
          <div className="flex justify-center mt-10">
            <Button variant="outline" className="rounded-full px-6">
              Xem thêm bài viết
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
