"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Table, Layers } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardApi } from "@/lib/api";

export function DataImportWizard() {
  const [open, setOpen] = useState(false);
  const [importMode, setImportMode] = useState<"single" | "bulk">("single");
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "success" | "error">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Mock automatic progression to mapping after 1 second for single mode
      setTimeout(() => setStep("mapping"), 1000);
    }
  };

  const handleBulkFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkFiles(Array.from(e.target.files));
    }
  };

  const handleSingleImport = () => {
    setStep("importing");
    // Mock import delay
    setTimeout(() => setStep("success"), 3000);
  };

  const handleBulkImport = async () => {
    if (bulkFiles.length !== 4) {
      setErrorMessage("Please select exactly 4 CSV files (Customers, Employees, Expenses, Sales).");
      setStep("error");
      return;
    }

    setStep("importing");
    const formData = new FormData();
    bulkFiles.forEach(f => formData.append("files", f));

    try {
      const result = await dashboardApi.bulkImportData(formData);
      setBulkResult(result);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || "Failed to run bulk import.");
      setStep("error");
    }
  };

  const handleCloseAndRefresh = () => {
    setOpen(false);
    if (importMode === "bulk" && step === "success") {
      localStorage.setItem("data-mode", "real");
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Import Business Data</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {step === "upload" && "Select an import mode and upload your files."}
            {step === "mapping" && "Map your uploaded columns to BoardMind fields."}
            {step === "importing" && "Importing data safely in the background..."}
            {step === "success" && "Import completed successfully."}
            {step === "error" && "Import failed."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === "upload" && (
            <div className="space-y-6">
              <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                <Button 
                  variant={importMode === "single" ? "secondary" : "ghost"} 
                  className={`flex-1 ${importMode === "single" ? "bg-zinc-800" : ""}`}
                  onClick={() => setImportMode("single")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Single File (Auto-Map)
                </Button>
                <Button 
                  variant={importMode === "bulk" ? "secondary" : "ghost"} 
                  className={`flex-1 ${importMode === "bulk" ? "bg-zinc-800" : ""}`}
                  onClick={() => setImportMode("bulk")}
                >
                  <Layers className="mr-2 h-4 w-4" /> Bulk Starter Import
                </Button>
              </div>

              {importMode === "single" ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/50">
                  <FileSpreadsheet className="h-12 w-12 text-zinc-500 mb-4" />
                  <p className="text-sm text-zinc-400 mb-4 text-center">
                    Drag and drop a single .csv or .xlsx file to automatically map its columns.
                    <br />Maximum file size: 100MB
                  </p>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv, .xlsx" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" className="border-zinc-700 pointer-events-none">
                      Select File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/50">
                  <Layers className="h-12 w-12 text-zinc-500 mb-4" />
                  <p className="text-sm text-zinc-400 mb-4 text-center">
                    Select all 4 required CSV files (Customers, Employees, Expenses, Sales Invoices) at once.
                  </p>
                  <div className="relative mb-4">
                    <input 
                      type="file" 
                      multiple
                      accept=".csv" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleBulkFilesUpload}
                    />
                    <Button variant="outline" className="border-zinc-700 pointer-events-none">
                      Select Multiple Files
                    </Button>
                  </div>
                  {bulkFiles.length > 0 && (
                    <div className="w-full mt-4 p-4 bg-zinc-900 rounded-md">
                      <p className="text-sm font-medium mb-2">Selected Files ({bulkFiles.length}):</p>
                      <ul className="text-sm text-zinc-400 space-y-1">
                        {bulkFiles.map((f, i) => (
                          <li key={i}>• {f.name}</li>
                        ))}
                      </ul>
                      <Button onClick={handleBulkImport} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                        Start Bulk Import
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "mapping" && importMode === "single" && (
            <div className="space-y-4">
              <Alert className="bg-indigo-500/10 border-indigo-500/50 text-indigo-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We detected these columns in <strong>{file?.name}</strong>. Please confirm the mapping.
                </AlertDescription>
              </Alert>
              
              <div className="border border-zinc-800 rounded-md overflow-hidden">
                <div className="grid grid-cols-3 bg-zinc-900 p-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <div>BoardMind Field</div>
                  <div>Uploaded Column</div>
                  <div>Confidence</div>
                </div>
                <div className="divide-y divide-zinc-800">
                  <div className="grid grid-cols-3 p-3 items-center text-sm">
                    <div className="font-medium text-zinc-200">Customer Name</div>
                    <div className="text-zinc-400">Client Name</div>
                    <div className="text-green-400">90% (High)</div>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center text-sm">
                    <div className="font-medium text-zinc-200">Revenue</div>
                    <div className="text-zinc-400">Invoice Value</div>
                    <div className="text-green-400">95% (High)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-zinc-300">Processing records and building relationships...</p>
            </div>
          )}

          {step === "error" && (
             <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
             <AlertCircle className="h-16 w-16 text-red-500" />
             <h3 className="text-xl font-medium text-zinc-100">Import Failed</h3>
             <Alert variant="destructive" className="mt-4">
               <AlertDescription>{errorMessage}</AlertDescription>
             </Alert>
             <Button variant="outline" onClick={() => setStep("upload")} className="mt-4">
                Try Again
             </Button>
           </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="text-center">
                <h3 className="text-xl font-medium text-zinc-100 mb-2">Import Successful</h3>
                {importMode === "single" ? (
                  <p className="text-zinc-400">
                    1,245 rows imported into BoardMind. The dashboard is now running in Real Data Mode.
                  </p>
                ) : (
                  <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 text-left w-full max-w-md mx-auto">
                    <h4 className="font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">Import Summary</h4>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div className="flex justify-between"><span>Customers:</span> <span>{bulkResult?.details?.customers || 0} rows</span></div>
                      <div className="flex justify-between"><span>Employees:</span> <span>{bulkResult?.details?.employees || 0} rows</span></div>
                      <div className="flex justify-between"><span>Expenses:</span> <span>{bulkResult?.details?.expenses || 0} rows</span></div>
                      <div className="flex justify-between font-medium"><span>Sales Transactions:</span> <span className="text-indigo-400">{bulkResult?.details?.sales || 0} rows</span></div>
                      <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between font-bold text-zinc-100">
                        <span>Total Records Imported:</span> <span>{bulkResult?.records_imported || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500 mt-4">
                        <span>Processing Time:</span> <span>{bulkResult?.duration_seconds || 0} seconds</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "mapping" && importMode === "single" && (
            <>
              <Button variant="ghost" onClick={() => setStep("upload")}>Back</Button>
              <Button onClick={handleSingleImport} className="bg-indigo-600 hover:bg-indigo-700">
                Validate & Import
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
          {step === "success" && (
            <Button onClick={handleCloseAndRefresh} className="bg-green-600 hover:bg-green-700 text-white w-full">
              Close & Go to Dashboard (Real Mode)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
