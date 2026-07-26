"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataLineageProps {
  sourceFile: string;
  importDate: string;
  profileUsed: string;
  recordCount: number;
  className?: string;
}

export function DataLineageTooltip({ 
  sourceFile = "q3_enterprise_customers.csv", 
  importDate = "Oct 12, 2026", 
  profileUsed = "Enterprise CRM Profile v2", 
  recordCount = 1450,
  className = ""
}: DataLineageProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors cursor-help p-1 ${className}`}>
            <Info className="h-3.5 w-3.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-200 p-3 shadow-xl max-w-[280px]">
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-zinc-100 border-b border-zinc-800 pb-1 mb-2">Data Lineage</h4>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-zinc-500">Source:</span>
              <span className="font-medium truncate" title={sourceFile}>{sourceFile}</span>
              
              <span className="text-zinc-500">Imported:</span>
              <span className="font-medium">{importDate}</span>
              
              <span className="text-zinc-500">Profile:</span>
              <span className="font-medium truncate" title={profileUsed}>{profileUsed}</span>
              
              <span className="text-zinc-500">Records:</span>
              <span className="font-medium">{recordCount.toLocaleString()} backing</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
