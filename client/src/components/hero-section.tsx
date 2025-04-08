import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useAIAssistant } from "@/context/ai-assistant-context";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const { setAIPrompt, toggleAIAssistant } = useAIAssistant();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setAIPrompt(searchQuery);
      toggleAIAssistant();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setAIPrompt(prompt);
    toggleAIAssistant();
  };

  return (
    <section className="relative py-8 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 opacity-30"></div>
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Tìm sản phẩm hoàn hảo với <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Trợ lý AI</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Để AI thông minh giúp bạn khám phá và lựa chọn những sản phẩm tốt nhất phù hợp với nhu cầu cá nhân
          </p>
          
          {/* AI Assistant Quick Access */}
          <div className="max-w-xl mx-auto bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="font-medium text-lg mb-3">Bạn đang tìm sản phẩm gì?</h3>
            <form onSubmit={handleSearch} className="flex w-full mb-4">
              <Input
                type="text"
                placeholder="VD: Tai nghe chống ồn dưới 2 triệu..."
                className="flex-grow py-3 px-4 rounded-l-full border-0 focus-visible:ring-2 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-r-full transition-all hover:-translate-y-1 hover:shadow-lg flex items-center">
                <Wand2 className="mr-2 h-5 w-5" /> Gợi ý
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/60 hover:bg-white py-1 px-4 rounded-full text-sm border border-gray-200"
                onClick={() => handleQuickPrompt("Giày chạy bộ tốt nhất cho người mới bắt đầu")}
              >
                🏃‍♂️ Giày chạy bộ
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/60 hover:bg-white py-1 px-4 rounded-full text-sm border border-gray-200"
                onClick={() => handleQuickPrompt("Laptop tốt nhất cho sinh viên ngân sách 15 triệu")}
              >
                💻 Laptop sinh viên
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/60 hover:bg-white py-1 px-4 rounded-full text-sm border border-gray-200"
                onClick={() => handleQuickPrompt("Tai nghe chống ồn tốt nhất dưới 2 triệu")}
              >
                🎧 Tai nghe chống ồn
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/60 hover:bg-white py-1 px-4 rounded-full text-sm border border-gray-200"
                onClick={() => handleQuickPrompt("Kem chống nắng tốt nhất cho da dầu mụn")}
              >
                🧴 Kem chống nắng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
