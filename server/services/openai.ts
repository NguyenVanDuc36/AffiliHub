import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Product recommendation function
export async function getProductRecommendations(userPreferences: string, productContext?: string): Promise<{
  recommendations: Array<{
    reasoning: string;
    productIds: number[];
  }>;
}> {
  try {
    // Combine user preferences with product context if available
    const prompt = `As a shopping assistant for an e-commerce affiliate site, recommend products based on these preferences:
      "${userPreferences}"
      ${productContext ? `\nAdditional context: ${productContext}` : ''}
      
      Analyze the preferences and recommend up to 3 specific products with reasoning.
      Provide your response as a JSON object with this exact structure:
      {
        "recommendations": [
          {
            "reasoning": "Clear explanation why this product matches preferences",
            "productIds": [1, 5, 7] // IDs of products that match this reasoning
          }
        ]
      }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful shopping assistant that recommends relevant products based on user preferences." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error getting product recommendations:", error);
    throw new Error(`Failed to get product recommendations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Chat with AI assistant
export async function chatWithAssistant(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string
): Promise<string> {
  try {
    // Create system message with context about available products
    const systemMessage = `You are a helpful shopping assistant for an affiliate website. 
    Your job is to help users find products that match their needs and provide personalized recommendations.
    ${context ? `\nHere's some context about our available products: ${context}` : ''}
    
    IMPORTANT INSTRUCTIONS FOR DISPLAYING IMAGES:
    - When user asks for product images, use the markdown format: ![Product Name](URL) 
    - You can also use HTML format: <img src="URL" alt="Product Name">
    - Only provide images for products in our catalog, don't create fictional URLs
    - Common product images available are for electronics, fashion, and home goods
    - If a specific image is requested and unavailable, explain that you don't have that specific image
    
    Be friendly, conversational, and helpful. If you don't know something, say so honestly.`;

    // Format messages for OpenAI API
    const formattedMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages.map(msg => ({ 
        role: msg.role as "user" | "assistant", 
        content: msg.content 
      }))
    ];

    // Add image prompt instructions based on content of user's latest message
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content.toLowerCase() || "";
    const imageKeywords = ["image", "picture", "photo", "show me", "how does it look", "hình ảnh", "hình", "ảnh"];
    const containsImageRequest = imageKeywords.some(keyword => lastUserMessage.includes(keyword));
    
    // Enhanced response to encourage showing product images when requested
    const responsePrompt = {
      model: "gpt-4o",
      messages: formattedMessages,
      max_tokens: 800, // Increase token limit to allow for image URLs
    };
    
    // Add a nudge to include images if the user is asking for them
    if (containsImageRequest) {
      // Add a sample product image URL if the user is asking for images
      // This is a sample product from our database
      responsePrompt.messages.push({ 
        role: "system" as const, 
        content: "The user seems to be asking for product images. Please include appropriate product images in your response using markdown format or HTML img tags. Here are some example product images you can use:\n" +
          "- For headphones: https://source.unsplash.com/random/800x600/?headphones\n" +
          "- For smartphones: https://source.unsplash.com/random/800x600/?smartphone\n" + 
          "- For laptops: https://source.unsplash.com/random/800x600/?laptop\n" +
          "- For fashion: https://source.unsplash.com/random/800x600/?fashion\n" +
          "Choose the most appropriate image(s) based on the user's request."
      });
    }

    const response = await openai.chat.completions.create(responsePrompt);

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error chatting with AI assistant:", error);
    throw new Error(`Failed to chat with AI assistant: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Analyze the sentiment of a product review
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user" as const,
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw new Error(`Failed to analyze sentiment: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generate personalized product descriptions
export async function generateProductDescription(
  product: { name: string; category: string; features?: string[] },
  targetAudience?: string
): Promise<string> {
  try {
    const prompt = `Generate an engaging and SEO-friendly product description for:
      Product: ${product.name}
      Category: ${product.category}
      ${product.features ? `Key Features: ${product.features.join(", ")}` : ''}
      ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
      
      The description should highlight benefits, create desire, and include a clear call-to-action.
      Keep it conversational, use persuasive language, and be specific about product benefits.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system" as const, content: "You are a copywriter specialized in creating compelling product descriptions for e-commerce." },
        { role: "user" as const, content: prompt }
      ],
      max_tokens: 350,
    });

    return response.choices[0].message.content || "No description generated.";
  } catch (error) {
    console.error("Error generating product description:", error);
    throw new Error(`Failed to generate product description: ${error instanceof Error ? error.message : String(error)}`);
  }
}