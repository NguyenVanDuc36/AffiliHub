import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Send, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Logo className="mb-6" textClassName="text-white" />
            <p className="text-gray-400 mb-6">
              Nền tảng affiliate thông minh ứng dụng AI, giúp bạn tìm kiếm sản phẩm phù hợp nhất với nhu cầu cá nhân.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-6">Danh mục</h3>
            <ul className="space-y-3">
              <li><Link href="/categories?category=fashion" className="text-gray-400 hover:text-white transition-colors">Thời trang</Link></li>
              <li><Link href="/categories?category=tech" className="text-gray-400 hover:text-white transition-colors">Công nghệ</Link></li>
              <li><Link href="/categories?category=health" className="text-gray-400 hover:text-white transition-colors">Sức khỏe</Link></li>
              <li><Link href="/categories?category=beauty" className="text-gray-400 hover:text-white transition-colors">Làm đẹp</Link></li>
              <li><Link href="/categories?category=home" className="text-gray-400 hover:text-white transition-colors">Nhà cửa</Link></li>
              <li><Link href="/categories?category=travel" className="text-gray-400 hover:text-white transition-colors">Du lịch</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-6">Thông tin</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hợp tác cùng chúng tôi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách Affiliate</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-6">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3 text-primary" />
                <span className="text-gray-400">123 Đường Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <span className="text-gray-400">+84 28 3123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <span className="text-gray-400">info@affilihub.vn</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Đăng ký nhận tin</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-grow rounded-l-full py-2 px-4 bg-white/10 border-0 text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Button className="bg-primary hover:bg-primary/90 rounded-r-full px-4">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2023 AffiliHub. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex space-x-4">
            <svg className="h-6 w-10 text-gray-400" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.2"/>
              <path d="M10 16H16L18 10H12L10 16Z" fill="white"/>
              <path d="M13 7L11 13H17L19 7H13Z" fill="white"/>
              <path d="M28 7H22C21.4477 7 21 7.44772 21 8V15C21 15.5523 21.4477 16 22 16H28C28.5523 16 29 15.5523 29 15V8C29 7.44772 28.5523 7 28 7Z" fill="white"/>
            </svg>
            <svg className="h-6 w-10 text-gray-400" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.2"/>
              <path d="M12 9H18C18.5523 9 19 9.44772 19 10V15C19 15.5523 18.5523 16 18 16H12C11.4477 16 11 15.5523 11 15V10C11 9.44772 11.4477 9 12 9Z" fill="#F34E4E"/>
              <path d="M22 9H28C28.5523 9 29 9.44772 29 10V15C29 15.5523 28.5523 16 28 16H22C21.4477 16 21 15.5523 21 15V10C21 9.44772 21.4477 9 22 9Z" fill="#FFAC33"/>
            </svg>
            <svg className="h-6 w-10 text-gray-400" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.2"/>
              <path d="M22.0504 16H28.0504C28.6027 16 29.0504 15.5523 29.0504 15V10C29.0504 9.44772 28.6027 9 28.0504 9H22.0504C21.4981 9 21.0504 9.44772 21.0504 10V15C21.0504 15.5523 21.4981 16 22.0504 16Z" fill="#0070BA"/>
              <path d="M15 12.5C15 11.1193 16.1193 10 17.5 10H18.5C19.8807 10 21 11.1193 21 12.5C21 13.8807 19.8807 15 18.5 15H17.5C16.1193 15 15 13.8807 15 12.5Z" fill="#003087"/>
              <path d="M11 12.5C11 11.1193 12.1193 10 13.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H13.5C12.1193 15 11 13.8807 11 12.5Z" fill="#001C64"/>
            </svg>
            <svg className="h-6 w-10 text-gray-400" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.2"/>
              <path d="M20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8Z" fill="#AF1A89"/>
              <path d="M20 9C17.2386 9 15 11.2386 15 14C15 16.7614 17.2386 19 20 19C22.7614 19 25 16.7614 25 14C25 11.2386 22.7614 9 20 9Z" fill="#E01E5A"/>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
