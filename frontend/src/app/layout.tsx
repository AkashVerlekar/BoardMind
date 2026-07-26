import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BoardMind | Executive Decision Intelligence",
  description: "AI-powered Executive Decision Intelligence Platform",
};

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ClientLayout } from "@/components/layout/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-background text-foreground flex overflow-hidden relative">
        {/* Background Mesh Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen opacity-50" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen opacity-40" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen opacity-30" />
        </div>
        
        <ClientLayout>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 z-10 lg:pl-64 transition-all duration-300">
            <Header />
            <main className="flex-1 overflow-y-auto bg-transparent scroll-smooth">
              <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 mt-2 space-y-8">
                {children}
              </div>
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
