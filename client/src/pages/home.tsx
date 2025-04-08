import HeroSection from "@/components/hero-section";
import TrendingProducts from "@/components/trending-products";
import FlashSale from "@/components/flash-sale";
import Categories from "@/components/categories";
import AIFeatures from "@/components/ai-features";
import RecentBlogs from "@/components/recent-blogs";
import CTASection from "@/components/cta-section";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>AffiliHub - Nền tảng Affiliate Thông minh với AI</title>
        <meta name="description" content="AffiliHub - Nền tảng affiliate hiện đại với trợ lý AI thông minh giúp bạn tìm đúng sản phẩm phù hợp nhu cầu" />
      </Helmet>
      <HeroSection />
      <TrendingProducts />
      <FlashSale />
      <Categories />
      <AIFeatures />
      <RecentBlogs />
      <CTASection />
    </>
  );
}
