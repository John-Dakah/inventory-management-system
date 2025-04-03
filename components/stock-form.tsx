"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { saveStockItem, type StockItem } from "@/lib/db"

const stockFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity must be a positive number." }),
  location: z.string().min(1, { message: "Location is required." }),
  type: z.string().min(1, { message: "Type is required." }),
})

type StockFormValues = z.infer<typeof stockFormSchema>

interface StockFormProps {
  initialData?: StockItem
  onSuccess: () => void
}

export function StockForm({ initialData, onSuccess }: StockFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<StockFormValues> = {
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "",
    quantity: initialData?.quantity || 0,
    location: initialData?.location || "",
    type: initialData?.type || "Finished Good",
  }

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues,
  })

  async function onSubmit(data: StockFormValues) {
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()

      // Determine status based on quantity
      let status = "In Stock"
      if (data.quantity === 0) {
        status = "Out of Stock"
      } else if (data.quantity <= 10) {
        status = "Low Stock"
      }

      const stockItem: StockItem = {
        id: initialData?.id || uuidv4(),
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        status: status as "In Stock" | "Low Stock" | "Out of Stock",
        type: data.type as "Finished Good" | "Raw Material",
        lastUpdated: now,
        createdAt: initialData?.createdAt || now,
        updatedAt: now,
      }

      await saveStockItem(stockItem)

      toast({
        title: initialData ? "Stock Item Updated" : "Stock Item Created",
        description: initialData
          ? "The stock item has been updated successfully."
          : "A new stock item has been added to inventory.",
      })

      onSuccess()
    } catch (error) {
      console.error("Error saving stock item:", error)
      toast({
        title: "Error",
        description: "There was an error saving the stock item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
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
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
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
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter warehouse location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Finished Good">Finished Good</SelectItem>
                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

