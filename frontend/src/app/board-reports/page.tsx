"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, Loader2, Calendar, TrendingUp, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import { dashboardApi } from "@/lib/api";

const templates = [
  {
    id: "exec-summary",
    title: "Monthly Executive Summary",
    description: "High-level overview of revenue, profit, and customer growth tailored for board members.",
    icon: <FileText className="w-8 h-8 text-indigo-400" />,
    color: "bg-indigo-500/10 border-indigo-500/20"
  },
  {
    id: "financial-deep-dive",
    title: "Financial Deep Dive",
    description: "Detailed breakdown of operational expenses, payroll, and cash flow projections.",
    icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
    color: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "risk-matrix",
    title: "Risk & Opportunity Matrix",
    description: "AI-generated analysis of current business anomalies and recommended strategic actions.",
    icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
    color: "bg-rose-500/10 border-rose-500/20"
  }
];

export default function BoardReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const [reportData, setReportData] = useState<Record<string, any>>({});

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    try {
      const data = await dashboardApi.generateBoardReport(id);
      setReportData(prev => ({ ...prev, [id]: data }));
      if (!generated.includes(id)) {
        setGenerated([...generated, id]);
      }
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = (id: string, title: string) => {
    const doc = new jsPDF();
    
    // Title (Centered)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (210 - textWidth) / 2, 20);
    
    // Subtitle / Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    const dateStr = `Generated: ${new Date().toLocaleDateString()}`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, (210 - dateWidth) / 2, 28);
    
    // Line separator
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);
    
    // Content based on type
    doc.setFontSize(14);
    doc.setTextColor(0);
    let yPos = 50;
    
    if (reportData[id]) {
      const data = reportData[id];
      const sections = [
        { title: data.section1_title, bullets: data.section1_bullets },
        { title: data.section2_title, bullets: data.section2_bullets },
        { title: data.section3_title, bullets: data.section3_bullets }
      ];

      sections.forEach((section) => {
        if (section.title) {
          doc.setFont("helvetica", "bold");
          const splitTitle = doc.splitTextToSize(section.title, 170);
          doc.text(splitTitle, 20, yPos);
          yPos += 10 * splitTitle.length;
          
          doc.setFont("helvetica", "normal");
          (section.bullets || []).forEach((b: string) => {
            const bulletText = `• ${b}`;
            const splitLines = doc.splitTextToSize(bulletText, 165);
            doc.text(splitLines, 25, yPos);
            yPos += 8 * splitLines.length;
          });
          yPos += 15;
          
          // Add new page if yPos is getting too close to bottom
          if (yPos > 260) {
            doc.addPage();
            yPos = 30;
          }
        }
      });
      
      if (data.appendix) {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Appendix: Evidence & Traceability", 20, 30);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        
        let appY = 50;
        doc.text(`• Internal Snapshot: ${data.appendix.internal_snapshot_time}`, 25, appY);
        appY += 10;
        doc.text(`• Market Intel Timestamp: ${data.appendix.market_cache_time || "N/A"}`, 25, appY);
        appY += 10;
        doc.text(`• Target Industry: ${data.appendix.industry_used || "N/A"}`, 25, appY);
        appY += 10;
        doc.text(`• External Source: ${data.appendix.external_sources}`, 25, appY);
        appY += 10;
        doc.text(`• AI Generation Time: ${data.appendix.ai_generation_time}`, 25, appY);
        
        if (data.appendix.note) {
           appY += 15;
           doc.setFont("helvetica", "italic");
           doc.setTextColor(200, 50, 50);
           const noteLines = doc.splitTextToSize(`Note: ${data.appendix.note}`, 165);
           doc.text(noteLines, 25, appY);
           doc.setTextColor(0);
        }
      }
    } else {
      doc.setFont("helvetica", "italic");
      doc.text("No dynamic data found. Please generate the report again.", 20, yPos);
    }
    
    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Confidential - BoardMind Enterprise Simulator", 105, 280, { align: 'center' });

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Board Reports</h1>
        <p className="text-muted-foreground mt-1">Generate automated, high-fidelity PDF reports for stakeholders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isGenerating = generating === template.id;
          const isGenerated = generated.includes(template.id);
          
          return (
            <Card key={template.id} className="glass-panel flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${template.color}`}>
                  {template.icon}
                </div>
                <CardTitle className="text-xl">{template.title}</CardTitle>
                <CardDescription className="pt-2">{template.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Period: Last 30 Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Format: PDF Document</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4 border-t border-border/50 bg-muted/10 flex justify-between items-center">
                {isGenerated ? (
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" /> Ready
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {isGenerating ? "Processing..." : "Not Generated"}
                  </span>
                )}
                
                {isGenerated ? (
                  <Button variant="default" size="sm" className="gap-2" onClick={() => handleDownload(template.id, template.title)}>
                    <Download className="w-4 h-4" /> Download
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    disabled={isGenerating}
                    onClick={() => handleGenerate(template.id)}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating</>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {generated.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          <Card className="glass-panel overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {generated.map(id => {
                  const t = templates.find(x => x.id === id);
                  return (
                    <div key={`recent-${id}`} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${t?.color}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t?.title}</p>
                          <p className="text-xs text-muted-foreground">Generated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(t?.id || 'report', t?.title || 'Report')}>
                        <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
