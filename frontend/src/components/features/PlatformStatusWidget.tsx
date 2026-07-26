"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardApi } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, Server, Activity, Database, Network, Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PlatformStatusWidget() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/system/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const renderStatusItem = (label: string, value: string | undefined, Icon: any) => {
    const isError = value === "Offline" || value === "Degraded";
    
    let badgeVariant: "success" | "warning" | "destructive" | "info" | "default" = "info";
    if (isError) badgeVariant = "destructive";
    else if (value === "Operational" || value === "Online" || value?.includes("Online")) badgeVariant = "success";
    
    return (
      <div className="flex flex-row items-center justify-between py-3 border-b border-border/30 last:border-0 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="shrink-0 text-right">
          <Badge variant={badgeVariant} className="uppercase text-[10px] tracking-wider px-2 py-0.5 font-semibold">
            {value || "Unknown"}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-panel w-full">
      <CardContent className="p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border/50 shrink-0">
          <Server className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">Platform Diagnostics</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center flex-1 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 justify-center">
            {renderStatusItem("Analytics Engine", status?.analytics_engine, Activity)}
            {renderStatusItem("Database", status?.database, Database)}
            {renderStatusItem("API Connection", status?.api, Network)}
            {renderStatusItem("Simulator", status?.simulator, Cpu)}
            {renderStatusItem("AI Services", status?.ai_service, Sparkles)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
