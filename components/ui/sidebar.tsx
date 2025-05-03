"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Users, Settings, Building2, Truck, BarChart2, ShoppingCart } from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Stock",
    href: "/stock",
    icon: Building2,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Point of Sale",
    href: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart2,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar({ children }: { children: React.ReactNode }) {
  return <aside className="flex h-full w-[240px] flex-col border-r bg-background px-2">{children}</aside>
}

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  return children
}

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-1 overflow-auto py-2">{children}</div>
}

export const SidebarGroup = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  return (
    <div>
      {label && <div className="px-3 py-2 text-sm font-medium text-muted-foreground">{label}</div>}
      <div>{children}</div>
    </div>
  )
}
export const SidebarFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="border-t p-4">{children}</div>
}
export const SidebarGroupContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const SidebarHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex h-14 items-center border-b px-2">{children}</div>
}

export const SidebarMenu = ({ children }: { children: React.ReactNode }) => {
  return <nav className="grid items-start gap-2">{children}</nav>
}

export const SidebarMenuButton = ({
  children,
  isActive,
  tooltip,
}: { children: React.ReactNode; isActive?: boolean; tooltip?: string }) => {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent" : "transparent",
      )}
    >
      {children}
    </button>
  )
}

export const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => {
  return <li>{children}</li>
}

export const SidebarSeparator = () => <hr className="my-2 border-border" />

export const SidebarTrigger = () => <button>Search</button>

