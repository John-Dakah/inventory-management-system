"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BoxIcon, ClipboardList, Home, Package2, Settings, ArrowRightLeft, BellIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"

export function WarehouseSidebar() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  return (
    <SidebarProvider>
      <Sidebar className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-border">
        <SidebarHeader className="border-b border-border p-5">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <BoxIcon className="h-6 w-6" />
            <span>Warehouse Portal</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/warehouse/dashboard"}>
                <Link href="/warehouse/dashboard">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/warehouse/stock"}>
                <Link href="/warehouse/stock">
                  <Package2 className="h-5 w-5" />
                  <span>Stock Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/warehouse/transactions"}>
                <Link href="/warehouse/transactions">
                  <ArrowRightLeft className="h-5 w-5" />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/warehouse/reports"}>
                <Link href="/warehouse/reports">
                  <BarChart3 className="h-5 w-5" />
                  <span>Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/warehouse/inventory"}>
                <Link href="/warehouse/inventory">
                  <ClipboardList className="h-5 w-5" />
                  <span>Inventory</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/warehouse/notifications"}>
                <Link href="/warehouse/notifications" className="relative">
                  <BellIcon className="h-5 w-5" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-border p-5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/warehouse/settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <div className="absolute right-4 top-4 md:hidden">
          <SidebarTrigger />
        </div>
      </Sidebar>
    </SidebarProvider>
  )
}

