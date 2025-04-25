"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogOutIcon, MenuIcon, XIcon, SettingsIcon, ShoppingCartIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { POSSidebar } from "@/components/pos-sidebar"

export function POSLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/pos" className="flex items-center gap-2">
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="text-lg font-bold">RetailPOS</span>
            
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <POSSidebar />
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0) || "C"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="flex h-16 items-center border-b px-4">
          <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium">
              {user?.name} ({user?.role})
            </span>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

