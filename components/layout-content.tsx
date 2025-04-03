"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  if (isHomePage) {
    return children
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <main className="container mx-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

