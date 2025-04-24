"use client"

import { ShieldIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, PERMISSIONS } from "@/lib/auth-context"

export default function RolesPage() {
  const { hasPermission } = useAuth()

  // Check if user has permission to view this page
  if (!hasPermission("manage_roles")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <ShieldIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  // Group permissions by category
  const permissionCategories = {
    Dashboard: Object.entries(PERMISSIONS).filter(([key]) => key.includes("DASHBOARD")),
    Inventory: Object.entries(PERMISSIONS).filter(([key]) => key.includes("INVENTORY")),
    Stock: Object.entries(PERMISSIONS).filter(([key]) => key.includes("STOCK")),
    Suppliers: Object.entries(PERMISSIONS).filter(([key]) => key.includes("SUPPLIERS")),
    Reports: Object.entries(PERMISSIONS).filter(([key]) => key.includes("REPORTS")),
    Users: Object.entries(PERMISSIONS).filter(([key]) => key.includes("USERS")),
    Roles: Object.entries(PERMISSIONS).filter(([key]) => key.includes("ROLES")),
    Settings: Object.entries(PERMISSIONS).filter(([key]) => key.includes("SETTINGS")),
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">View all system permissions for the Administrator role</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Permissions</CardTitle>
          <CardDescription>The Administrator role has full access to all system features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(permissionCategories).map(([category, permissions]) => (
              <div key={category}>
                <h3 className="text-lg font-medium mb-2">{category}</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissions.map(([key, permission]) => (
                    <li key={key} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">{String(permission).replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

