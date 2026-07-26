"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, XCircle, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ImportAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const history = await dashboardApi.getImportHistory();
      setLogs(history);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch import history:", err);
      setError("Failed to fetch import history. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-zinc-100">Import History & Audit Log</h3>
        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-950/50">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead className="text-zinc-400">File Name</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Rows</TableHead>
              <TableHead className="text-zinc-400">Mapping Profile</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                  No import history found in the real database.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                <TableCell className="font-medium text-zinc-200">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-indigo-400" />
                    {log.filename}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-400">{log.date}</TableCell>
                <TableCell>
                  {log.status === 'Completed' && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {log.status}
                    </Badge>
                  )}
                  {log.status === 'Failed' && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                      <XCircle className="mr-1 h-3 w-3" />
                      {log.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-zinc-300">{log.rows.toLocaleString()}</TableCell>
                <TableCell className="text-zinc-400">{log.profile}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-indigo-400" title="Download Original">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" title="View Details">
                    <Clock className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
