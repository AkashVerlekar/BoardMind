"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30d");

  const periodMap: Record<string, string> = {
    "today": "Today's",
    "7d": "7-day",
    "30d": "30-day",
    "quarter": "Quarterly",
    "year": "Annual"
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await dashboardApi.getAnalyticsHistory(period);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch historical analytics:", err);
        setError("Unable to retrieve historical data from the Enterprise Simulator.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Deep Dive</h1>
          <p className="text-muted-foreground mt-1">Simulated {periodMap[period]} historical trend analysis.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-lg border border-border/50 backdrop-blur-sm">
          <label htmlFor="analytics-period" className="text-sm text-muted-foreground font-medium pl-2">Period:</label>
          <select 
            id="analytics-period"
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-background border border-border text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="w-full h-full bg-secondary/20 animate-pulse rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.revenue}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="w-full h-full bg-secondary/20 animate-pulse rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.profit}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
            AI Insights & Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm leading-relaxed space-y-4">
          <p>
            <strong>Pattern Recognition:</strong> The graphs above illustrate a simulated {periodMap[period]} baseline for Enterprise Revenue and Profit. You can observe distinct, periodic spikes which correspond to major expected business events (like end-of-month billing cycles or seasonal promotions).
          </p>
          <p>
            <strong>Why this matters:</strong> By establishing this historical baseline, the <strong className="text-foreground">BoardMind Intelligence Engine</strong> understands what "normal" volatility looks like for your specific enterprise. 
            When current metrics deviate significantly from these established patterns, the engine instantly flags them as anomalies and surfaces them on your Morning Brief as Priority Actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
