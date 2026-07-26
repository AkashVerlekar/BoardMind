"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Info, X, Lightbulb, Database, Activity, Calculator, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataLineageTooltip } from "./DataLineageTooltip";

export interface AuditInfo {
  metric_name: string;
  source: string;
  business_calculation: string;
  records_processed: number;
  reporting_period: string;
  last_updated: string;
  why_it_changed: string;
  top_contributors: string[];
  input_values: Record<string, any>;
  intermediate_calculations: Record<string, any>;
  final_calculated_value: number;
}

interface MetricCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  trend: string;
  status: string;
  isCurrency?: boolean;
  audit?: AuditInfo;
}

export function MetricCard({ title, currentValue, percentageChange, trend, status, isCurrency, audit }: MetricCardProps) {
  const [showAudit, setShowAudit] = useState(false);
  const trendColor = trend === "increasing" ? "text-[#166534]" : trend === "declining" ? "text-[#991B1B]" : "text-gray-500";
  
  const formatValue = (val: number | undefined) => {
    if (val === undefined || val === null) return "--";
    if (isCurrency) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <>
      <Card 
        className={cn(
          "transition-all bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between relative group",
          audit ? "cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10" : "hover:border-primary/30"
        )}
        onClick={() => audit && setShowAudit(true)}
      >
        {audit && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="w-4 h-4 text-indigo-400" />
          </div>
        )}
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 relative">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
              {title.replace(/_/g, ' ')}
            </CardTitle>
            <DataLineageTooltip className="h-4 w-4" />
          </div>
          <Badge variant={status === "good" ? "success" : status === "warning" ? "warning" : "destructive"} className="uppercase text-[10px] tracking-wider px-2 py-0.5">
            {status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{formatValue(currentValue)}</div>
          <div className="flex items-center gap-1 mt-2">
            <span className={cn(
              "flex items-center text-xs font-medium",
              trendColor
            )}>
              {trend === "increasing" ? <TrendingUp className="w-3 h-3 mr-1" /> : trend === "declining" ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Modal */}
      {showAudit && audit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAudit(false)}>
          <div 
            className="bg-background border border-border/50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-start bg-muted/20">
              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-6 h-6 text-indigo-400" />
                  {audit.metric_name}
                </h2>
                <div className="text-4xl font-bold tracking-tight mt-2 text-foreground">
                  {formatValue(audit.final_calculated_value)}
                </div>
              </div>
              <button onClick={() => setShowAudit(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              
              {/* Business Definition */}
              <section>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Business Definition
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm text-foreground">
                  {audit.business_calculation}
                </div>
              </section>

              {/* Why it Changed */}
              <section>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-500" /> Why It Changed
                </h3>
                <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 text-sm text-foreground leading-relaxed">
                  {audit.why_it_changed}
                </div>
              </section>

              {/* Top Contributors */}
              {audit.top_contributors && audit.top_contributors.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Primary Drivers
                  </h3>
                  <div className="grid gap-2">
                    {audit.top_contributors.map((contributor, i) => (
                      <div key={i} className="text-sm flex items-center gap-3 bg-muted/10 p-3 rounded-md border border-border/30">
                        <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-xs">#{i + 1}</span>
                        <span className="font-medium text-foreground">{contributor}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Data Lineage */}
              <section>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Data Lineage
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/10 p-3 rounded border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">Source System</div>
                    <div className="text-sm font-medium">{audit.source}</div>
                  </div>
                  <div className="bg-muted/10 p-3 rounded border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">Records Processed</div>
                    <div className="text-sm font-medium">{audit.records_processed.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted/10 p-3 rounded border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><History className="w-3 h-3"/> Reporting Period</div>
                    <div className="text-sm font-medium">{audit.reporting_period}</div>
                  </div>
                  <div className="bg-muted/10 p-3 rounded border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                    <div className="text-sm font-medium">{new Date(audit.last_updated).toLocaleString()}</div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
