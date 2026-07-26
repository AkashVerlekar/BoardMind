"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";

export function Header() {
  const { toggleSidebar, theme, setTheme } = useAppStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 items-center max-w-md" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search insights</label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-10 w-full rounded-md border-0 bg-secondary/30 py-1.5 pl-10 pr-3 text-foreground transition-colors focus:bg-secondary/60 focus:ring-1 focus:ring-primary sm:text-sm"
            placeholder="Ask BoardMind or search insights..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Toggle theme</span>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <Button variant="ghost" className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                CEO
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-foreground" aria-hidden="true">
                  Executive User
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
