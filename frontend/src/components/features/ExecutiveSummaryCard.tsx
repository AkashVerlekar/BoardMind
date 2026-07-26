import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, NotebookPen, Clock, ShieldCheck, Database, Sunrise, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataLineageTooltip } from "./DataLineageTooltip";

interface ExecutiveSummaryCardProps {
  summary?: string;
  isAiGenerated?: boolean;
  confidenceScore?: number;
  generationTimestamp?: string;
}

export function ExecutiveSummaryCard({ 
  summary, 
  isAiGenerated = true, 
  confidenceScore = 0.95,
  generationTimestamp 
}: ExecutiveSummaryCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative group">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full transition-opacity duration-1000 group-hover:opacity-75" />
      
      <CardHeader className="pb-3 relative z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="w-5 h-5 text-indigo-400" />
          <CardTitle className="text-xl font-semibold tracking-tight">What's for you today?</CardTitle>
          <DataLineageTooltip className="h-5 w-5 ml-2" />
        </div>
        <div className="flex items-center gap-4 text-xs">
          {isAiGenerated && (
            <Badge variant="success" className="flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="w-3 h-3" />
              High Confidence ({(confidenceScore * 100).toFixed(0)}%)
            </Badge>
          )}
          {generationTimestamp && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(generationTimestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-muted-foreground leading-relaxed">
          {summary ? (
            <p>{summary}</p>
          ) : (
            <div className="flex items-center gap-2 text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating executive summary...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
