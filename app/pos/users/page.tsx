"use client"
import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth, MOCK_USERS } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function UsersPage() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()

  // Check if user has permission to view this page
  if (!hasPermission("manage_users")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <UsersIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Account</h1>
          <p className="text-muted-foreground">Manage your administrator account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Account</CardTitle>
          <CardDescription>Your account has full access to all system features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={MOCK_USERS[0].avatar} />
              <AvatarFallback>{MOCK_USERS[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{MOCK_USERS[0].name}</h3>
              <p className="text-sm text-muted-foreground">{MOCK_USERS[0].email}</p>
              <div className="mt-1">
                <Badge variant="outline">{MOCK_USERS[0].role}</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Account Details</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">User ID:</span>
                  <span>{MOCK_USERS[0].id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Role:</span>
                  <span>{MOCK_USERS[0].role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Account Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Update Profile
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Notification Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

