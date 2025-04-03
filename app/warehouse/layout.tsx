"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Truck, BarChart3, Settings, Menu, X, Users, ArrowRightLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { NetworkStatus } from "@/components/network-status"
import { GlobalSyncIndicator } from "@/components/global-sync-indicator"
import { cn } from "@/lib/utils"
import { initializeDatabase } from "@/lib/db-utils"

interface WarehouseLayoutProps {
  children: React.ReactNode
}

export default function WarehouseLayout({ children }: WarehouseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  // Initialize database when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase()
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }

    init()
  }, [])

  const navItems = [
    {
      title: "Dashboard",
      href: "/warehouse",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Inventory",
      href: "/warehouse/inventory",
      icon: <Package className="h-5 w-5" />
    },
    {
      title: "Suppliers",
      href: "/warehouse/suppliers",
      icon: <Truck className="h-5 w-5" />
    },
    {
      title: "Stock Management",
      href: "/warehouse/stock",
      icon: <ArrowRightLeft className="h-5 w-5" />
    },
   
    {
      title: "Reports",
      href: "/warehouse/reports",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/warehouse/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h2 className="text-lg font-semibold">Warehouse Management</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <NetworkStatus />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden transition-all duration-200 ease-in-out",
        sidebarOpen ? "md:ml-64" : "md:ml-64"
      )}>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      
      <GlobalSyncIndicator />
    </div>
  )
}
