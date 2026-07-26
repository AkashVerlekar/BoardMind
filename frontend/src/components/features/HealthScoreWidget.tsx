"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditInfo } from "./MetricCard";

interface HealthScoreWidgetProps {
  score?: number;
  audit?: AuditInfo;
}

export function HealthScoreWidget({ score, audit }: HealthScoreWidgetProps) {
  const [showAudit, setShowAudit] = useState(false);
  const isLoaded = score !== undefined;
  
  // Determine colors based on score (matching WCAG AA badges)
  const getColors = (s: number) => {
    if (s >= 80) return { fill: "fill-[#DCFCE7]", stroke: "stroke-[#166534]", text: "text-[#166534]" }; // GOOD
    if (s >= 60) return { fill: "fill-[#FEF3C7]", stroke: "stroke-[#92400E]", text: "text-[#92400E]" }; // WARNING
    return { fill: "fill-[#FEE2E2]", stroke: "stroke-[#991B1B]", text: "text-[#991B1B]" }; // ERROR
  };

  const colors = isLoaded ? getColors(score) : { fill: "fill-muted", stroke: "stroke-muted", text: "text-muted" };
  
  return (
    <>
      <Card 
        className={cn(
          "flex flex-col items-center justify-center text-center relative group transition-all bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm",
          audit ? "cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10" : ""
        )}
        onClick={() => audit && setShowAudit(true)}
      >
        {audit && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="w-4 h-4 text-indigo-400" />
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Enterprise Health</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center">
          <div 
            className="relative w-32 h-32 flex items-center justify-center"
            role="img"
            aria-label={`Enterprise Health Score: ${isLoaded ? score.toFixed(0) : "Loading"} out of 100`}
          >
            {/* Circular progress background */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle 
                cx="50" cy="50" r="40" 
                className={cn("transition-colors duration-1000", colors.fill)} 
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                strokeWidth="8" 
                className="stroke-muted/20"
              />
              {isLoaded && (
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  strokeWidth="8" 
                  strokeDasharray={`${(score / 100) * 251} 251`}
                  className={cn("transition-all duration-1000 ease-out", colors.stroke)}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className={cn("text-4xl font-bold font-mono z-10", colors.text)}>
              {isLoaded ? score.toFixed(0) : "--"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Modal */}
      {showAudit && audit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAudit(false)}>
          <div 
            className="bg-background border border-border/50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-400" />
                  Health Score Model Weighting
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Audit trace for {audit.reporting_period}</p>
              </div>
              <button onClick={() => setShowAudit(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">Aggregation Logic</h3>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-sm font-mono text-indigo-300">
                  {audit.business_calculation}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">Normalized Sub-Scores</h3>
                  <div className="space-y-2">
                    {Object.entries(audit.input_values).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-sm bg-muted/10 p-2 rounded border border-border/30">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium text-foreground">{typeof val === 'number' ? val.toFixed(1) : val} / 100</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">Weighted Contributions</h3>
                  <div className="space-y-2">
                    {Object.entries(audit.intermediate_calculations).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-sm bg-muted/10 p-2 rounded border border-border/30">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium text-emerald-400">+{typeof val === 'number' ? val.toFixed(1) : val} pts</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm bg-indigo-500/10 p-2 rounded border border-indigo-500/30 mt-4">
                      <span className="text-foreground font-semibold">Final Score</span>
                      <span className="font-bold text-indigo-400 text-lg">{audit.final_calculated_value.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {audit.top_contributors && audit.top_contributors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">Model Weights Configuration</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {audit.top_contributors.map((contributor, i) => {
                      const [label, weight] = contributor.split(':');
                      return (
                        <div key={i} className="text-sm flex flex-col bg-muted/10 p-2 rounded border border-border/30 text-center">
                          <span className="text-muted-foreground text-xs">{label}</span> 
                          <span className="text-foreground font-medium">{weight}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
