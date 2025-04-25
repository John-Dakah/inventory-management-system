"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Loader2Icon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Mock data for products and destinations
const mockProducts = [
  { id: "P001", name: "Product ABC", stock: 150 },
  { id: "P002", name: "Product DEF", stock: 225 },
  { id: "P003", name: "Product XYZ", stock: 300 },
  { id: "P004", name: "Product MNO", stock: 100 },
  { id: "P005", name: "Product PQR", stock: 180 },
]

const mockDestinations = [
  { id: "D001", name: "Customer XYZ" },
  { id: "D002", name: "Customer ABC" },
  { id: "D003", name: "Customer DEF" },
  { id: "D004", name: "Customer GHI" },
  { id: "D005", name: "Customer JKL" },
  { id: "D006", name: "Warehouse North" },
  { id: "D007", name: "Warehouse South" },
]

interface StockOutFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function StockOutForm({ onSubmit, onCancel, isSubmitting }: StockOutFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [destinationId, setDestinationId] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedProductStock, setSelectedProductStock] = useState<number | null>(null)
  const [quantityError, setQuantityError] = useState("")

  // Update available stock when product changes
  const handleProductChange = (id: string) => {
    setProductId(id)
    const product = mockProducts.find((p) => p.id === id)
    setSelectedProductStock(product?.stock || null)

    // Clear quantity error when product changes
    setQuantityError("")

    // Clear quantity if it's more than available stock
    if (product && Number.parseInt(quantity) > product.stock) {
      setQuantity("")
    }
  }

  // Validate quantity against available stock
  const handleQuantityChange = (value: string) => {
    setQuantity(value)

    if (!value || !selectedProductStock) {
      setQuantityError("")
      return
    }

    const numValue = Number.parseInt(value)
    if (numValue <= 0) {
      setQuantityError("Quantity must be greater than zero")
    } else if (numValue > selectedProductStock) {
      setQuantityError(`Exceeds available stock (${selectedProductStock})`)
    } else {
      setQuantityError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate quantity one more time
    if (quantityError) {
      return
    }

    // Get product name from selected product ID
    const selectedProduct = mockProducts.find((p) => p.id === productId)
    const selectedDestination = mockDestinations.find((d) => d.id === destinationId)

    onSubmit({
      date: format(date, "yyyy-MM-dd"),
      productId,
      productName: selectedProduct?.name,
      quantity: Number.parseInt(quantity),
      destinationId,
      destinationName: selectedDestination?.name,
      referenceNumber,
      notes,
    })
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
          <Label htmlFor="product">Product</Label>
          <Select value={productId} onValueChange={handleProductChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {mockProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.id} - {product.name} (Stock: {product.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            required
            className={quantityError ? "border-red-500" : ""}
          />
          {quantityError && <p className="text-xs text-red-500">{quantityError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Select value={destinationId} onValueChange={setDestinationId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a destination" />
            </SelectTrigger>
            <SelectContent>
              {mockDestinations.map((destination) => (
                <SelectItem key={destination.id} value={destination.id}>
                  {destination.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Reference Number</Label>
          <Input
            id="reference"
            placeholder="Enter reference number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
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
        <Button type="submit" disabled={isSubmitting || !!quantityError || !productId || !quantity || !destinationId}>
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

