import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email hợp lệ",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Đăng ký thành công!",
        description: "Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Đã xảy ra lỗi",
        description: "Vui lòng thử lại sau",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-pink-500">
      <div className="container mx-auto px-4">
        <div className="bg-gray-900/70 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Đăng ký nhận khuyến mãi độc quyền
          </h2>
          <p className="mb-8 text-white/80 max-w-2xl mx-auto">
            Nhận ngay ưu đãi 10% cho lần mua hàng đầu tiên và cập nhật những sản phẩm mới nhất, khuyến mãi hấp dẫn
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-grow rounded-full px-6 py-3 text-gray-900 focus-visible:ring-2 focus-visible:ring-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 bg-white text-primary hover:bg-white/90 rounded-full font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng ký ngay"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-sm text-white/70">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Xem chính sách bảo mật của chúng tôi <a href="#" className="underline hover:text-white">tại đây</a>.
          </div>
        </div>
      </div>
    </section>
  );
}
