"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  LineChart, 
  Target, 
  Activity, 
  MessageSquareText, 
  FileText, 
  Settings 
} from "lucide-react";

const navItems = [
  { name: "Morning Brief", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Recommendations", href: "/recommendations", icon: Target },
  { name: "Business Health", href: "/business-health", icon: Activity },
  { name: "Executive AI", href: "/executive-chat", icon: MessageSquareText },
  { name: "Board Reports", href: "/board-reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useAppStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card/50 backdrop-blur-xl flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">B</span>
          </div>
          BoardMind
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            pathname === "/settings" 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
