import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Category } from "@shared/schema";

export default function Categories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-semibold text-2xl md:text-3xl mb-8 text-center">
          Khám phá theo danh mục
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-2xl overflow-hidden">
                <div className="bg-gray-200 h-40 w-full"></div>
              </div>
            ))
          ) : (
            categories?.map((category) => (
              <Link key={category.id} href={`/categories?category=${category.slug}`}>
                <a className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
                  <div className="relative">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="font-poppins font-medium text-xl">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.productCount}+ sản phẩm</p>
                    </div>
                  </div>
                </a>
              </Link>
            ))
          )}
        </div>
        
        <div className="text-center">
          <Link href="/categories">
            <Button variant="outline" className="px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full font-medium transition-colors duration-300">
              Xem tất cả danh mục
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
