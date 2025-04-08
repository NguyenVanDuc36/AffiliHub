import OpenAI from "openai";
import { Product } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ComparisonResult {
  summary: string;
  recommendations: string;
  mainBenefit: {
    title: string;
    description: string;
  }[];
  comparisonTable: {
    features: string[];
    products: Array<{
      id: number;
      name: string;
      values: string[];
      score: number;
      pros: string[];
      cons: string[];
      bestFor: string;
    }>;
  };
}

export async function compareProducts(
  productIds: number[],
  products: Product[],
  userPreferences?: string
): Promise<ComparisonResult> {
  try {
    // Filter products to only those we want to compare
    const productsToCompare = products.filter(p => productIds.includes(p.id));
    
    if (productsToCompare.length < 2) {
      throw new Error("At least 2 products are required for comparison");
    }

    // Create product details for the AI
    const productsDetails = productsToCompare.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: $${p.price/100}, Description: ${p.description}`
    ).join('\n\n');

    // Build the prompt
    const prompt = `Compare these products in detail:\n\n${productsDetails}\n
    ${userPreferences ? `User preferences: ${userPreferences}` : ''}
    
    Perform an in-depth, feature-by-feature comparison. For each product:
    1. Identify key features & specifications 
    2. List at least 3-5 pros and 3-5 cons in SHORT, clear bullet points (max 8 words each)
    3. Rate on a scale of 1-10 (higher is better)
    4. Provide a "Best For" summary for each product (who would benefit most from this product)
    5. Format all text for readability - use proper capitalization, avoid ALL CAPS
    
    Also create a list of 3 major benefits or key decision factors when choosing between these products.
    
    Provide your response as a JSON object with this exact structure:
    {
      "summary": "Brief overall comparison summary that's easy to read and understand",
      "recommendations": "Clear buying advice that considers value, quality, and features. Focus on practical recommendations.",
      "mainBenefit": [
        {"title": "Benefit Title 1", "description": "Brief explanation about this decision factor"},
        {"title": "Benefit Title 2", "description": "Brief explanation about this decision factor"},
        {"title": "Benefit Title 3", "description": "Brief explanation about this decision factor"}
      ],
      "comparisonTable": {
        "features": ["Key Feature 1", "Key Feature 2", "Key Feature 3", ...],
        "products": [
          {
            "id": 1,
            "name": "Product Name",
            "values": ["Value for feature 1", "Value for feature 2", ...],
            "score": 8.5,
            "pros": ["Short pro 1", "Short pro 2", ...],
            "cons": ["Short con 1", "Short con 2", ...],
            "bestFor": "Brief description of ideal user profile"
          },
          ...
        ]
      }
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a product comparison expert who provides detailed, objective analyses in simple and concise language. Your comparisons should be easy to read and understand, using clear formatting and avoiding technical jargon when possible." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}") as ComparisonResult;
    
    // Format and clean up the response
    result.summary = result.summary?.trim() || "Không có dữ liệu tóm tắt";
    result.recommendations = result.recommendations?.trim() || "Không có khuyến nghị";
    
    if (!result.mainBenefit || !Array.isArray(result.mainBenefit)) {
      result.mainBenefit = [
        {title: "Chất lượng", description: "Đánh giá chung về chất lượng sản phẩm"},
        {title: "Giá cả", description: "So sánh giá trị so với giá tiền"},
        {title: "Tính năng", description: "Các tính năng nổi bật của sản phẩm"}
      ];
    }
    
    return result;
  } catch (error) {
    console.error("Error comparing products:", error);
    throw new Error(`Failed to compare products: ${error instanceof Error ? error.message : String(error)}`);
  }
}