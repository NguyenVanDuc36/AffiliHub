import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Search, Menu, X, Bot } from "lucide-react";
import { useAIAssistant } from "@/context/ai-assistant-context";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { toggleAIAssistant } = useAIAssistant();

  // Track scroll position to add effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Search for:", searchQuery);
  };

  const isActive = (path: string) => location === path;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-100/10 transition-all duration-200",
        isScrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block w-1/3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm hoặc nhu cầu..."
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={cn("font-medium text-gray-900 hover:text-primary transition-colors", isActive("/") && "text-primary")}>
              Trang chủ
            </Link>
            <Link href="/categories" className={cn("font-medium text-gray-900 hover:text-primary transition-colors", isActive("/categories") && "text-primary")}>
              Danh mục
            </Link>
            <Link href="/blog" className={cn("font-medium text-gray-900 hover:text-primary transition-colors", isActive("/blog") && "text-primary")}>
              Blog
            </Link>
            <button 
              className={cn(
                "flex items-center font-medium text-primary hover:text-pink-500 transition-colors",
                isActive("/ai-assistant") && "text-pink-500"
              )}
              onClick={() => toggleAIAssistant()}
            >
              <Bot className="mr-1 h-4 w-4" /> Trợ lý AI
            </button>
            <Link href="/ai-recommendations" className={cn("font-medium text-gray-900 hover:text-primary transition-colors", isActive("/ai-recommendations") && "text-primary")}>
              Gợi ý AI
            </Link>
            <Link href="/product-comparison" className={cn("font-medium text-gray-900 hover:text-primary transition-colors", isActive("/product-comparison") && "text-primary")}>
              So sánh sản phẩm
            </Link>
            <Link href="/so-sanh-thong-minh" className={cn("font-medium text-gray-900 hover:text-primary transition-colors", isActive("/so-sanh-thong-minh") && "text-primary")}>
              So sánh thông minh
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <Logo />
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    <Link href="/" className={cn("font-medium text-lg px-2 py-2 rounded-md", isActive("/") && "bg-primary/10 text-primary")}>
                      Trang chủ
                    </Link>
                    <Link href="/categories" className={cn("font-medium text-lg px-2 py-2 rounded-md", isActive("/categories") && "bg-primary/10 text-primary")}>
                      Danh mục
                    </Link>
                    <Link href="/blog" className={cn("font-medium text-lg px-2 py-2 rounded-md", isActive("/blog") && "bg-primary/10 text-primary")}>
                      Blog
                    </Link>
                    <button 
                      onClick={() => toggleAIAssistant()}
                      className="flex items-center font-medium text-lg px-2 py-2 rounded-md text-primary text-left"
                    >
                      <Bot className="mr-2 h-5 w-5" /> Trợ lý AI
                    </button>
                    <Link href="/ai-recommendations" className={cn("font-medium text-lg px-2 py-2 rounded-md", isActive("/ai-recommendations") && "bg-primary/10 text-primary")}>
                      Gợi ý AI
                    </Link>
                    <Link href="/product-comparison" className={cn("font-medium text-lg px-2 py-2 rounded-md", isActive("/product-comparison") && "bg-primary/10 text-primary")}>
                      So sánh sản phẩm
                    </Link>
                    <Link href="/so-sanh-thong-minh" className={cn("font-medium text-lg px-2 py-2 rounded-md", isActive("/so-sanh-thong-minh") && "bg-primary/10 text-primary")}>
                      So sánh thông minh
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search (Shows only on mobile) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm hoặc nhu cầu..."
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
    </header>
  );
}
