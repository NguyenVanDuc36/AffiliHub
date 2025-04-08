import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  ArrowRight,
  FileStack
} from "lucide-react";

interface ComparePriceButtonProps {
  productId: number;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ComparePriceButton({
  productId,
  className,
  variant = "default",
  size = "default"
}: ComparePriceButtonProps) {
  const [, setLocation] = useLocation();

  const handleCompareClick = () => {
    setLocation(`/product-comparison?productId=${productId}`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCompareClick}
    >
      <Scale className="mr-2 h-4 w-4" />
      So sánh giá
    </Button>
  );
}

export function CompareWithSimilarButton({
  productId,
  className,
  variant = "default",
  size = "default"
}: ComparePriceButtonProps) {
  const [, setLocation] = useLocation();

  const handleCompareClick = () => {
    setLocation(`/so-sanh-thong-minh?productId=${productId}`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCompareClick}
    >
      <FileStack className="mr-2 h-4 w-4" />
      So sánh sản phẩm tương tự
    </Button>
  );
}