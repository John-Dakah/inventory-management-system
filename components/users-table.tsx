"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { MoreHorizontal, Trash, Edit, AlertCircle, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UsersTable({ users, isLoading, onEdit, onDelete }: UsersTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  // Delete user
  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await onDelete(id)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      })
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
    }
  }

  // Confirm delete
  const confirmDelete = (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Export users to CSV
  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Full Name", "Email", "Department", "Role", "Status", "Created At"]
      const csvContent = [
        headers.join(","),
        ...users.map((user) =>
          [
            `"${user.fullName.replace(/"/g, '""')}"`,
            `"${user.email.replace(/"/g, '""')}"`,
            `"${user.department?.replace(/"/g, '""') || ""}"`,
            `"${formatRole(user.role)}"`,
            `"${user.status}"`,
            `"${new Date(user.createdAt).toLocaleDateString()}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `users-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Exported ${users.length} users to CSV.`,
      })
    } catch (error) {
      console.error("Error exporting users:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export users. Please try again.",
      })
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Render empty state
  if (users.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button variant="outline" onClick={exportToCSV} disabled={true}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="rounded-md border border-dashed p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No users found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add your first user to get started.</p>
        </div>
      </div>
    )
  }

  // Format role for display
  function formatRole(role: string) {
    switch (role) {
      case "admin":
        return "Admin"
      case "warehouse_manager":
        return "Warehouse Manager"
      case "sales_person":
        return "Sales Person"
      default:
        return role
    }
  }

  // Render users table
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.department || "-"}</TableCell>
                <TableCell>{formatRole(user.role)}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>{user.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => confirmDelete(user.id)}
                        disabled={isDeleting === user.id}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {isDeleting === user.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDelete(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

