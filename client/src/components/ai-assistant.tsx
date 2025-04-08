import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIAssistant } from "@/context/ai-assistant-context";
import { apiRequestTyped } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

type ContentItem = 
  | { type: "text"; text: string } 
  | { type: "image"; url: string; altText: string };

type Message = {
  type: "user" | "assistant";
  content: ContentItem[];
};

export default function AIAssistant() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: "assistant", 
      content: [{ 
        type: "text", 
        text: "Xin chào! Tôi là trợ lý mua sắm AI của AffiliHub. Tôi có thể giúp gì cho bạn hôm nay?" 
      }]
    },
    { 
      type: "assistant", 
      content: [{ 
        type: "text", 
        text: "Bạn có thể mô tả sản phẩm bạn đang tìm kiếm hoặc chia sẻ nhu cầu của bạn để tôi gợi ý sản phẩm phù hợp nhất." 
      }]
    }
  ]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggleAIAssistant, aiPrompt, setAIPrompt } = useAIAssistant();
  const { toast } = useToast();

  // Create a session ID when component mounts
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle AI prompt from context
  useEffect(() => {
    if (aiPrompt && isOpen) {
      handleSendMessage(aiPrompt);
      setAIPrompt("");
    }
  }, [aiPrompt, isOpen]);

  // Hàm để phát hiện và trích xuất link ảnh trong văn bản
  const extractImages = (responseText: string): {text: string, images: {url: string, altText: string}[]} => {
    // Regex để tìm hình ảnh trong markdown ![alt](url) hoặc <img src="url" alt="alt">
    const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
    const htmlImageRegex = /<img.*?src=["'](.*?)["'].*?alt=["'](.*?)["'].*?>/g;
    const simpleImgHTMLRegex = /<img.*?src=["'](.*?)["'].*?>/g;
    
    const images: {url: string, altText: string}[] = [];
    let text = responseText;
    
    // Tìm và xử lý ảnh định dạng markdown
    let match;
    while ((match = markdownImageRegex.exec(responseText)) !== null) {
      const [fullMatch, altText, url] = match;
      // Chỉ nhận các URL hợp lệ
      if (url && url.startsWith('http')) {
        images.push({url, altText: altText || 'Hình ảnh sản phẩm'});
        text = text.replace(fullMatch, ''); // Xóa ảnh khỏi văn bản
      }
    }
    
    // Tìm và xử lý ảnh định dạng HTML với alt text
    while ((match = htmlImageRegex.exec(responseText)) !== null) {
      const [fullMatch, url, altText] = match;
      if (url && url.startsWith('http')) {
        images.push({url, altText: altText || 'Hình ảnh sản phẩm'});
        text = text.replace(fullMatch, ''); // Xóa ảnh khỏi văn bản
      }
    }
    
    // Tìm và xử lý ảnh định dạng HTML đơn giản không có alt text
    while ((match = simpleImgHTMLRegex.exec(responseText)) !== null) {
      const [fullMatch, url] = match;
      if (url && url.startsWith('http') && !images.some(img => img.url === url)) {
        images.push({url, altText: 'Hình ảnh sản phẩm'});
        text = text.replace(fullMatch, ''); // Xóa ảnh khỏi văn bản
      }
    }
    
    return {text: text.trim(), images};
  };

  // Hàm để chuyển đổi response từ API thành ContentItem[]
  const parseResponse = (responseText: string): ContentItem[] => {
    const {text, images} = extractImages(responseText);
    
    const contentItems: ContentItem[] = [];
    
    // Thêm phần văn bản (nếu có)
    if (text) {
      contentItems.push({
        type: "text",
        text
      });
    }
    
    // Thêm các hình ảnh (nếu có)
    images.forEach(img => {
      contentItems.push({
        type: "image",
        url: img.url,
        altText: img.altText
      });
    });
    
    // Nếu không có nội dung nào thì trả về text gốc
    if (contentItems.length === 0) {
      contentItems.push({
        type: "text",
        text: responseText
      });
    }
    
    return contentItems;
  };

  const handleSendMessage = async (content: string = inputMessage) => {
    if (!content.trim() || isLoading) return;

    try {
      // Add user message to UI immediately
      setMessages(prev => [...prev, { 
        type: "user", 
        content: [{ type: "text", text: content }] 
      }]);
      setInputMessage("");
      setIsLoading(true);

      // Add pending message to show loading state
      setMessages(prev => [...prev, { 
        type: "assistant", 
        content: [{ type: "text", text: "Đang xử lý câu hỏi của bạn..." }]
      }]);

      // Send request to the AI chat endpoint
      const response = await apiRequestTyped<{ message: string }>('/api/ai/chat', {
        method: 'POST',
        body: {
          sessionId,
          message: content
        }
      });

      // Remove the pending message
      setMessages(prev => prev.slice(0, -1));

      // Parse response to extract images
      const contentItems = parseResponse(response.message);

      // Add the actual AI response
      setMessages(prev => [...prev, { 
        type: "assistant", 
        content: contentItems
      }]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      
      // Remove the pending message
      setMessages(prev => prev.slice(0, -1));
      
      // Add error message
      setMessages(prev => [...prev, { 
        type: "assistant", 
        content: [{ 
          type: "text", 
          text: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau." 
        }]
      }]);
      
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến trợ lý AI. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleAIAssistant}
        className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-lg transition-all hover:-translate-y-1"
      >
        <Bot className="h-8 w-8" />
      </Button>
      
      <div 
        className={cn(
          "absolute bottom-20 right-0 w-80 md:w-96 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Trợ lý mua sắm AI</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAIAssistant} className="text-white hover:text-white/80 h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="h-96 p-4 overflow-y-auto bg-white/90">
          {messages.map((message, index) => (
            <div key={index} className={cn(
              "flex items-start mb-4",
              message.type === "user" && "justify-end"
            )}>
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-2">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={cn(
                "rounded-lg p-3 max-w-[80%]",
                message.type === "assistant" ? "bg-primary/10" : "bg-primary text-white"
              )}>
                {message.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="mb-2 last:mb-0">
                    {item.type === "text" ? (
                      <p className="text-sm whitespace-pre-line">{item.text}</p>
                    ) : item.type === "image" ? (
                      <div className="my-2">
                        <img 
                          src={item.url} 
                          alt={item.altText}
                          className="rounded-md max-w-full h-auto"
                          loading="lazy"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{item.altText}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex">
            <Input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-grow rounded-l-full py-2 px-4 border focus-visible:ring-1 focus-visible:ring-primary"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-r-full px-4">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex flex-wrap justify-center mt-2 gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs py-1 px-2 h-auto"
              onClick={() => handleQuickPrompt("Tai nghe dưới 1 triệu")}
            >
              Tai nghe dưới 1 triệu
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs py-1 px-2 h-auto"
              onClick={() => handleQuickPrompt("Laptop cho sinh viên")}
            >
              Laptop cho sinh viên
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs py-1 px-2 h-auto"
              onClick={() => handleQuickPrompt("Cho tôi xem hình ảnh tai nghe")}
            >
              Xem hình ảnh sản phẩm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
