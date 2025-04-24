"use client"

import type React from "react"
import type { User, UserRole } from "@/lib/auth"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, CreditCard, Key, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile extends User {
  bio?: string
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Fetch user data on component mount
  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/profile")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch user data")
        }

        const userData = await response.json()

        if (!isMounted) return

        // Convert the API response to match our UserProfile interface
        const userProfile: UserProfile = {
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          department: userData.department || "",
          status: userData.status,
          bio: "", // Add an empty bio since it's not in the database
        }

        setUser(userProfile)

        // Split full name into first and last name
        if (userProfile.fullName) {
          const nameParts = userProfile.fullName.split(" ")
          setFirstName(nameParts[0] || "")
          setLastName(nameParts.slice(1).join(" ") || "")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        if (isMounted) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load user profile.",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [toast])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Combine first and last name
      const fullName = `${firstName} ${lastName}`.trim()

      // Get form data
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get("email") as string
      const bio = formData.get("bio") as string
      const role = formData.get("role") as UserRole
      const department = formData.get("department") as string

      // Send update request
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          bio, // This will be ignored by the API since it's not in the database
          role,
          department,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      // Update local user state
      const updatedUser = await response.json()
      setUser({
        ...user,
        fullName,
        email,
        bio, // Keep the bio in the local state even though it's not saved in the database
        role: updatedUser.role,
        department: updatedUser.department || "",
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const currentPassword = formData.get("currentPassword") as string
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update password")
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      // Clear password fields
      const form = e.target as HTMLFormElement
      form.reset()
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate avatar fallback from user's name
  const getAvatarFallback = () => {
    if (!user?.fullName) return "U"
    const nameParts = user.fullName.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return user.fullName.substring(0, 2).toUpperCase()
  }

  if (isLoading && !user) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load profile. Please try again later.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                  <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="text-xl font-medium">{user.fullName}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Camera className="h-4 w-4" />
                    Change avatar
                  </Button>
                </div>
              </div>

              <Separator />

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" name="bio" defaultValue={user.bio} />
                  <p className="text-xs text-muted-foreground">
                    Note: Bio is stored locally and not saved to the database.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={user.role} name="role">
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                      <SelectItem value="sales_person">Sales Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue={user.department || ""} name="department">
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchasing">Purchasing</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Update your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="currentPassword" name="currentPassword" type="password" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="newPassword" name="newPassword" type="password" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" name="confirmPassword" type="password" className="pl-10" />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update password"}
                </Button>
              </form>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-factor authentication</div>
                    <div className="text-sm text-muted-foreground">Add an extra layer of security to your account.</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Account activity log</div>
                    <div className="text-sm text-muted-foreground">
                      View a log of activities and events related to your account.
                    </div>
                  </div>
                  <Button variant="outline">View log</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email notifications for important updates.
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Low stock alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified when inventory items are running low.
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order status updates</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications when order statuses change.
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">System notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications about system updates and maintenance.
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing emails</div>
                    <div className="text-sm text-muted-foreground">Receive promotional emails and newsletters.</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button>Save preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your billing information and subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">Current Plan: Professional</div>
                    <div className="text-sm text-muted-foreground">$49.99/month, billed monthly</div>
                  </div>
                  <Button variant="outline">Change plan</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Payment method</div>
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <CreditCard className="h-6 w-6" />
                  <div>
                    <div>•••• •••• •••• 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 12/2025</div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Billing address</div>
                <div className="rounded-lg border p-4">
                  <div>{user.fullName}</div>
                  <div>123 Main Street</div>
                  <div>Anytown, CA 12345</div>
                  <div>United States</div>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Billing history</div>
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div>April 2023</div>
                      <div className="text-sm text-muted-foreground">Professional Plan</div>
                    </div>
                    <div className="text-right">
                      <div>$49.99</div>
                      <div className="text-sm text-muted-foreground">Paid</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div>March 2023</div>
                      <div className="text-sm text-muted-foreground">Professional Plan</div>
                    </div>
                    <div className="text-right">
                      <div>$49.99</div>
                      <div className="text-sm text-muted-foreground">Paid</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
