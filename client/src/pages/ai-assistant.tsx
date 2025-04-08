import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, ArrowRight, Wand2 } from "lucide-react";
import { useAIAssistant } from "@/context/ai-assistant-context";

export default function AIAssistantPage() {
  const { setAIPrompt, toggleAIAssistant } = useAIAssistant();
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Automatically open the AI assistant when this page is visited
    toggleAIAssistant();

    return () => {
      // Ensure it's closed when leaving the page
      // Note: only if we want to auto-close, which may not be desired
      // toggleAIAssistant();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      setAIPrompt(query);
      setQuery("");
    }
  };

  const handleFeatureClick = (prompt: string) => {
    setAIPrompt(prompt);
  };

  return (
    <>
      <Helmet>
        <title>Trợ lý AI - AffiliHub</title>
        <meta name="description" content="Sử dụng trợ lý AI thông minh của AffiliHub để tìm kiếm sản phẩm phù hợp nhất với nhu cầu của bạn." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
              Trợ lý <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">AI</span> thông minh
            </h1>
            <p className="text-gray-600 mb-6">
              Hỏi bất cứ điều gì về sản phẩm, tính năng, hoặc nhận gợi ý phù hợp với nhu cầu cá nhân của bạn
            </p>
            
            <form onSubmit={handleSubmit} className="flex max-w-xl mx-auto mb-8">
              <Input
                type="text"
                placeholder="Ví dụ: Gợi ý tai nghe chống ồn tốt nhất dưới 2 triệu..."
                className="flex-grow py-3 px-4 rounded-l-full border focus-visible:ring-2 focus-visible:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-r-full transition-all hover:-translate-y-1 hover:shadow-lg flex items-center"
              >
                <Send className="mr-2 h-4 w-4" /> Gửi
              </Button>
            </form>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                  <Wand2 className="h-5 w-5" />
                </div>
                <h2 className="font-poppins font-semibold text-xl">Gợi ý sản phẩm</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Mô tả nhu cầu của bạn và để AI gợi ý những sản phẩm phù hợp nhất.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("Gợi ý tai nghe chống ồn tốt nhất dưới 2 triệu đồng")}
                >
                  Tai nghe chống ồn dưới 2 triệu
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("Máy lọc không khí nào tốt cho người bị dị ứng?")}
                >
                  Máy lọc không khí cho người dị ứng
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 mr-3">
                  <Bot className="h-5 w-5" />
                </div>
                <h2 className="font-poppins font-semibold text-xl">So sánh sản phẩm</h2>
              </div>
              <p className="text-gray-600 mb-4">
                So sánh chi tiết giữa các sản phẩm để đưa ra quyết định sáng suốt.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("So sánh Samsung Galaxy S23 Ultra và iPhone 14 Pro Max")}
                >
                  Samsung S23 Ultra vs iPhone 14 Pro Max
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("So sánh laptop Dell XPS 13 và MacBook Air M2")}
                >
                  Dell XPS 13 vs MacBook Air M2
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mr-3">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v14" />
                  </svg>
                </div>
                <h2 className="font-poppins font-semibold text-xl">Tìm theo nhu cầu</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Mô tả mục đích sử dụng và để AI tìm sản phẩm phù hợp nhất.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("Tôi cần laptop cho công việc thiết kế đồ họa")}
                >
                  Laptop cho thiết kế đồ họa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("Tôi cần sản phẩm chăm sóc da cho da dầu mụn")}
                >
                  Sản phẩm cho da dầu mụn
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mr-3">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h2 className="font-poppins font-semibold text-xl">Tư vấn mua sắm</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Nhận tư vấn chi tiết để đưa ra quyết định mua sắm tốt nhất.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("Tôi có ngân sách 10 triệu, nên mua điện thoại nào?")}
                >
                  Điện thoại tốt nhất 10 triệu
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleFeatureClick("Tôi nên mua máy ảnh mirrorless nào để bắt đầu học chụp ảnh?")}
                >
                  Máy ảnh mirrorless cho người mới
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
