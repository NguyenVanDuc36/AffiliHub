import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import BlogCard from "@/components/blog-card";
import { type BlogPost } from "@shared/schema";

export default function RecentBlogs() {
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/recent'],
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl">
            Bài viết mới nhất
          </h2>
          <Link href="/blog">
            <Button variant="link" className="text-primary hover:text-pink-500 font-medium">
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, index) => (
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
            ))
          ) : (
            blogPosts?.slice(0, 3).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
