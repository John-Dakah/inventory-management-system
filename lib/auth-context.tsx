// lib/auth-context.ts
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type React from "react"

// Define user roles and their permissions
export const ROLES = {
  CASHIER: "Cashier",
  ADMIN: "Admin",
}

// Define all possible permissions
export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",
  MANAGE_STOCK_IN: "manage_stock_in",
  MANAGE_STOCK_OUT: "manage_stock_out",
  VIEW_REPORTS: "view_reports",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  MANAGE_SETTINGS: "manage_settings",
  PROCESS_SALES: "process_sales",
  VIEW_SALES_HISTORY: "view_sales_history",
  VOID_TRANSACTIONS: "void_transactions",
  APPLY_DISCOUNTS: "apply_discounts",
  VIEW_PRODUCTS: "view_products",
  MANAGE_PRODUCTS: "manage_products",
  VIEW_CUSTOMERS: "view_customers",
  MANAGE_CUSTOMERS: "manage_customers",
  OPEN_REGISTER: "open_register",
  CLOSE_REGISTER: "close_register",
  PERFORM_PAYOUTS: "perform_payouts",
  VIEW_SETTINGS: "view_settings",
}

// Define role-based permissions
export const ROLE_PERMISSIONS = {
  [ROLES.CASHIER]: [
    PERMISSIONS.PROCESS_SALES,
    PERMISSIONS.VIEW_SALES_HISTORY,
    PERMISSIONS.VOID_TRANSACTIONS,
    PERMISSIONS.APPLY_DISCOUNTS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.OPEN_REGISTER,
    PERMISSIONS.CLOSE_REGISTER,
    PERMISSIONS.PERFORM_PAYOUTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_STOCK_IN,
    PERMISSIONS.MANAGE_STOCK_OUT,
  ],
  [ROLES.ADMIN]: [...Object.values(PERMISSIONS)], // Admin gets all permissions
}

// Default user that will be automatically logged in
export const DEFAULT_USER = {
  id: "1",
  name: "Cashier User",
  email: "cashier@example.com",
  role: ROLES.CASHIER,
  permissions: ROLE_PERMISSIONS[ROLES.CASHIER],
  avatar: "/placeholder.svg?height=40&width=40",
}

// Mock users for demo
export const MOCK_USERS = [
  {
    id: "1",
    name: "Cashier User",
    email: "cashier@example.com",
    password: "cashier123",
    role: ROLES.CASHIER,
    permissions: ROLE_PERMISSIONS[ROLES.CASHIER],
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

interface AuthContextType {
  user: typeof DEFAULT_USER | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<typeof DEFAULT_USER | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("posUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    } else {
      // Auto-login with default user for demo purposes
      setUser(DEFAULT_USER)
      setIsAuthenticated(true)
      localStorage.setItem("posUser", JSON.stringify(DEFAULT_USER))
    }
    setIsInitialized(true)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem("posUser", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("posUser")
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false
  }

  if (!isInitialized) {
    return null // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}