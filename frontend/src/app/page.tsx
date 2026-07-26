"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { ExecutiveSummaryCard } from "@/components/features/ExecutiveSummaryCard";
import { MetricCard } from "@/components/features/MetricCard";
import { HealthScoreWidget } from "@/components/features/HealthScoreWidget";
import { RecommendationCard } from "@/components/features/RecommendationCard";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MorningBriefDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const result = await dashboardApi.getMorningBrief(period);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Unable to connect to the Executive Intelligence Engine. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [period]);

  if (error && !data) {
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
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Subtle Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-25"
        style={{
          backgroundImage: "url('/morning-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 space-y-6 animate-in fade-in duration-500 pb-8 px-6 pt-6">
        
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Good Morning Boss 😊</h1>
          <p className="text-muted-foreground mt-2 text-lg">Your proactive AI executive summary.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-r border-border/50 pr-4">
            <Clock className="w-4 h-4" />
            <span>Refreshed: {data?.last_refreshed ? new Date(data.last_refreshed).toLocaleTimeString() : '...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="period-select" className="text-sm font-medium text-foreground">Period:</label>
            <select 
              id="period-select"
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-background border border-border text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ExecutiveSummaryCard 
            summary={data?.executive_summary} 
            isAiGenerated={data?.is_ai_generated}
            confidenceScore={data?.confidence_score}
            generationTimestamp={data?.generation_timestamp}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <HealthScoreWidget score={data?.health_score} audit={data?.health_audit} />
        </div>
      </div>

      {/* Strategic Overview */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Strategic Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && !data ? (
             Array(4).fill(0).map((_, i) => (
               <div key={i} className="h-32 bg-card rounded-xl animate-pulse border" />
             ))
          ) : (
            <>
              {data?.strategic_highlights && Object.keys(data.strategic_highlights).length > 0 ? Object.entries(data.strategic_highlights).map(([key, metric]: [string, any]) => (
                <MetricCard 
                  key={key}
                  title={key}
                  currentValue={metric.current_value}
                  previousValue={metric.previous_value}
                  percentageChange={metric.percentage_change}
                  trend={metric.trend}
                  status={metric.status}
                  isCurrency={key === "revenue" || key === "profit" || key === "cash_flow"}
                  audit={metric.audit}
                />
              )) : (
                <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                  No strategic highlights available for this reporting period.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Priority Actions */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Priority Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && !data ? (
             Array(3).fill(0).map((_, i) => (
               <div key={i} className="h-48 bg-card rounded-xl animate-pulse border" />
             ))
          ) : (
            data?.recommended_actions && data.recommended_actions.length > 0 ? (
              data.recommended_actions.map((rec: any) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No priority actions identified for this period.
              </div>
            )
          )}
        </div>
      </div>
      
    </div>
    </div>
  );
}
