import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Shirt, Contrast } from "lucide-react";
import { useAIAssistant } from "@/context/ai-assistant-context";

export default function AIFeatures() {
  const { toggleAIAssistant, setAIPrompt } = useAIAssistant();

  const handleAIFeature = (prompt: string) => {
    setAIPrompt(prompt);
    toggleAIAssistant();
  };

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 to-cyan-500/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Trải nghiệm sức mạnh <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">AI</span> của chúng tôi
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Công nghệ trí tuệ nhân tạo tiên tiến giúp bạn tìm kiếm và trải nghiệm sản phẩm theo cách hoàn toàn mới
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* AI Feature 1 */}
          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl mb-4">
              <Bot size={24} />
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-3">Trợ lý AI thông minh</h3>
            <p className="text-gray-600 mb-4">
              Nhập mục đích của bạn và để trợ lý AI thông minh gợi ý sản phẩm phù hợp nhất dựa trên nhu cầu thực tế.
            </p>
            <Button 
              variant="link" 
              className="text-primary hover:text-pink-500 font-medium p-0 h-auto"
              onClick={() => handleAIFeature("Gợi ý một số sản phẩm phù hợp với nhu cầu của tôi")}
            >
              Trải nghiệm ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* AI Feature 2 */}
          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 text-2xl mb-4">
              <Shirt size={24} />
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-3">Thử đồ ảo thông minh</h3>
            <p className="text-gray-600 mb-4">
              Tải ảnh của bạn lên và xem sản phẩm sẽ trông như thế nào trên bạn trước khi quyết định mua hàng.
            </p>
            <Button 
              variant="link" 
              className="text-primary hover:text-pink-500 font-medium p-0 h-auto"
              onClick={() => handleAIFeature("Tôi muốn thử đồ ảo với sản phẩm thời trang")}
            >
              Thử ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* AI Feature 3 */}
          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-2xl mb-4">
              <Contrast size={24} />
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-3">So sánh sản phẩm thông minh</h3>
            <p className="text-gray-600 mb-4">
              Chọn 2-3 sản phẩm và để AI tạo bảng so sánh chi tiết giúp bạn đưa ra quyết định sáng suốt.
            </p>
            <Button 
              variant="link" 
              className="text-primary hover:text-pink-500 font-medium p-0 h-auto"
              onClick={() => handleAIFeature("So sánh giúp tôi 3 sản phẩm tai nghe chống ồn tốt nhất")}
            >
              So sánh ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
