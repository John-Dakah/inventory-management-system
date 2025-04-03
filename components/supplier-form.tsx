"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { saveSupplier } from "@/lib/supplier-service"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import type { Supplier } from "@/types"

const supplierSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  contactPerson: z.string().min(2, { message: "Contact person is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  address: z.string().optional(),
  products: z.string().min(2, { message: "Products are required" }),
  status: z.enum(["Active", "Inactive", "On Hold"], {
    message: "Please select a valid status",
  }),
  notes: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSupplierSaved: (supplier: Supplier) => void
  editSupplier?: Supplier | null
}

export function SupplierForm({ open, onOpenChange, onSupplierSaved, editSupplier }: SupplierFormProps) {
  const isOnline = useNetworkStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!editSupplier

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      products: "",
      status: "Active",
      notes: "",
    },
  })

  // Reset form when dialog opens/closes or when editSupplier changes
  useEffect(() => {
    if (open) {
      if (editSupplier) {
        // If editing, populate form with supplier data
        form.reset({
          name: editSupplier.name,
          contactPerson: editSupplier.contactPerson,
          email: editSupplier.email,
          phone: editSupplier.phone,
          address: editSupplier.address || "",
          products: editSupplier.products,
          status: editSupplier.status,
          notes: editSupplier.notes || "",
        })
      } else {
        // If adding new supplier, reset to defaults
        form.reset({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          products: "",
          status: "Active",
          notes: "",
        })
      }
    }
  }, [open, editSupplier, form])

  async function onSubmit(data: SupplierFormValues) {
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()

      // Create or update supplier
      const supplier: Supplier = isEditing
        ? {
            ...editSupplier!,
            ...data,
            updatedAt: now,
            syncStatus: "pending",
          }
        : {
            id: uuidv4(),
            ...data,
            createdAt: now,
            updatedAt: now,
            syncStatus: "pending",
          }

      // Save to IndexedDB
      await saveSupplier(supplier)

      // Notify parent component
      onSupplierSaved(supplier)

      // Show appropriate toast based on network status and operation
      if (isOnline) {
        toast({
          title: isEditing ? "Supplier Updated" : "Supplier Added",
          description: isEditing
            ? "Supplier has been updated and will be synced with the server."
            : "Supplier has been added and will be synced with the server.",
        })
      } else {
        toast({
          title: isEditing ? "Supplier Updated Locally" : "Supplier Added Locally",
          description: "Changes have been saved locally and will be synced when you're back online.",
        })
      }

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving supplier:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} supplier. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the supplier details below."
              : "Fill in the details to add a new supplier to your directory."}
            {!isOnline && (
              <span className="mt-2 block text-amber-500">
                You're currently offline. Changes will be saved locally and synced when you're back online.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact person" {...field} />
                    </FormControl>
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <FormControl>
                    <Input placeholder="Products or services provided" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about this supplier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                    ? "Update Supplier"
                    : "Add Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

