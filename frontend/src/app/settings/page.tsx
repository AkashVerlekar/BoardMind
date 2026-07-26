"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, Bot, Link as LinkIcon, Save, CheckCircle2, Loader2, Database, Briefcase, Upload, FileSpreadsheet } from "lucide-react";
import { DataImportWizard } from "@/components/features/DataImportWizard";
import { ImportAuditLog } from "@/components/features/ImportAuditLog";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "ai", label: "AI Copilot", icon: Bot },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data_sources", label: "Data Sources", icon: Database },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure AI behaviors, integrations, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your executive account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input type="text" defaultValue="Akash Narayan" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input type="email" defaultValue="akash@enterprise.inc" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role / Title</label>
                  <input type="text" defaultValue="Chief Executive Officer" disabled className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background opacity-50 cursor-not-allowed" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved Successfully" : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "ai" && (
            <Card>
              <CardHeader>
                <CardTitle>Executive AI Copilot</CardTitle>
                <CardDescription>Configure how the AI interacts and surfaces anomalies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Copilot Tone</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>Direct & Strategic (Default)</option>
                    <option>Analytical & Detailed</option>
                    <option>Conversational</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anomaly Detection Sensitivity</label>
                  <select defaultValue="Medium (Standard enterprise baseline)" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>High (Detect all minor deviations)</option>
                    <option>Medium (Standard enterprise baseline)</option>
                    <option>Low (Only flag critical &gt;20% deviations)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Auto-Approve Low Risk Actions</label>
                    <p className="text-xs text-muted-foreground">Allow AI to automatically execute non-destructive actions.</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Preferences Saved" : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Salesforce CRM</h3>
                      <p className="text-sm text-muted-foreground">Sync customer growth and sales activity.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900">
                    Connected
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">NetSuite ERP</h3>
                      <p className="text-sm text-muted-foreground">Live financial data and overhead monitoring.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900">
                    Connected
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 text-zinc-600 rounded-lg dark:bg-zinc-800 dark:text-zinc-400">
                      <LinkIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">AWS CloudWatch</h3>
                      <p className="text-sm text-muted-foreground">Monitor server infrastructure costs.</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how the system alerts you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Daily Morning Brief Email</label>
                    <p className="text-xs text-muted-foreground">Receive your AI summary at 8:00 AM.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Critical Anomaly SMS Alerts</label>
                    <p className="text-xs text-muted-foreground">Immediate text for high-priority deviations.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">New Feature Announcements</label>
                    <p className="text-xs text-muted-foreground">Updates on new BoardMind capabilities.</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved Successfully" : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'data_sources' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-zinc-100 flex items-center">
                    <Database className="mr-2 h-5 w-5 text-indigo-400" />
                    Data Sources & Ingestion
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Connect your real enterprise data or run BoardMind in Simulator mode.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div>
                      <h3 className="text-zinc-200 font-medium">Simulator Mode</h3>
                      <p className="text-sm text-zinc-400">Use AI-generated synthetic data for demonstration.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 border-dashed">
                    <div>
                      <h3 className="text-zinc-200 font-medium">Real Business Data (CSV / Excel)</h3>
                      <p className="text-sm text-zinc-400">Upload your own exports to power the analytics engine.</p>
                    </div>
                    <DataImportWizard />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 border-dashed opacity-50">
                    <div>
                      <h3 className="text-zinc-200 font-medium">Database Connection (Coming Soon)</h3>
                      <p className="text-sm text-zinc-400">Connect directly to PostgreSQL, MySQL, or SQL Server.</p>
                    </div>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300" disabled>Connect</Button>
                  </div>
                  
                  <div className="pt-4 mt-8 border-t border-zinc-800">
                    <ImportAuditLog />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
