"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShoppingCartIcon,
  LayoutDashboardIcon,
  UsersIcon,
  BarChart3Icon,
  PackageIcon,
  ReceiptIcon,
  DollarSignIcon,
  Menu,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function POSSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboardIcon,
      href: "/pos",  
      permission: "process_sales",
      active: pathname === "/pos",
    },
    {
      label: "Point of Sale",
      icon: ShoppingCartIcon,
      href: "/pos/pos",  
      permission: "process_sales",
      active: pathname === "/pos/pos",
    },
    {
      label: "Products",
      icon: PackageIcon,
      href: "/pos/products",  
      permission: "view_products",
      active: pathname === "/pos/products",
    },
    {
      label: "Transactions",
      icon: ReceiptIcon,
      href: "/pos/transactions",  
      permission: "view_sales_history",
      active: pathname === "/pos/transactions",
    },
    {
      label: "Customers",
      icon: UsersIcon,
      href: "/pos/customers",  
      permission: "view_customers",
      active: pathname === "/pos/customers",
    },
    {
      label: "Cash Management",
      icon: DollarSignIcon,
      href: "/pos/cash",  
      permission: "open_register",
      active: pathname === "/pos/cash",
    },
    {
      label: "Reports",
      icon: BarChart3Icon,
      href: "/pos/reports", 
      permission: "view_reports",
      active: pathname === "/pos/reports",
    },
  ]

  const filteredRoutes = routes.filter((route) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(route.permission) || user.permissions.includes("admin")
  })

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <Link href="/pos" className="flex items-center" onClick={() => setOpen(false)}>
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                <span className="font-bold text-xl">RetailPOS</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <nav className="grid gap-2">
                {filteredRoutes.map((route, index) => (
                  <Link
                    key={`${route.href}-${index}`}  
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className={cn("hidden md:block", className)}>
        <ScrollArea className="h-full py-6 pr-6">
          <Link href="/pos" className="flex items-center pl-6 mb-10">
            <ShoppingCartIcon className="h-6 w-6 mr-2" />
            <span className="font-bold text-xl">RetailPOS</span>
          </Link>
          <nav className="grid gap-2 px-4">
            {filteredRoutes.map((route, index) => (
              <Link
                key={`${route.href}-${index}`}  
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  )
}
