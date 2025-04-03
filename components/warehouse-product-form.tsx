"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { saveProduct } from "@/lib/product-service"
import { getSupplierNames } from "@/lib/supplier-service"
import { getCategoryNames } from "@/lib/category-service"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { Combobox } from "@/components/ui/combobox"
import type { Product } from "@/types"

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
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface WarehouseProductFormProps {
  initialData?: Product
  onSuccess: () => void
}

export function WarehouseProductForm({ initialData, onSuccess }: WarehouseProductFormProps) {
  const isOnline = useNetworkStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<string[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      price: initialData?.price || 0,
      quantity: initialData?.quantity || 0,
      category: initialData?.category || "",
      vendor: initialData?.vendor || "",
      weight: initialData?.weight || "",
      description: initialData?.description || "",
    },
  })

  // Load categories and suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryNames = await getCategoryNames()
        setCategories(categoryNames)

        const supplierNames = await getSupplierNames()
        setSuppliers(supplierNames)
      } catch (error) {
        console.error("Error loading form data:", error)
      }
    }

    loadData()
  }, [])

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()

      // Create or update product
      const product: Product = initialData
        ? {
            ...initialData,
            ...data,
            updatedAt: now,
            syncStatus: "pending",
          }
        : {
            id: crypto.randomUUID(),
            ...data,
            imageUrl: "",
            createdAt: now,
            updatedAt: now,
            syncStatus: "pending",
          }

      // Save to IndexedDB
      await saveProduct(product)

      // Show appropriate toast based on network status
      if (isOnline) {
        toast({
          title: initialData ? "Product Updated" : "Product Added",
          description: initialData
            ? "Product has been updated and will be synced with the server."
            : "Product has been added and will be synced with the server.",
        })
      } else {
        toast({
          title: initialData ? "Product Updated Locally" : "Product Added Locally",
          description: "Changes have been saved locally and will be synced when you're back online.",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${initialData ? "update" : "add"} product. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
                    value={field.value || ""}
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
                  <Combobox
                    options={suppliers.map((supplier) => ({ value: supplier, label: supplier }))}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Select a supplier"
                    emptyMessage={
                      suppliers.length === 0
                        ? "No suppliers available. Add suppliers in the Suppliers page."
                        : "No suppliers found."
                    }
                  />
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
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? initialData
                ? "Updating..."
                : "Adding..."
              : initialData
                ? "Update Product"
                : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

