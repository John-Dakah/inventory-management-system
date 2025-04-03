"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { SalesmanSidebar } from "@/components/salesman-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { UserNav } from "@/components/user-nav"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        {/* Sidebar remains fixed on the left */}
        <SalesmanSidebar />
        {/* Content section */}
        <div className="flex-1 flex flex-col md:ml-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
            <div className="ml-auto flex items-center gap-4">
              <NotificationBell />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}