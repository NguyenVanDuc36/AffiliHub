import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Blog from "@/pages/blog";
import AIAssistantPage from "@/pages/ai-assistant";
import AIRecommendationsPage from "@/pages/ai-recommendations";
import ProductComparisonPage from "@/pages/product-comparison";
import SmartComparisonPage from "@/pages/smart-comparison";
import SmartComparisonPageV2 from "@/pages/smart-comparison-v2";
import ProductDetailPage from "@/pages/product-detail";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AIAssistant from "@/components/ai-assistant";
import { AIAssistantProvider } from "@/context/ai-assistant-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/categories" component={Categories}/>
      <Route path="/blog" component={Blog}/>
      <Route path="/ai-assistant" component={AIAssistantPage}/>
      <Route path="/ai-recommendations" component={AIRecommendationsPage}/>
      <Route path="/product-comparison" component={ProductComparisonPage}/>
      <Route path="/so-sanh-thong-minh" component={SmartComparisonPage}/>
      <Route path="/so-sanh-thong-minh-v2" component={SmartComparisonPageV2}/>
      <Route path="/product/:id" component={ProductDetailPage}/>
      <Route path="/san-pham" component={Categories}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AIAssistantProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
          <AIAssistant />
          <Toaster />
        </div>
      </AIAssistantProvider>
    </QueryClientProvider>
  );
}

export default App;
