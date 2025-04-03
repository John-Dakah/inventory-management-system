"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getStockItem, recordStockTransaction, type StockTransaction } from "@/lib/db"

const transactionFormSchema = z.object({
  type: z.enum(["in", "out", "adjustment"], {
    required_error: "Transaction type is required.",
  }),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive number." }),
  reason: z.string().optional(),
  notes: z.string().optional(),
  reference: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface StockTransactionFormProps {
  stockItemId: string
  currentQuantity: number
  onSuccess: () => void
}

export function StockTransactionForm({ stockItemId, currentQuantity, onSuccess }: StockTransactionFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "in",
      quantity: 1,
      reason: "",
      notes: "",
      reference: "",
    },
  })

  const watchType = form.watch("type")
  const watchQuantity = form.watch("quantity")

  // Calculate new quantity based on transaction type
  const calculateNewQuantity = () => {
    const quantity = watchQuantity || 0

    switch (watchType) {
      case "in":
        return currentQuantity + quantity
      case "out":
        return Math.max(0, currentQuantity - quantity)
      case "adjustment":
        return quantity
      default:
        return currentQuantity
    }
  }

  const newQuantity = calculateNewQuantity()

  async function onSubmit(data: TransactionFormValues) {
    setIsSubmitting(true)
    try {
      // Get the stock item to get its location
      const stockItem = await getStockItem(stockItemId)
      if (!stockItem) {
        throw new Error("Stock item not found")
      }

      const now = new Date().toISOString()

      const transaction: StockTransaction = {
        id: uuidv4(),
        stockItemId: stockItemId,
        type: data.type as "in" | "out" | "adjustment",
        quantity: data.quantity,
        previousQuantity: currentQuantity,
        newQuantity: newQuantity,
        location: stockItem.location,
        reference: data.reference,
        reason: data.reason,
        notes: data.notes,
        createdAt: now,
      }

      await recordStockTransaction(transaction)

      toast({
        title: "Transaction Recorded",
        description: `Stock ${data.type} transaction has been recorded successfully.`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error recording transaction:", error)
      toast({
        title: "Error",
        description: "There was an error recording the transaction. Please try again.",
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {watchType === "in"
                    ? "Add stock to inventory"
                    : watchType === "out"
                      ? "Remove stock from inventory"
                      : "Set exact inventory level"}
                </FormDescription>
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
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Current: {currentQuantity} → New: {newQuantity}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input placeholder="Order #, Invoice #, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Purchase">Purchase</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Return">Return</SelectItem>
                    <SelectItem value="Damage">Damage</SelectItem>
                    <SelectItem value="Inventory Count">Inventory Count</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional details about this transaction" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Record Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

