import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { AuthProvider } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          {/* Sticky Sidebar */}
          <div className="sticky top-0 h-screen">
            <AppSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <Header />
            <main className="container mx-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  )
}
