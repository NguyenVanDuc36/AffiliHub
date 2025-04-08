import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FullscreenLoadingProps {
  show: boolean;
  message?: string;
  loadingText?: string[];
  withSparkles?: boolean;
}

export function FullscreenLoading({
  show,
  message = 'Đang tải...',
  loadingText = [
    'Đang chuẩn bị dữ liệu...',
    'Đang phân tích thông tin sản phẩm...',
    'Đang tìm kiếm giá tốt nhất...',
    'Sắp hoàn tất...',
  ],
  withSparkles = false,
}: FullscreenLoadingProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    if (!show) return;
    
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingText.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [show, loadingText.length]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center text-center max-w-md px-6">
            <div className="relative mb-6">
              <div className="animate-spin">
                <Loader2 className="h-12 w-12 text-primary" />
              </div>
              
              {withSparkles && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: 'reverse', 
                      duration: 2,
                      delay: 0.5 
                    }}
                    className="absolute -top-3 -right-3"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: 'reverse', 
                      duration: 2.5,
                      delay: 0.2
                    }}
                    className="absolute -bottom-2 -left-3"
                  >
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </motion.div>
                </>
              )}
            </div>
            
            <h3 className="text-xl font-medium mb-3">{message}</h3>
            
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTextIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  {loadingText[currentTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            
            <div className="w-48 h-1.5 bg-muted rounded-full mt-5 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ 
                  width: '100%', 
                  transition: { duration: 3, repeat: Infinity }
                }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Chức năng để thêm hiệu ứng tiến trình vào DOM
export function injectProgressAnimation() {
  const progressBar = document.createElement('div');
  progressBar.classList.add('fixed', 'top-0', 'left-0', 'h-1', 'bg-primary', 'z-50', 'animate-progress');
  document.body.appendChild(progressBar);
  
  return () => {
    if (document.body.contains(progressBar)) {
      document.body.removeChild(progressBar);
    }
  };
}