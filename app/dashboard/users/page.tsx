"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Edit, Trash2, Eye, Save, Search } from "lucide-react"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "sales_person",
    department: "",
    phone: "",
  })
  const [editUser, setEditUser] = useState({
    id: "",
    email: "",
    fullName: "",
    role: "",
    department: "",
    phone: "",
    address: "",
    status: "",
    notes: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          (user.department && user.department.toLowerCase().includes(query)),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })

      setOpenCreateDialog(false)
      setNewUser({
        email: "",
        password: "",
        fullName: "",
        role: "sales_person",
        department: "",
        phone: "",
      })
      fetchUsers()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      setOpenEditDialog(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to delete user")
        }

        toast({
          title: "Success",
          description: "User deleted successfully",
        })

        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewUser = (userId) => {
    router.push(`/dashboard/users/${userId}`)
  }

  const openEditUserDialog = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user details")
      }
      const data = await response.json()
      setEditUser({
        id: data.user.id,
        email: data.user.email || "",
        fullName: data.user.fullName || "",
        role: data.user.role || "",
        department: data.user.department || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        status: data.user.status || "ACTIVE",
        notes: data.user.notes || "",
      })
      setOpenEditDialog(true)
    } catch (error) {
      console.error("Error fetching user details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to your organization. They will receive an email with their login details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                      <SelectItem value="sales_person">Sales Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. All fields are optional except for name and email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={editUser.fullName}
                    onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                      <SelectItem value="sales_person">Sales Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editUser.status}
                    onValueChange={(value) => setEditUser({ ...editUser, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    value={editUser.department}
                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editUser.address}
                  onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editUser.notes}
                  onChange={(e) => setEditUser({ ...editUser, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Your Users</CardTitle>
          <CardDescription>Manage the users you have created in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name, email, role or department..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {users.length === 0
                  ? "No users found. Create your first user to get started."
                  : "No users match your search criteria."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewUser(user.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openEditUserDialog(user.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
