<<<<<<< HEAD
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import  cuid  from "cuid"; 
import { Button } from "@/components/ui/button";
=======
"use client"

import type React from "react"

import { useState, useEffect } from "react"
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
<<<<<<< HEAD
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast"; 
import { saveSupplier } from "@/lib/supplier-service";
import { useNetworkStatus } from "@/app/hooks/use-network-status";
import type { Supplier } from "@/types";

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
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierSaved: (supplier: Supplier) => void;
  editSupplier?: Supplier | null;
}

export function SupplierForm({ open, onOpenChange, onSupplierSaved, editSupplier }: SupplierFormProps) {
  const { toast } = useToast(); // Correct usage of toast
  const isOnline = useNetworkStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editSupplier;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      products: "",
      status: "Active" as "Active",
      notes: "",
    },
  });
=======
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
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c

  useEffect(() => {
<<<<<<< HEAD
    if (open) {
      if (editSupplier) {
        form.reset({
          name: editSupplier.name,
          contactPerson: editSupplier.contactPerson,
          email: editSupplier.email,
          phone: editSupplier.phone,
          address: editSupplier.address || "",
          products: editSupplier.products,
          status: editSupplier.status as "Active" | "Inactive" | "On Hold",
          notes: editSupplier.notes || "",
        });
      } else {
        form.reset({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          products: "",
          status: "Active",
          notes: "",
        });
      }
    }
  }, [open, editSupplier, form]);

  async function onSubmit(data: SupplierFormValues) {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();

      const supplier: Supplier = isEditing
        ? {
            ...editSupplier!,
            ...data,
            updatedAt: now,
            syncStatus: "pending",
          }
        : {
            id: cuid(), // Using cuid() for unique ID generation
            ...data,
            createdAt: now,
            updatedAt: now,
            syncStatus: "pending",
          };

      await saveSupplier(supplier);

      onSupplierSaved(supplier);

      if (isOnline) {
        toast({
          title: isEditing ? "Supplier Updated" : "Supplier Added",
          description: isEditing
            ? "Supplier has been updated and will be synced with the server."
            : "Supplier has been added and will be synced with the server.",
        });
      } else {
        toast({
          title: isEditing ? "Supplier Updated Locally" : "Supplier Added Locally",
          description: "Changes have been saved locally and will be synced when you're back online.",
        });
      }

      onOpenChange(false);
=======
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
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        variant: "destructive",
        title: "Error",
<<<<<<< HEAD
        description: `Failed to ${isEditing ? "update" : "add"} supplier. Please try again.`,
      });
=======
        description: "Failed to save supplier. Please try again.",
      })
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
    } finally {
      setIsSubmitting(false);
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
<<<<<<< HEAD
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
=======

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
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
              />
              {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
            </div>
<<<<<<< HEAD
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
=======
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
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
<<<<<<< HEAD
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
=======

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
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
              name="products"
              value={supplier.products}
              onChange={handleChange}
              placeholder="List of products or services provided by this supplier"
              rows={3}
            />
<<<<<<< HEAD
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
=======
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
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
      </DialogContent>
    </Dialog>
  );
}
