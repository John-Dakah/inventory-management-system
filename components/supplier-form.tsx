"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveSupplier, type Supplier } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSupplierSaved: (supplier: Supplier) => void
  editSupplier: Supplier | null
}

export function SupplierForm({ open, onOpenChange, onSupplierSaved, editSupplier }: SupplierFormProps) {
  const [supplier, setSupplier] = useState<Supplier>({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    products: "",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editSupplier) {
      setSupplier(editSupplier)
    } else {
      setSupplier({
        id: "",
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        products: "",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    setErrors({})
  }, [editSupplier, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSupplier((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string) => {
    setSupplier((prev) => ({ ...prev, status: value }))

    // Clear error when field is edited
    if (errors.status) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.status
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!supplier.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!supplier.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required"
    }

    if (!supplier.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(supplier.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!supplier.phone.trim()) {
      newErrors.phone = "Phone is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const now = new Date().toISOString()
      const supplierToSave = {
        ...supplier,
        updatedAt: now,
      }

      // If it's a new supplier, set the createdAt date
      if (!supplierToSave.id) {
        supplierToSave.createdAt = now
      }

      const savedSupplier = await saveSupplier(supplierToSave)
      onSupplierSaved(savedSupplier)

      toast({
        title: editSupplier ? "Supplier updated" : "Supplier added",
        description: editSupplier
          ? "The supplier has been successfully updated."
          : "The supplier has been successfully added.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving supplier:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save supplier. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          <DialogDescription>
            {editSupplier
              ? "Update the supplier details below."
              : "Fill in the details below to add a new supplier to your directory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please fix the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input
                id="name"
                name="name"
                value={supplier.name}
                onChange={handleChange}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={supplier.contactPerson}
                onChange={handleChange}
                className={errors.contactPerson ? "border-destructive" : ""}
              />
              {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={supplier.email}
                onChange={handleChange}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={supplier.phone}
                onChange={handleChange}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products/Services</Label>
            <Textarea
              id="products"
              name="products"
              value={supplier.products}
              onChange={handleChange}
              placeholder="List of products or services provided by this supplier"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={supplier.status} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editSupplier ? "Update Supplier" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
