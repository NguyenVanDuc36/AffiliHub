import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Check, X, Sparkles, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu cho bảng so sánh
type ProductComparisonDetail = {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  brand: string;
  rating: number;
  keyFeatures: string[];
  specs: {
    weight?: string;
    dimensions?: string;
    batteryLife?: string;
    connectivity?: string;
    [key: string]: string | undefined;
  };
  image: string;
  category: string;
  warranty: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  buyUrl: string;
  score?: number;
};

interface EnhancedComparisonTableProps {
  products: ProductComparisonDetail[];
  summary: string;
  recommendation: string;
}

export default function EnhancedComparisonTable({
  products,
  summary,
  recommendation,
}: EnhancedComparisonTableProps) {
  const [activeSection, setActiveSection] = useState<string>("summary");
  
  // Define all comparison criteria
  const comparisonCriteria = [
    { key: "summary", label: "Tổng quan" },
    { key: "basic", label: "Thông tin cơ bản" },
    { key: "specs", label: "Thông số kỹ thuật" },
    { key: "prosCons", label: "Ưu nhược điểm" },
    { key: "recommendation", label: "Khuyến nghị" },
  ];
  
  // Generate all specs keys from products
  const allSpecsKeys = products.reduce((keys, product) => {
    if (product.specs) {
      Object.keys(product.specs).forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
    }
    return keys;
  }, [] as string[]);

  // Toggle active section
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="glassmorphism-card p-6">
      {/* Comparison tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {comparisonCriteria.map((criteria) => (
          <Button
            key={criteria.key}
            variant={activeSection === criteria.key ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSection(criteria.key)}
            className="rounded-full text-sm"
          >
            {criteria.label}
          </Button>
        ))}
      </div>

      {/* Summary section */}
      <AnimatePresence mode="wait">
        {activeSection === "summary" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glassmorphism-card p-5">
              <h3 className="flex items-center gap-2 text-lg font-medium mb-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Tổng quan so sánh
              </h3>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={`summary-${product.id}`}
                  className="glassmorphism-card p-4 hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <Badge variant="destructive">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-amber-500 space-x-1 mb-3">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300 fill-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    <span className="text-gray-600 text-sm">{product.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-outline w-full justify-center mt-2 flex items-center gap-1"
                  >
                    Xem chi tiết <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Basic info section */}
        {activeSection === "basic" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full comparison-table">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-left rounded-tl-lg">Tiêu chí</th>
                    {products.map((product, index) => (
                      <th
                        key={`basic-header-${product.id}`}
                        className={`py-3 px-4 text-left ${
                          index === products.length - 1 ? "rounded-tr-lg" : ""
                        }`}
                      >
                        <div className="line-clamp-2 font-medium">{product.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="highlight-row">
                    <td className="py-3 px-4 bg-gray-50/50 font-medium">Thương hiệu</td>
                    {products.map((product) => (
                      <td key={`brand-${product.id}`} className="py-3 px-4">
                        {product.brand}
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td className="py-3 px-4 bg-gray-50/50 font-medium">Giá bán</td>
                    {products.map((product) => (
                      <td key={`price-${product.id}`} className="py-3 px-4">
                        <div className="font-bold text-primary">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td className="py-3 px-4 bg-gray-50/50 font-medium">Đánh giá</td>
                    {products.map((product) => (
                      <td key={`rating-${product.id}`} className="py-3 px-4">
                        <div className="flex items-center text-amber-500 space-x-1">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300 fill-gray-300"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          <span className="text-gray-600 text-sm">{product.rating}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td className="py-3 px-4 bg-gray-50/50 font-medium">Bảo hành</td>
                    {products.map((product) => (
                      <td key={`warranty-${product.id}`} className="py-3 px-4">
                        {product.warranty}
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td className="py-3 px-4 bg-gray-50/50 font-medium">Danh mục</td>
                    {products.map((product) => (
                      <td key={`category-${product.id}`} className="py-3 px-4">
                        {product.category}
                      </td>
                    ))}
                  </tr>
                  {products.some(p => p.score) && (
                    <tr className="highlight-row">
                      <td className="py-3 px-4 bg-gray-50/50 font-medium">Điểm đánh giá</td>
                      {products.map((product) => (
                        <td key={`score-${product.id}`} className="py-3 px-4">
                          {product.score ? (
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${(product.score / 10) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="font-medium">{product.score}/10</span>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Specs section */}
        {activeSection === "specs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full comparison-table">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-left rounded-tl-lg">Thông số kỹ thuật</th>
                    {products.map((product, index) => (
                      <th
                        key={`specs-header-${product.id}`}
                        className={`py-3 px-4 text-left ${
                          index === products.length - 1 ? "rounded-tr-lg" : ""
                        }`}
                      >
                        <div className="line-clamp-2 font-medium">{product.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSpecsKeys.map((key, index) => (
                    <tr key={`spec-${key}`} className="highlight-row">
                      <td className="py-3 px-4 bg-gray-50/50 font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </td>
                      {products.map((product) => (
                        <td key={`spec-${product.id}-${key}`} className="py-3 px-4">
                          {product.specs && product.specs[key] ? product.specs[key] : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {products.some(p => p.keyFeatures && p.keyFeatures.length > 0) && (
                    <tr className="highlight-row">
                      <td className="py-3 px-4 bg-gray-50/50 font-medium">Tính năng chính</td>
                      {products.map((product) => (
                        <td key={`features-${product.id}`} className="py-3 px-4">
                          {product.keyFeatures && product.keyFeatures.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {product.keyFeatures.map((feature, idx) => (
                                <li key={idx} className="text-sm">
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "—"
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pros and Cons section */}
        {activeSection === "prosCons" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-6"
          >
            {products.map((product) => (
              <div key={`pros-cons-${product.id}`} className="glassmorphism-card p-5">
                <h3 className="text-lg font-semibold mb-4">{product.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium text-green-600">
                      <Check className="h-5 w-5" /> Ưu điểm
                    </h4>
                    <ul className="space-y-2">
                      {product.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium text-red-600">
                      <X className="h-5 w-5" /> Nhược điểm
                    </h4>
                    <ul className="space-y-2">
                      {product.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Phù hợp nhất cho:</h4>
                  <p className="text-sm text-gray-700 bg-primary/5 p-3 rounded-md">{product.bestFor}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Recommendation section */}
        {activeSection === "recommendation" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="glassmorphism-card p-5">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Khuyến nghị từ AI
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{recommendation}</p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div 
                    key={`rec-${product.id}`}
                    className="rounded-lg border p-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                    </div>
                    <a
                      href={product.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary w-full justify-center mt-2 flex items-center gap-1 text-sm"
                    >
                      Mua ngay <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}