import { Link } from "wouter";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import { type BlogPost } from "@shared/schema";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      <Link href={`/blog/${post.slug}`}>
        <a className="block">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-52 object-cover"
            loading="lazy"
          />
        </a>
      </Link>
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="inline-flex items-center">
            <Calendar className="mr-1 h-4 w-4" /> {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="inline-flex items-center ml-4">
            <Eye className="mr-1 h-4 w-4" /> {post.views.toLocaleString()} lượt xem
          </span>
        </div>
        <h3 className="font-poppins font-semibold text-xl mb-3">
          <Link href={`/blog/${post.slug}`}>
            <a className="hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </a>
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <Link href={`/blog/${post.slug}`}>
            <a className="text-primary hover:text-pink-500 font-medium inline-flex items-center">
              Đọc tiếp <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
          <div className="flex space-x-1">
            {post.category === "fashion" && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">Thời trang</span>
            )}
            {post.category === "tech" && (
              <span className="bg-cyan-500/10 text-cyan-500 text-xs px-2 py-1 rounded">Công nghệ</span>
            )}
            {post.category === "health" && (
              <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">Sức khỏe</span>
            )}
            {post.category === "beauty" && (
              <span className="bg-pink-500/10 text-pink-500 text-xs px-2 py-1 rounded">Làm đẹp</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
