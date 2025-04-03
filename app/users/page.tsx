"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusIcon, Search, X, FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTable } from "@/components/users-table"
import { UserForm } from "@/components/user-form"
import { NetworkStatus } from "@/components/network-status"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { getUsers, getUserStats, addUser, updateUser, deleteUser } from "@/app/actions/user-actions"
import type { UserFormData } from "@/app/actions/user-actions"

// Define User type based on what's returned from the server
type User = {
  id: string
  email: string
  fullName: string
  department?: string | null
  status: "ACTIVE" | "INACTIVE"
  role: "admin" | "warehouse_manager" | "sales_person"
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [open, setOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    warehouseManagers: 0,
    salesPersons: 0,
    departments: [] as string[],
  })

  // Load users and stats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load users
        const data = await getUsers()
        setUsers(data)
        setFilteredUsers(data)

        // Calculate stats
        const userStats = await getUserStats()
        setStats(userStats)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters
  useEffect(() => {
    let results = users

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.department?.toLowerCase().includes(term),
      )
    }

    // Role filter
    if (roleFilter !== "All") {
      results = results.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "All") {
      results = results.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(results)
  }, [searchTerm, roleFilter, statusFilter, users])

  // Handle user saved (added or updated)
  const handleUserSaved = async (userData: UserFormData) => {
    try {
      if (editUser) {
        // Update existing user
        const result = await updateUser(editUser.id, userData)

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          })
          return
        }

        if (result.user) {
          // Update local state
          setUsers((prev) => prev.map((u) => (u.id === editUser.id ? (result.user as User) : u)))

          toast({
            title: "User Updated",
            description: "User has been updated successfully.",
          })
        }
      } else {
        // Add new user
        const result = await addUser(userData)

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          })
          return
        }

        if (result.user) {
          // Update local state
          setUsers((prev) => [result.user as User, ...prev])

          toast({
            title: "User Added",
            description: "New user has been added successfully.",
          })
        }
      }

      // Refresh stats
      const userStats = await getUserStats()
      setStats(userStats)

      // Close form
      setOpen(false)
      setEditUser(null)
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save user. Please try again.",
      })
    }
  }

  // Handle edit button click
  const handleEdit = (user: User) => {
    setEditUser(user)
    setOpen(true)
  }

  // Handle add button click
  const handleAdd = () => {
    setEditUser(null)
    setOpen(true)
  }

  // Handle delete
  const handleDelete = async (userId: string) => {
    try {
      const result = await deleteUser(userId)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.success) {
        // Update local state
        setUsers((prev) => prev.filter((u) => u.id !== userId))

        // Refresh stats
        const userStats = await getUserStats()
        setStats(userStats)

        toast({
          title: "User Deleted",
          description: "User has been deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      })
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter("All")
    setStatusFilter("All")
    setIsFilterOpen(false)
  }

  // Count active filters
  const activeFilterCount = [roleFilter !== "All", statusFilter !== "All"].filter(Boolean).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their permissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <Button onClick={handleAdd}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${stats.departments.length} departments`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${Math.round((stats.active / (stats.total || 1)) * 100)}% of users`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${stats.warehouseManagers} warehouse managers, ${stats.salesPersons} sales`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${Math.round((stats.inactive / (stats.total || 1)) * 100)}% of users`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>View and manage all system users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between pb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8" value={searchTerm} onChange={handleSearchChange} />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs" variant="secondary">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
                        Clear all
                      </Button>
                    </div>

                    <div>
                      <h5 className="mb-2 text-sm font-medium">Role</h5>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                          <SelectItem value="sales_person">Sales Person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="mb-2 text-sm font-medium">Status</h5>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Statuses</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <UsersTable users={filteredUsers} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>

      <UserForm
        open={open}
        onOpenChange={setOpen}
        onUserSaved={handleUserSaved}
        editUser={editUser}
        departments={stats.departments}
      />
    </div>
  )
}

