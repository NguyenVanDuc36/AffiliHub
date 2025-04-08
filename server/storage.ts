import { 
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  blogPosts, type BlogPost, type InsertBlogPost,
  aiConversations, type AiConversation,
  users, type User, type InsertUser
} from "@shared/schema";

// Interface for the message in AI conversations
type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

// Storage interface with all methods needed
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(category?: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getTrendingProducts(): Promise<Product[]>;
  getFlashSaleProducts(): Promise<Product[]>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Blog methods
  getBlogPosts(category?: string): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getRecentBlogPosts(limit?: number): Promise<BlogPost[]>;
  
  // AI conversation methods
  getAIConversation(sessionId: string): Promise<AIMessage[]>;
  saveAIConversation(sessionId: string, message: AIMessage): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private blogPosts: Map<number, BlogPost>;
  private aiConversations: Map<string, AIMessage[]>;
  
  private userCurrentId: number;
  private productCurrentId: number;
  private categoryCurrentId: number;
  private blogPostCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.blogPosts = new Map();
    this.aiConversations = new Map();
    
    this.userCurrentId = 1;
    this.productCurrentId = 1;
    this.categoryCurrentId = 1;
    this.blogPostCurrentId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Product methods
  async getProducts(category?: string): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    
    if (!category || category === 'all') {
      return allProducts;
    }
    
    return allProducts.filter(product => product.category === category);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getTrendingProducts(): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    return allProducts
      .filter(product => product.isFeatured || product.tag === 'trending' || product.tag === 'hot')
      .slice(0, 10);
  }
  
  async getFlashSaleProducts(): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    return allProducts
      .filter(product => product.isFlashSale)
      .slice(0, 10);
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  // Blog methods
  async getBlogPosts(category?: string): Promise<BlogPost[]> {
    const allPosts = Array.from(this.blogPosts.values());
    
    if (!category || category === 'all') {
      return allPosts;
    }
    
    return allPosts.filter(post => post.category === category);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug
    );
  }
  
  async getRecentBlogPosts(limit: number = 3): Promise<BlogPost[]> {
    const allPosts = Array.from(this.blogPosts.values());
    
    // Sort by publishedAt in descending order
    return allPosts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  // AI conversation methods
  async getAIConversation(sessionId: string): Promise<AIMessage[]> {
    return this.aiConversations.get(sessionId) || [];
  }
  
  async saveAIConversation(sessionId: string, message: AIMessage): Promise<void> {
    const existingConversation = this.aiConversations.get(sessionId) || [];
    existingConversation.push(message);
    this.aiConversations.set(sessionId, existingConversation);
  }
  
  // Initialize sample data for development
  private initializeData() {
    // Categories
    const categories: Category[] = [
      {
        id: this.categoryCurrentId++,
        name: "Thời trang",
        description: "Quần áo, giày dép, phụ kiện thời trang",
        slug: "fashion",
        image: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        productCount: 890
      },
      {
        id: this.categoryCurrentId++,
        name: "Công nghệ",
        description: "Điện thoại, laptop, thiết bị điện tử",
        slug: "tech",
        image: "https://images.unsplash.com/photo-1515940279136-2f419eea8051?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        productCount: 1250
      },
      {
        id: this.categoryCurrentId++,
        name: "Sức khỏe",
        description: "Thực phẩm chức năng, thiết bị sức khỏe",
        slug: "health",
        image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
        productCount: 720
      },
      {
        id: this.categoryCurrentId++,
        name: "Làm đẹp",
        description: "Mỹ phẩm, chăm sóc da, trang điểm",
        slug: "beauty",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
        productCount: 950
      }
    ];
    
    categories.forEach(category => this.categories.set(category.id, category));
    
    // Products
    const products: Product[] = [
      {
        id: this.productCurrentId++,
        name: "Tai nghe không dây Sony WH-1000XM4",
        description: "Tai nghe chống ồn cao cấp với âm thanh Hi-Res và thời lượng pin lên đến 30 giờ.",
        price: 5790000,
        originalPrice: 6800000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        category: "tech",
        rating: 4.5,
        reviewCount: 128,
        stock: 42,
        tag: "hot",
        slug: "sony-wh-1000xm4",
        isFeatured: true,
        isFlashSale: false,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Dell XPS 13 Plus (2023)",
        description: "Laptop cao cấp với màn hình InfinityEdge, Intel Core i7 thế hệ 12, 16GB RAM, 512GB SSD.",
        price: 32490000,
        originalPrice: 34990000,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
        category: "tech",
        rating: 5.0,
        reviewCount: 42,
        stock: 18,
        tag: "hot",
        slug: "dell-xps-13-plus-2023",
        isFeatured: true,
        isFlashSale: false,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "La Roche-Posay Anthelios UVMune 400",
        description: "Kem chống nắng với công nghệ bảo vệ da khỏi tia UVA/UVB, không gây nhờn rít, phù hợp mọi loại da.",
        price: 450000,
        originalPrice: 550000,
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
        category: "beauty",
        rating: 4.0,
        reviewCount: 236,
        stock: 78,
        tag: "bestseller",
        slug: "la-roche-posay-anthelios-uvmune-400",
        isFeatured: true,
        isFlashSale: false,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Nike Air Zoom Pegasus 39",
        description: "Giày chạy bộ với đệm React siêu nhẹ, đế ngoài bền bỉ, phù hợp cho chạy hàng ngày và tập luyện.",
        price: 2190000,
        originalPrice: 2700000,
        image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        category: "fashion",
        rating: 4.5,
        reviewCount: 186,
        stock: 64,
        tag: null,
        slug: "nike-air-zoom-pegasus-39",
        isFeatured: true,
        isFlashSale: false,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Apple Watch Series 8",
        description: "Đồng hồ thông minh với màn hình Always-On, cảm biến nhiệt độ, tính năng theo dõi giấc ngủ và sức khỏe nâng cao.",
        price: 8990000,
        originalPrice: 10990000,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
        category: "tech",
        rating: 5.0,
        reviewCount: 102,
        stock: 29,
        tag: "trending",
        slug: "apple-watch-series-8",
        isFeatured: true,
        isFlashSale: false,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Apple AirPods Pro 2",
        description: "Tai nghe không dây với khả năng chống ồn chủ động, âm thanh không gian, dò tìm vị trí và pin lâu hơn.",
        price: 3990000,
        originalPrice: 5990000,
        image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
        category: "tech",
        rating: 4.8,
        reviewCount: 156,
        stock: 3,
        tag: null,
        slug: "apple-airpods-pro-2",
        isFeatured: false,
        isFlashSale: true,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Samsung Galaxy S22",
        description: "Điện thoại thông minh với camera chuyên nghiệp, chip Exynos 2200, màn hình Dynamic AMOLED 2X 120Hz.",
        price: 13990000,
        originalPrice: 18990000,
        image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        category: "tech",
        rating: 4.7,
        reviewCount: 87,
        stock: 5,
        tag: null,
        slug: "samsung-galaxy-s22",
        isFeatured: false,
        isFlashSale: true,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Dyson V11 Absolute",
        description: "Máy hút bụi không dây với công nghệ lọc HEPA, dò tìm bụi bẩn thông minh và thời lượng pin lên đến 60 phút.",
        price: 11990000,
        originalPrice: 14990000,
        image: "https://images.unsplash.com/photo-1631281956016-3cdc1b2fe5fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
        category: "tech",
        rating: 4.6,
        reviewCount: 63,
        stock: 12,
        tag: null,
        slug: "dyson-v11-absolute",
        isFeatured: false,
        isFlashSale: true,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Adidas Ultraboost 22",
        description: "Giày chạy bộ với đệm Boost siêu nhẹ, đế ngoài Continental™ Rubber, thiết kế ôm chân vừa vặn.",
        price: 2190000,
        originalPrice: 3650000,
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=464&q=80",
        category: "fashion",
        rating: 4.5,
        reviewCount: 92,
        stock: 4,
        tag: null,
        slug: "adidas-ultraboost-22",
        isFeatured: false,
        isFlashSale: true,
        createdAt: new Date()
      },
      {
        id: this.productCurrentId++,
        name: "Macbook Air M2",
        description: "Laptop siêu mỏng nhẹ với chip M2, màn hình Liquid Retina, thời lượng pin lên đến 18 giờ.",
        price: 28990000,
        originalPrice: 31990000,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
        category: "tech",
        rating: 4.9,
        reviewCount: 78,
        stock: 15,
        tag: "trending",
        slug: "macbook-air-m2",
        isFeatured: true,
        isFlashSale: false,
        createdAt: new Date()
      }
    ];
    
    products.forEach(product => this.products.set(product.id, product));
    
    // Blog Posts
    const blogPosts: BlogPost[] = [
      {
        id: this.blogPostCurrentId++,
        title: "Top 5 xu hướng thời trang mùa hè 2023 không thể bỏ qua",
        slug: "top-5-xu-huong-thoi-trang-mua-he-2023",
        excerpt: "Khám phá những xu hướng thời trang hot nhất của mùa hè năm nay để làm mới tủ đồ và tạo nên phong cách ấn tượng cho riêng mình.",
        content: "Bài viết chi tiết về xu hướng thời trang mùa hè 2023...",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1020&q=80",
        category: "fashion",
        views: 2400,
        publishedAt: new Date("2023-08-20"),
        author: "Mai Anh",
        tags: ["thời trang", "mùa hè", "xu hướng"]
      },
      {
        id: this.blogPostCurrentId++,
        title: "So sánh 5 tai nghe chống ồn tốt nhất 2023 cho làm việc và giải trí",
        slug: "so-sanh-5-tai-nghe-chong-on-tot-nhat-2023",
        excerpt: "Đánh giá chi tiết về chất lượng âm thanh, khả năng chống ồn, thời lượng pin và mức độ thoải mái của 5 mẫu tai nghe hàng đầu hiện nay.",
        content: "Bài viết chi tiết so sánh các tai nghe chống ồn...",
        image: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80",
        category: "tech",
        views: 3600,
        publishedAt: new Date("2023-08-18"),
        author: "Minh Tuấn",
        tags: ["công nghệ", "tai nghe", "review"]
      },
      {
        id: this.blogPostCurrentId++,
        title: "7 món ăn giàu protein giúp tăng cơ hiệu quả cho người tập gym",
        slug: "7-mon-an-giau-protein-tang-co-hieu-qua",
        excerpt: "Chế độ dinh dưỡng phù hợp đóng vai trò quan trọng trong quá trình tập luyện. Khám phá những món ăn giàu protein giúp tăng cơ hiệu quả.",
        content: "Bài viết chi tiết về các món ăn giàu protein...",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1153&q=80",
        category: "health",
        views: 5200,
        publishedAt: new Date("2023-08-16"),
        author: "Thanh Hà",
        tags: ["sức khỏe", "dinh dưỡng", "gym"]
      },
      {
        id: this.blogPostCurrentId++,
        title: "5 bước chăm sóc da cơ bản cho làn da khỏe mạnh",
        slug: "5-buoc-cham-soc-da-co-ban",
        excerpt: "Quy trình chăm sóc da cơ bản không quá phức tạp nhưng cần thực hiện đều đặn để có được làn da khỏe mạnh và rạng rỡ.",
        content: "Bài viết chi tiết về quy trình chăm sóc da...",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        category: "beauty",
        views: 4800,
        publishedAt: new Date("2023-08-14"),
        author: "Thu Trang",
        tags: ["làm đẹp", "chăm sóc da", "skincare"]
      }
    ];
    
    blogPosts.forEach(post => this.blogPosts.set(post.id, post));
  }
}

export const storage = new MemStorage();
