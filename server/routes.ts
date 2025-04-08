import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to parse JSON requests
  app.use(express.json());
  // API routes for products
  app.get("/api/products/trending", async (req, res) => {
    try {
      const trendingProducts = await storage.getTrendingProducts();
      res.json(trendingProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching trending products" });
    }
  });

  app.get("/api/products/flash-sale", async (req, res) => {
    try {
      const flashSaleProducts = await storage.getFlashSaleProducts();
      res.json(flashSaleProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching flash sale products" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = await storage.getProducts(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(Number(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // API routes for categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // API routes for blog posts
  app.get("/api/blog/recent", async (req, res) => {
    try {
      const recentPosts = await storage.getRecentBlogPosts();
      res.json(recentPosts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent blog posts" });
    }
  });

  app.get("/api/blog/posts", async (req, res) => {
    try {
      const category = req.query.category as string;
      const blogPosts = await storage.getBlogPosts(category);
      res.json(blogPosts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog posts" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog post" });
    }
  });

  // AI Assistant API routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({ message: "Session ID and message are required" });
      }
      
      // Store user message in conversation history
      await storage.saveAIConversation(sessionId, { 
        role: "user", 
        content: message 
      });
      
      // Get previous conversation history
      const conversationHistory = await storage.getAIConversation(sessionId);
      
      // Get product information to provide context
      const products = await storage.getProducts();
      const trendingProducts = await storage.getTrendingProducts();
      
      // Create a simplified context of products for the AI
      const productContext = `
        Available trending products: ${trendingProducts.map(p => `${p.id}. ${p.name} - $${p.price/100} (${p.category})`).join(', ')}
        All products: ${products.slice(0, 10).map(p => `${p.id}. ${p.name} - $${p.price/100} (${p.category})`).join(', ')}
      `;
      
      // Import chatWithAssistant from our OpenAI service
      const { chatWithAssistant } = await import('./services/openai');
      
      // Generate AI response using OpenAI
      const aiResponse = await chatWithAssistant(conversationHistory, productContext);
      
      // Store AI response in conversation history
      await storage.saveAIConversation(sessionId, { 
        role: "assistant", 
        content: aiResponse 
      });
      
      res.json({ message: aiResponse });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ message: "Error processing AI chat request" });
    }
  });
  
  // AI Product Recommendations API
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { preferences, context } = req.body;
      
      if (!preferences) {
        return res.status(400).json({ message: "User preferences are required" });
      }
      
      // Get all products to provide context
      const allProducts = await storage.getProducts();
      
      // Create a product context string with all products
      const productContext = allProducts.map(p => 
        `ID: ${p.id}, Name: ${p.name}, Price: $${p.price/100}, Category: ${p.category}, Description: ${p.description}`
      ).join('\n');
      
      // Import getProductRecommendations from our OpenAI service
      const { getProductRecommendations } = await import('./services/openai');
      
      // Get personalized recommendations
      const recommendationsResult = await getProductRecommendations(preferences, productContext);
      
      // For each recommendation, fetch the full product details for the recommended IDs
      const enhancedRecommendations = await Promise.all(
        recommendationsResult.recommendations.map(async (rec) => {
          const products = await Promise.all(
            rec.productIds.map(async (id) => await storage.getProductById(id))
          );
          
          return {
            reasoning: rec.reasoning,
            products: products.filter(p => p !== undefined) // Remove any undefined products
          };
        })
      );
      
      res.json({ recommendations: enhancedRecommendations });
    } catch (error) {
      console.error("AI Recommendations Error:", error);
      res.status(500).json({ message: "Error generating product recommendations" });
    }
  });
  
  // AI Product Comparison API
  app.post("/api/ai/product-comparison", async (req, res) => {
    try {
      const { productIds, preferences } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({ message: "At least two product IDs are required for comparison" });
      }
      
      // Get all products
      const allProducts = await storage.getProducts();
      
      // Import compareProducts from our product-comparison service
      const { compareProducts } = await import('./services/product-comparison');
      
      // Generate the comparison data
      const comparisonResult = await compareProducts(productIds, allProducts, preferences);
      
      res.json(comparisonResult);
    } catch (error) {
      console.error("AI Product Comparison Error:", error);
      res.status(500).json({ message: "Error comparing products" });
    }
  });
  
  // API để tìm sản phẩm tương tự
  app.get("/api/products/:id/similar", async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const maxResults = req.query.max ? Number(req.query.max) : 3;
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
      }
      
      // Import findSimilarProducts từ service product-similarity
      const { findSimilarProducts } = await import('./services/product-similarity');
      
      // Tìm các sản phẩm tương tự
      const similarProducts = await findSimilarProducts(productId, maxResults);
      
      res.json(similarProducts);
    } catch (error) {
      console.error("Error finding similar products:", error);
      res.status(500).json({ message: "Lỗi khi tìm sản phẩm tương tự" });
    }
  });
  
  // API cho so sánh chi tiết sản phẩm
  app.post("/api/products/detailed-comparison", async (req, res) => {
    try {
      const { productIds, userPreference } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({ message: "Cần ít nhất 2 sản phẩm để so sánh" });
      }
      
      // Import getDetailedProductComparison từ service product-similarity
      const { getDetailedProductComparison } = await import('./services/product-similarity');
      
      // Lấy dữ liệu so sánh chi tiết
      const comparisonResult = await getDetailedProductComparison(productIds, userPreference);
      
      res.json(comparisonResult);
    } catch (error) {
      console.error("Error comparing products:", error);
      res.status(500).json({ message: "Lỗi khi so sánh sản phẩm" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
