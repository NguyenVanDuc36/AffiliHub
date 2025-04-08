import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products Schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  originalPrice: integer("original_price").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  tag: text("tag"),
  slug: text("slug").notNull().unique(),
  isFeatured: boolean("is_featured").notNull().default(false),
  isFlashSale: boolean("is_flash_sale").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Categories Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  productCount: integer("product_count").notNull().default(0),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Blog Posts Schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  author: text("author").notNull(),
  tags: text("tags").array(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  views: true
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// AI Assistant Conversations Schema
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

// Users Schema (already defined in the existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bảng cache so sánh sản phẩm tương tự
export const productSimilarityCache = pgTable("product_similarity_cache", {
  id: serial("id").primaryKey(),
  sourceProductId: integer("source_product_id").notNull().references(() => products.id),
  similarProductIds: integer("similar_product_ids").array().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertProductSimilarityCacheSchema = createInsertSchema(productSimilarityCache).omit({
  id: true,
  createdAt: true,
});
export type InsertProductSimilarityCache = z.infer<typeof insertProductSimilarityCacheSchema>;
export type ProductSimilarityCache = typeof productSimilarityCache.$inferSelect;

// Bảng cache so sánh chi tiết sản phẩm
export const productComparisonCache = pgTable("product_comparison_cache", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  productIds: integer("product_ids").array().notNull(),
  userPreference: text("user_preference"),
  comparisonResult: jsonb("comparison_result").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertProductComparisonCacheSchema = createInsertSchema(productComparisonCache).omit({
  id: true,
  createdAt: true,
});
export type InsertProductComparisonCache = z.infer<typeof insertProductComparisonCacheSchema>;
export type ProductComparisonCache = typeof productComparisonCache.$inferSelect;
