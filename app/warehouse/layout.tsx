'use client';

import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sticky Sidebar */}
        <div className="sticky top-0 h-screen">
          <AppSidebar />
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Header />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}