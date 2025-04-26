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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { saveProduct } from "@/lib/db"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { Combobox } from "@/components/ui/combobox"
import type { Product } from "@/lib/db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  quantity: z.coerce.number().int().nonnegative({ message: "Quantity must be a non-negative integer" }),
  category: z.string().optional(),
  vendor: z.string().optional(),
  weight: z
    .string()
    .regex(/^[\d.]+[a-zA-Z]+$/, {
      message: "Weight must be a number followed by a unit (e.g., 2kg, 500g)",
    })
    .optional(),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductSaved: (product: Product) => void
  editProduct?: Product | null
  categories: string[]
  vendors: string[]
}

export function ProductForm({
  open,
  onOpenChange,
  onProductSaved,
  editProduct,
  categories = [],
  vendors = [],
}: ProductFormProps) {
  const isOnline = useNetworkStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!editProduct

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      quantity: 0,
      category: "",
      vendor: "",
      weight: "",
      description: "",
    },
  })

  // Reset form when dialog opens/closes or when editProduct changes
  useEffect(() => {
    if (open) {
      if (editProduct) {
        // If editing, populate form with product data
        form.reset({
          name: editProduct.name,
          sku: editProduct.sku,
          price: editProduct.price,
          quantity: editProduct.quantity,
          category: editProduct.category || "",
          vendor: editProduct.vendor || "",
          weight: editProduct.weight || "",
          description: editProduct.description || "",
        })
      } else {
        // If adding new product, reset to defaults
        form.reset({
          name: "",
          sku: "",
          price: 0,
          quantity: 0,
          category: "",
          vendor: "",
          weight: "",
          description: "",
        })
      }
    }
  }, [open, editProduct, form])

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const timestamp = Date.now()

      // Create or update product
      const product: Product = isEditing
        ? {
            ...editProduct!,
            ...data,
            updatedAt: now,
            syncStatus: "pending",
            modified: timestamp,
          }
        : {
            id: uuidv4(),
            ...data,
            imageUrl: "",
            createdAt: now,
            updatedAt: now,
            syncStatus: "pending",
            modified: timestamp,
          }

      // Save to IndexedDB and add to sync queue
      await saveProduct(product)

      // Notify parent component
      onProductSaved(product)

      // Trigger sync if online
      if (isOnline) {
        try {
          // Import dynamically to avoid circular dependencies
          const { forceSync } = await import("@/lib/sync-service")
          forceSync().catch((err) => console.error("Error triggering sync after product save:", err))
        } catch (error) {
          console.error("Could not trigger sync:", error)
        }
      }

      // Show appropriate toast based on network status and operation
      if (isOnline) {
        toast({
          title: isEditing ? "Product Updated" : "Product Added",
          description: isEditing
            ? "Product has been updated and will be synced with the server."
            : "Product has been added and will be synced with the server.",
        })
      } else {
        toast({
          title: isEditing ? "Product Updated Locally" : "Product Added Locally",
          description: "Changes have been saved locally and will be synced when you're back online.",
        })
      }

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} product. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the product details below."
              : "Fill in the details to add a new product to your inventory."}
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
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Combobox
                        options={categories.map((category) => ({ value: category, label: category }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search or create category"
                        createOption={true}
                        emptyMessage="No categories found. Type to create a new one."
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Search existing categories or create a new one</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor/Supplier</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.length > 0 ? (
                            vendors.map((vendor) => (
                              <SelectItem key={vendor} value={vendor}>
                                {vendor}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-suppliers" disabled>
                              No suppliers available. Add suppliers in the Suppliers page.
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Select from suppliers added in the Suppliers page</p>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (e.g., 2kg, 500g)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter weight with unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description" {...field} />
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
                    ? "Update Product"
                    : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
