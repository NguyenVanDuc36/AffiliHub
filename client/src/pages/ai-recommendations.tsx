import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequestTyped } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Product } from "@shared/schema";

interface Recommendation {
  reasoning: string;
  products: Product[];
}

export default function AIRecommendationsPage() {
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (!preferences.trim()) {
      toast({
        title: "Input required",
        description: "Please enter your product preferences",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequestTyped<{recommendations: Recommendation[]}>('/api/ai/recommendations', {
        method: 'POST',
        body: {
          preferences,
          context: "Looking for the best products that match my needs"
        }
      });
      
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">AI Product Recommendations</h1>
      
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">What are you looking for?</h2>
        <Textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="Describe what you're looking for, e.g., 'I need a lightweight laptop for college, budget around $800'"
          className="mb-4 min-h-28"
        />
        <Button 
          onClick={handleGetRecommendations} 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting recommendations...
            </>
          ) : (
            "Get Personalized Recommendations"
          )}
        </Button>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Personalized Recommendations</h2>
          
          {recommendations.map((recommendation, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Recommendation Group {index + 1}</CardTitle>
                <CardDescription>{recommendation.reasoning}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommendation.products.map((product) => (
                    <div key={product.id} className="rounded-lg border bg-card p-3">
                      <div className="space-y-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">${(product.price / 100).toFixed(2)}</span>
                          <Button size="sm" variant="outline">View Details</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}