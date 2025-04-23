"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TransactionItem, PaymentDetail } from "@/lib/db"
import { businessInfo } from "@/lib/pos-config"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, DollarSign, X } from "lucide-react"

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  cartItems: TransactionItem[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  onProcessPayment: (payments: PaymentDetail[], cashierName: string) => void
}

export function PaymentDialog({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discountTotal,
  taxTotal,
  total,
  onProcessPayment,
}: PaymentDialogProps) {
  const [activeTab, setActiveTab] = useState("cash")
  const [cashAmount, setCashAmount] = useState("")
  const [cardReference, setCardReference] = useState("")
  const [cashierName, setCashierName] = useState("")
  const [change, setChange] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCashAmount(total.toFixed(2))
      setCardReference("")
      setChange(0)
      setActiveTab("cash")
    }
  }, [isOpen, total])

  // Calculate change when cash amount changes
  useEffect(() => {
    const cashValue = Number.parseFloat(cashAmount) || 0
    setChange(Math.max(0, cashValue - total))
  }, [cashAmount, total])

  const handleQuickAmount = (amount: number) => {
    setCashAmount(amount.toFixed(2))
  }

  const handleProcessPayment = () => {
    setIsProcessing(true)

    const payments: PaymentDetail[] = []

    if (activeTab === "cash") {
      payments.push({
        method: "Cash",
        amount: Number.parseFloat(cashAmount) || total,
      })
    } else if (activeTab === "card") {
      payments.push({
        method: "Credit Card",
        amount: total,
        reference: cardReference,
      })
    } else if (activeTab === "split") {
      // Handle split payment logic here
    }

    // Process the payment
    setTimeout(() => {
      onProcessPayment(payments, cashierName)
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subtotal</Label>
              <div className="font-medium">{formatCurrency(subtotal)}</div>
            </div>
            {discountTotal > 0 && (
              <div>
                <Label>Discount</Label>
                <div className="font-medium text-red-500">-{formatCurrency(discountTotal)}</div>
              </div>
            )}
            <div>
              <Label>Tax ({businessInfo.taxRate}%)</Label>
              <div className="font-medium">{formatCurrency(taxTotal)}</div>
            </div>
            <div>
              <Label>Total</Label>
              <div className="text-xl font-bold">{formatCurrency(total)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashierName">Cashier Name</Label>
            <Input
              id="cashierName"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="Enter cashier name"
              required
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="cash">Cash</TabsTrigger>
              <TabsTrigger value="card">Card</TabsTrigger>
              <TabsTrigger value="split">Split</TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Cash Amount</Label>
                <Input
                  id="cashAmount"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => handleQuickAmount(Math.ceil(total))}>
                  {formatCurrency(Math.ceil(total))}
                </Button>
                <Button variant="outline" onClick={() => handleQuickAmount(Math.ceil(total / 5) * 5)}>
                  {formatCurrency(Math.ceil(total / 5) * 5)}
                </Button>
                <Button variant="outline" onClick={() => handleQuickAmount(Math.ceil(total / 10) * 10)}>
                  {formatCurrency(Math.ceil(total / 10) * 10)}
                </Button>
                <Button variant="outline" onClick={() => handleQuickAmount(Math.ceil(total / 20) * 20)}>
                  {formatCurrency(Math.ceil(total / 20) * 20)}
                </Button>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-bold">{formatCurrency(change)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardType">Card Type</Label>
                <RadioGroup defaultValue="credit" className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit">Credit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit">Debit</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardReference">Reference/Last 4 digits</Label>
                <Input
                  id="cardReference"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  placeholder="Enter reference or last 4 digits"
                />
              </div>

              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="split" className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p>Split payment functionality coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleProcessPayment}
            disabled={isProcessing || !cashierName || (activeTab === "cash" && Number.parseFloat(cashAmount) < total)}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                {activeTab === "cash" ? (
                  <DollarSign className="mr-2 h-4 w-4" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Complete Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
