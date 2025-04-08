import OpenAI from "openai";
import { storage } from "../storage";
import { Product, productSimilarityCache, productComparisonCache } from "@shared/schema";
import { db } from "../db";
import { eq, and, gt } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Thời gian hết hạn cache mặc định (7 ngày)
const DEFAULT_CACHE_EXPIRATION_DAYS = 7;

// Tìm sản phẩm tương tự dựa trên sản phẩm được chọn (với cơ chế cache)
export async function findSimilarProducts(productId: number, maxResults: number = 3): Promise<Product[]> {
  try {
    // Bước 1: Kiểm tra cache
    const cachedResult = await checkSimilarProductsCache(productId);
    
    // Nếu có cache hợp lệ, trả về kết quả từ cache
    if (cachedResult && cachedResult.length > 0) {
      console.log(`[Cache hit] Returning cached similar products for product ID: ${productId}`);
      return cachedResult.slice(0, maxResults);
    }
    
    console.log(`[Cache miss] Finding similar products for product ID: ${productId}`);
    
    // Bước 2: Nếu không có cache, gọi AI để tìm sản phẩm tương tự
    // Lấy sản phẩm được chọn từ storage
    const selectedProduct = await storage.getProductById(productId);
    
    if (!selectedProduct) {
      throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
    }
    
    // Lấy tất cả sản phẩm
    const allProducts = await storage.getProducts();
    
    // Loại bỏ sản phẩm đã chọn khỏi danh sách
    const otherProducts = allProducts.filter(p => p.id !== productId);
    
    // Nếu có ít hơn maxResults sản phẩm, trả về tất cả
    if (otherProducts.length <= maxResults) {
      return otherProducts;
    }
    
    // Xây dựng prompt để AI tìm các sản phẩm tương tự
    const prompt = `Dưới đây là thông tin về một sản phẩm:
    - Tên: ${selectedProduct.name}
    - Loại: ${selectedProduct.category}
    - Giá: ${selectedProduct.price}
    - Mô tả: ${selectedProduct.description}
    
    Dưới đây là danh sách các sản phẩm khác. Hãy chọn tối đa ${maxResults} sản phẩm tương tự nhất với sản phẩm trên:
    ${otherProducts.map((p, index) => `${index + 1}. Tên: ${p.name}, Loại: ${p.category}, Giá: ${p.price}, Mô tả: ${p.description}`).join('\n')}
    
    Trả về danh sách các ID (vị trí trong danh sách) của các sản phẩm tương tự nhất, theo định dạng JSON sau:
    {
      "similarProductIds": [số_thứ_tự_1, số_thứ_tự_2, số_thứ_tự_3]
    }
    
    Chỉ trả về JSON, không bao gồm bất kỳ giải thích nào.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Bạn là trợ lý phân tích sản phẩm. Nhiệm vụ của bạn là tìm các sản phẩm tương tự dựa trên thông tin được cung cấp." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse kết quả
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.similarProductIds || !Array.isArray(result.similarProductIds)) {
      throw new Error("Không thể phân tích kết quả từ AI");
    }
    
    // Lấy sản phẩm từ danh sách dựa trên các ID được trả về
    const similarProducts = result.similarProductIds
      .map(id => otherProducts[id - 1])
      .filter(Boolean) // Loại bỏ các giá trị undefined/null
      .slice(0, maxResults); // Đảm bảo không vượt quá số lượng yêu cầu
    
    // Bước 3: Lưu kết quả vào cache
    if (similarProducts.length > 0) {
      await saveSimilarProductsToCache(productId, similarProducts.map(p => p.id));
    }
    
    return similarProducts;
  } catch (error) {
    console.error("Error finding similar products:", error);
    throw new Error(`Lỗi khi tìm sản phẩm tương tự: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Hàm kiểm tra cache cho sản phẩm tương tự
async function checkSimilarProductsCache(productId: number): Promise<Product[] | null> {
  try {
    // Tìm cache hợp lệ (chưa hết hạn)
    const cacheEntries = await db.select()
      .from(productSimilarityCache)
      .where(
        and(
          eq(productSimilarityCache.sourceProductId, productId),
          gt(productSimilarityCache.expiresAt, new Date())
        )
      )
      .limit(1);
    
    // Không tìm thấy cache hợp lệ
    if (cacheEntries.length === 0) {
      return null;
    }
    
    const cacheEntry = cacheEntries[0];
    
    // Lấy danh sách sản phẩm tương tự từ cache
    const similarProductIds = cacheEntry.similarProductIds;
    
    // Lấy thông tin chi tiết của các sản phẩm
    const similarProducts = await Promise.all(
      similarProductIds.map(async (id) => await storage.getProductById(id))
    );
    
    // Lọc bỏ các sản phẩm không tồn tại (undefined)
    return similarProducts.filter(Boolean) as Product[];
  } catch (error) {
    console.error("Error checking similar products cache:", error);
    return null;
  }
}

// Hàm lưu kết quả sản phẩm tương tự vào cache
async function saveSimilarProductsToCache(productId: number, similarProductIds: number[]): Promise<void> {
  try {
    // Tính thời gian hết hạn (7 ngày kể từ bây giờ)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_CACHE_EXPIRATION_DAYS);
    
    // Xóa cache cũ nếu có
    await db.delete(productSimilarityCache)
      .where(eq(productSimilarityCache.sourceProductId, productId));
    
    // Thêm cache mới
    await db.insert(productSimilarityCache).values({
      sourceProductId: productId,
      similarProductIds: similarProductIds,
      expiresAt: expiresAt
    });
    
    console.log(`[Cache saved] Similar products for product ID: ${productId}`);
  } catch (error) {
    console.error("Error saving similar products to cache:", error);
    // Không throw lỗi ở đây để không ảnh hưởng đến flow chính
  }
}

// Cấu trúc dữ liệu cho kết quả so sánh
export interface ProductComparisonDetail {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  brand: string;
  rating: number; // Thang điểm từ 1-5
  keyFeatures: string[];
  specs: {
    weight?: string;
    dimensions?: string;
    batteryLife?: string;
    connectivity?: string;
    [key: string]: string | undefined;
  };
  warranty: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  buyUrl: string;
}

// Tạo chuỗi cacheKey từ danh sách sản phẩm và yêu cầu người dùng
function generateComparisonCacheKey(productIds: number[], userPreference?: string): string {
  // Sắp xếp productIds để đảm bảo cùng một tập sản phẩm luôn tạo ra cùng một cache key
  const sortedIds = [...productIds].sort((a, b) => a - b);
  
  // Tạo key từ danh sách ID và yêu cầu người dùng
  const preferencePart = userPreference ? `-${userPreference.slice(0, 50).replace(/\s+/g, '-')}` : '';
  return `comparison-${sortedIds.join('-')}${preferencePart}`;
}

// So sánh chi tiết giữa các sản phẩm (với cơ chế cache)
export async function getDetailedProductComparison(
  productIds: number[],
  userPreference?: string
): Promise<{
  products: ProductComparisonDetail[];
  comparison: {
    summary: string;
    recommendation: string;
    comparisonPoints: {
      category: string;
      description: string;
    }[];
  };
}> {
  try {
    // Bước 1: Tạo cache key
    const cacheKey = generateComparisonCacheKey(productIds, userPreference);
    
    // Bước 2: Kiểm tra xem có cache hợp lệ không
    const cachedResult = await checkComparisonCache(cacheKey);
    if (cachedResult) {
      console.log(`[Cache hit] Returning cached comparison for key: ${cacheKey}`);
      return cachedResult;
    }
    
    console.log(`[Cache miss] Generating new comparison for key: ${cacheKey}`);
    
    // Bước 3: Nếu không có cache, thực hiện so sánh với OpenAI
    // Lấy thông tin chi tiết của tất cả sản phẩm
    const productsPromises = productIds.map(id => storage.getProductById(id));
    const products = (await Promise.all(productsPromises)).filter(Boolean) as Product[];
    
    if (products.length < 2) {
      throw new Error("Cần ít nhất 2 sản phẩm để so sánh");
    }
    
    // Xây dựng prompt để AI phân tích và so sánh sản phẩm
    const prompt = `So sánh chi tiết các sản phẩm sau:
    ${products.map((p, index) => `
    Sản phẩm ${index + 1}:
    - Tên: ${p.name}
    - Giá hiện tại: ${p.price}
    - Giá gốc: ${p.originalPrice}
    - Danh mục: ${p.category}
    - Mô tả: ${p.description}
    `).join('\n')}
    
    ${userPreference ? `Người dùng có sở thích/yêu cầu: ${userPreference}` : ''}
    
    Hãy phân tích và so sánh chi tiết các sản phẩm này, bao gồm các thông tin sau cho mỗi sản phẩm:
    1. Thương hiệu (tách từ tên sản phẩm)
    2. Đánh giá (từ 1-5 sao, ước lượng dựa trên thông tin và giá)
    3. Tính năng chính (tối đa 5 tính năng, trích từ mô tả)
    4. Thông số kỹ thuật (trọng lượng, kích thước, thời lượng pin, kết nối... nếu có trong mô tả)
    5. Thời gian bảo hành ước tính
    6. Ưu điểm (3-5 điểm)
    7. Nhược điểm (2-3 điểm)
    8. Phù hợp nhất cho (một đối tượng người dùng cụ thể)
    
    Ngoài ra, hãy cung cấp:
    1. Tóm tắt so sánh tổng quan
    2. Khuyến nghị nên chọn sản phẩm nào và lý do
    3. 3-4 tiêu chí so sánh quan trọng nhất
    
    Trả về kết quả dưới định dạng JSON sau:
    {
      "products": [
        {
          "id": số_id,
          "name": "tên_sản_phẩm",
          "price": giá_hiện_tại,
          "originalPrice": giá_gốc,
          "brand": "thương_hiệu",
          "rating": điểm_đánh_giá,
          "keyFeatures": ["tính_năng_1", "tính_năng_2", ...],
          "specs": {
            "weight": "trọng_lượng",
            "dimensions": "kích_thước",
            "batteryLife": "thời_lượng_pin",
            "connectivity": "kết_nối"
          },
          "warranty": "thời_gian_bảo_hành",
          "pros": ["ưu_điểm_1", "ưu_điểm_2", ...],
          "cons": ["nhược_điểm_1", "nhược_điểm_2", ...],
          "bestFor": "phù_hợp_nhất_cho",
          "buyUrl": "/products/chi-tiet-san-pham?id=số_id"
        },
        ...
      ],
      "comparison": {
        "summary": "tóm_tắt_so_sánh",
        "recommendation": "khuyến_nghị",
        "comparisonPoints": [
          {
            "category": "tiêu_đề_tiêu_chí",
            "description": "mô_tả_tiêu_chí"
          },
          ...
        ]
      }
    }`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Bạn là chuyên gia so sánh sản phẩm. Nhiệm vụ của bạn là phân tích và so sánh chi tiết các sản phẩm." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });
    
    // Parse kết quả
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Đảm bảo format đúng
    if (!result.products || !Array.isArray(result.products) || !result.comparison) {
      throw new Error("Kết quả từ AI không đúng định dạng");
    }
    
    // Bước 4: Lưu kết quả vào cache
    await saveComparisonToCache(cacheKey, productIds, userPreference, result);
    
    return result;
  } catch (error) {
    console.error("Error getting detailed product comparison:", error);
    throw new Error(`Lỗi khi so sánh sản phẩm: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Hàm kiểm tra cache so sánh sản phẩm
async function checkComparisonCache(cacheKey: string): Promise<any | null> {
  try {
    // Tìm cache hợp lệ (chưa hết hạn)
    const cacheEntries = await db.select()
      .from(productComparisonCache)
      .where(
        and(
          eq(productComparisonCache.cacheKey, cacheKey),
          gt(productComparisonCache.expiresAt, new Date())
        )
      )
      .limit(1);
    
    // Không tìm thấy cache hợp lệ
    if (cacheEntries.length === 0) {
      return null;
    }
    
    // Trả về kết quả so sánh từ cache
    return cacheEntries[0].comparisonResult;
  } catch (error) {
    console.error("Error checking comparison cache:", error);
    return null;
  }
}

// Hàm lưu kết quả so sánh sản phẩm vào cache
async function saveComparisonToCache(
  cacheKey: string, 
  productIds: number[], 
  userPreference: string | undefined, 
  comparisonResult: any
): Promise<void> {
  try {
    // Tính thời gian hết hạn (7 ngày kể từ bây giờ)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_CACHE_EXPIRATION_DAYS);
    
    // Xóa cache cũ nếu có
    await db.delete(productComparisonCache)
      .where(eq(productComparisonCache.cacheKey, cacheKey));
    
    // Thêm cache mới
    await db.insert(productComparisonCache).values({
      cacheKey: cacheKey,
      productIds: productIds,
      userPreference: userPreference,
      comparisonResult: comparisonResult,
      expiresAt: expiresAt
    });
    
    console.log(`[Cache saved] Product comparison for key: ${cacheKey}`);
  } catch (error) {
    console.error("Error saving product comparison to cache:", error);
    // Không throw lỗi ở đây để không ảnh hưởng đến flow chính
  }
}