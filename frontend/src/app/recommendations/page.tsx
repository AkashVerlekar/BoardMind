"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { RecommendationCard } from "@/components/features/RecommendationCard";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await dashboardApi.getRecommendations();
        setRecommendations(result);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Unable to retrieve recommendations from the AI Decision Engine.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Actionable Recommendations</h1>
          <p className="text-muted-foreground mt-1">Manage AI-generated business directives.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
           Array(8).fill(0).map((_, i) => (
             <div key={i} className="h-64 bg-card rounded-xl animate-pulse border" />
           ))
        ) : recommendations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
            No recommendations generated. Business operations are fully optimized.
          </div>
        ) : (
          recommendations.map((rec: any) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))
        )}
      </div>
    </div>
  );
}
