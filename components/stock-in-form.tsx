import type React from "react"
import { useState } from "react"
import { CalendarIcon, Loader2Icon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface StockInFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function StockInForm({ onSubmit, onCancel, isSubmitting }: StockInFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [productName, setProductName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [supplierId, setSupplierId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if product name is entered
    if (!productName || !quantity) {
      alert("Please fill in all required fields.")
      return
    }

    // Send the data to your API
    const response = await fetch("/api/stock-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: format(date, "yyyy-MM-dd"),
        productName,
        quantity: Number.parseInt(quantity),
        supplierId,
        invoiceNumber,
        notes,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      onSubmit(result)  // Pass the result to the parent component (optional)
      alert("Stock-in record successfully added.")
    } else {
      alert("Error submitting stock-in record.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            type="text"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            type="text"
            placeholder="Enter supplier name"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice">Invoice Number</Label>
          <Input
            id="invoice"
            placeholder="Enter invoice number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter any additional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  )
}
