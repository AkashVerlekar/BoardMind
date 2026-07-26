"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthScoreWidget } from "@/components/features/HealthScoreWidget";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BusinessHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await dashboardApi.getBusinessHealth();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch health data:", err);
        setError("Unable to retrieve business health scores.");
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

  const renderProgressBar = (label: string, score: number, description: string) => {
    const getColor = (s: number) => {
      if (s >= 80) return "bg-emerald-500";
      if (s >= 60) return "bg-amber-500";
      return "bg-rose-500";
    };

    return (
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-foreground">{label}</span>
          <span className="font-mono text-muted-foreground">{score.toFixed(1)} / 100</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pr-8">{description}</p>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mt-2">
          <div 
            className={`h-full ${getColor(score)} transition-all duration-1000 ease-out`} 
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Health Index</h1>
        <p className="text-muted-foreground mt-1">Comprehensive breakdown of enterprise vitality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <HealthScoreWidget score={data?.overall} audit={data?.audit} />
        </div>
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-secondary/50 rounded animate-pulse" />
                  <div className="h-8 bg-secondary/50 rounded animate-pulse" />
                  <div className="h-8 bg-secondary/50 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">{data.summary}</p>
                  {renderProgressBar(
                    "Financial Health (50% Weight)", 
                    data.financial, 
                    "Evaluates MRR growth and Profit Margins against Tier-1 SaaS Industry Benchmarks. A score > 80 indicates sustainable hyper-growth."
                  )}
                  {renderProgressBar(
                    "Customer Health (30% Weight)", 
                    data.customers,
                    "Measures Churn Rate and CSAT compared to your trailing Q1 average. A score > 80 means retention is strong and stable."
                  )}
                  {renderProgressBar(
                    "Employee Health (20% Weight)", 
                    data.employees,
                    "Calculated via ENPS (Employer Net Promoter Score) and headcount scaling targets. A score > 80 reflects high morale and low attrition risk."
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
