"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { discountTypes } from "@/lib/pos-config"
import { formatCurrency } from "@/lib/utils"
import { Percent, DollarSign, X } from "lucide-react"

interface DiscountDialogProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemPrice: number
  onApplyDiscount: (amount: number, type: string) => void
}

export function DiscountDialog({ isOpen, onClose, itemName, itemPrice, onApplyDiscount }: DiscountDialogProps) {
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")

  const calculateDiscount = () => {
    const value = Number.parseFloat(discountValue) || 0

    if (discountType === "percentage") {
      // Cap percentage at 100%
      const percentage = Math.min(value, 100)
      return (itemPrice * percentage) / 100
    } else {
      // Cap fixed amount at item price
      return Math.min(value, itemPrice)
    }
  }

  const handleApplyDiscount = () => {
    const discountAmount = calculateDiscount()
    onApplyDiscount(discountAmount, discountType)
    resetForm()
  }

  const resetForm = () => {
    setDiscountType("percentage")
    setDiscountValue("")
  }

  const handleQuickPercentage = (percentage: number) => {
    setDiscountType("percentage")
    setDiscountValue(percentage.toString())
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply Discount to {itemName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Item Price</Label>
            <div className="font-medium">{formatCurrency(itemPrice)}</div>
          </div>

          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup value={discountType} onValueChange={setDiscountType}>
              {discountTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id}>{type.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">{discountType === "percentage" ? "Percentage" : "Amount"}</Label>
            <div className="flex items-center">
              <Input
                id="discountValue"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                type="number"
                min="0"
                step={discountType === "percentage" ? "1" : "0.01"}
                max={discountType === "percentage" ? "100" : itemPrice.toString()}
                className="flex-1"
              />
              <span className="ml-2">{discountType === "percentage" ? "%" : "$"}</span>
            </div>
          </div>

          {discountType === "percentage" && (
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => handleQuickPercentage(5)}>
                5%
              </Button>
              <Button variant="outline" onClick={() => handleQuickPercentage(10)}>
                10%
              </Button>
              <Button variant="outline" onClick={() => handleQuickPercentage(15)}>
                15%
              </Button>
              <Button variant="outline" onClick={() => handleQuickPercentage(20)}>
                20%
              </Button>
            </div>
          )}

          <div className="p-3 bg-muted rounded-md">
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="font-bold text-red-500">-{formatCurrency(calculateDiscount())}</span>
            </div>
            <div className="flex justify-between">
              <span>Final Price:</span>
              <span className="font-bold">{formatCurrency(itemPrice - calculateDiscount())}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleApplyDiscount} disabled={!discountValue || Number.parseFloat(discountValue) <= 0}>
            {discountType === "percentage" ? (
              <Percent className="mr-2 h-4 w-4" />
            ) : (
              <DollarSign className="mr-2 h-4 w-4" />
            )}
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
