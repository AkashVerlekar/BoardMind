import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, XCircle, UserPlus, Loader2, Check, RefreshCw, Copy, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { dashboardApi } from "@/lib/api";

interface RecommendationProps {
  rec: any;
}

export function RecommendationCard({ rec: initialRec }: RecommendationProps) {
  const [rec, setRec] = useState<any>(initialRec);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleAction = async (status: string, assignedToId?: number) => {
    setLoading(true);
    try {
      await dashboardApi.updateRecommendationStatus(rec.id, status, assignedToId);
      // Only update the properties we changed, to prevent wiping the card if the API returns a generic success message
      setRec((prev: any) => ({ ...prev, status }));
      if (status === "Approved") {
        fetchEmployees();
      }
    } catch (err) {
      console.error("Failed to update recommendation:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await dashboardApi.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    if (rec.status === "Approved") {
      fetchEmployees();
    }
  }, [rec.status]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const updatedRec = await dashboardApi.generateActionPlan(rec.id);
      setRec(updatedRec);
    } catch (err) {
      console.error("Failed to generate action plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (rec.action_plan) {
      navigator.clipboard.writeText(rec.action_plan);
    }
  };

  return (
    <Card className="hover:border-primary/30 transition-colors flex flex-col h-full bg-white dark:bg-zinc-950 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-base font-semibold leading-tight">
            {rec.title}
          </CardTitle>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={rec.priority === "High" ? "destructive" : "default"}>
              {rec.priority}
            </Badge>
            {rec.status !== "Pending" && (
              <Badge variant="outline" className="text-xs">
                {rec.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          ID: {rec.recommendation_id} • Dept: {rec.department_name}
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        <p className="line-clamp-3 mb-4">{rec.description}</p>
        
        <div className="bg-secondary/50 rounded-md p-3 text-xs mb-4">
          <div className="font-medium text-foreground mb-1">AI Confidence: {rec.confidence_level} ({(rec.confidence_score * 100).toFixed(0)}%)</div>
          <div className="opacity-80 line-clamp-2 italic">"{ (rec.recommendation_reason || "").split('\n')[0] }"</div>
        </div>

        {rec.status === "Approved" && (
          <div className="flex gap-2 items-center mt-2">
            <select 
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Employee to Assign</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.role})</option>
              ))}
            </select>
          </div>
        )}

        { (rec.status === "Assigned" || rec.status === "Completed") && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Action Plan</h4>
              <div className="flex items-center gap-1">
                {rec.action_plan && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard} title="Copy to clipboard">
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleGeneratePlan} disabled={loading} title="Regenerate Plan">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {rec.action_plan ? (
              <div className="bg-secondary/30 rounded-md p-3 text-sm">
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                  <ReactMarkdown>{rec.action_plan}</ReactMarkdown>
                </div>
                <div className="mt-3 text-[10px] text-muted-foreground flex justify-between items-center opacity-70">
                  <span>Generated: {rec.action_plan_generated_at ? new Date(rec.action_plan_generated_at).toLocaleString() : 'N/A'}</span>
                  <span>{rec.action_plan_is_ai ? 'AI-Generated' : 'Rule-Based Fallback'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No action plan available.
                <Button variant="link" className="text-xs px-1 h-auto" onClick={handleGeneratePlan} disabled={loading}>
                  Generate one now
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-2">
        {rec.status === "Pending" && (
          <div className="flex gap-2 w-full">
            <Button size="sm" className="w-full gap-2" onClick={() => handleAction("Approved")} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
            </Button>
            <Button size="sm" variant="destructive" className="w-full gap-2" onClick={() => handleAction("Rejected")} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
            </Button>
          </div>
        )}
        
        {rec.status === "Approved" && (
          <Button 
            size="sm" 
            className="w-full gap-2" 
            onClick={() => handleAction("Assigned", parseInt(selectedEmployee))} 
            disabled={loading || !selectedEmployee}
          >
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Assign
          </Button>
        )}

        {rec.status === "Assigned" && (
          <Button 
            size="sm" 
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" 
            onClick={() => handleAction("Completed")} 
            disabled={loading}
          >
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Mark Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
