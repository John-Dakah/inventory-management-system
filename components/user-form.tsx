"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
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

const userSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal("")),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  department: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    message: "Please select a valid status",
  }),
  role: z.enum(["admin", "warehouse_manager", "sales_person"], {
    message: "Please select a valid role",
  }),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserSaved: (user: UserFormData) => void
  editUser?: User | null
  departments: string[]
}

export function UserForm({ open, onOpenChange, onUserSaved, editUser, departments = [] }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!editUser
  const [newDepartment, setNewDepartment] = useState("")
  const [showNewDepartment, setShowNewDepartment] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      department: "",
      status: "ACTIVE",
      role: "warehouse_manager",
    },
  })

  // Reset form when dialog opens/closes or when editUser changes
  useEffect(() => {
    if (open) {
      if (editUser) {
        // If editing, populate form with user data
        form.reset({
          email: editUser.email,
          // Don't populate password field when editing
          password: "",
          fullName: editUser.fullName,
          department: editUser.department || "",
          status: editUser.status,
          role: editUser.role,
        })
      } else {
        // If adding new user, reset to defaults
        form.reset({
          email: "",
          password: "",
          fullName: "",
          department: "",
          status: "ACTIVE",
          role: "warehouse_manager",
        })
      }
      setShowNewDepartment(false)
      setNewDepartment("")
    }
  }, [open, editUser, form])

  async function onSubmit(data: UserFormValues) {
    setIsSubmitting(true)
    try {
      // Use new department if selected
      if (showNewDepartment && newDepartment) {
        data.department = newDepartment
      }

      // Call the parent's onUserSaved function
      await onUserSaved(data)

      // Close dialog (parent component will handle this if successful)
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} user. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the user details below." : "Fill in the details to add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                        <SelectItem value="sales_person">Sales Person</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  {!showNewDepartment ? (
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          if (value === "new") {
                            setShowNewDepartment(true)
                          } else {
                            field.onChange(value)
                          }
                        }}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">+ Add New Department</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new department"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewDepartment(false)
                          field.onChange("none")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? "Updating..." : "Adding...") : isEditing ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

