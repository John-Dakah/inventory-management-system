"use client"

import type React from "react"

import { useState } from "react"
import { Loader2Icon, CheckCircleIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorHandler } from "@/components/error-handler"
import { processPayment } from "@/lib/process-payment"
import { useRouter } from "next/navigation"

export default function ProcessPaymentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [errorDetails, setErrorDetails] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string | undefined>()
  const [reference, setReference] = useState<string | undefined>()

  // Form state
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [customerId, setCustomerId] = useState("")
  const [notes, setNotes] = useState("")

  // Sample cart data - in a real app, this would come from your cart state
  const sampleCart = [
    { productId: "clqqwn4m50000upj0hmq0s59z", name: "Sample Product 1", price: 19.99, quantity: 2 },
    { productId: "clqqwn4m50001upj0zpn9pv8q", name: "Sample Product 2", price: 29.99, quantity: 1 },
  ]

  const subtotal = sampleCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = 0.0825 // 8.25% tax
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(undefined)
    setErrorDetails(undefined)
    setSuccess(false)

    const result = await processPayment({
      items: sampleCart,
      subtotal,
      tax,
      total,
      paymentMethod,
      customerId: customerId || undefined,
      notes: notes || undefined,
    })

    if (result.success) {
      setSuccess(true)
      setTransactionId(result.transactionId)
      setReference(result.reference)
    } else {
      setError(result.error)
      setErrorDetails(result.details)
    }

    setIsSubmitting(false)
  }

  const handleReset = () => {
    setPaymentMethod("cash")
    setCustomerId("")
    setNotes("")
    setError(undefined)
    setErrorDetails(undefined)
    setSuccess(false)
    setTransactionId(undefined)
    setReference(undefined)
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Process Payment</h1>

      <ErrorHandler
        error={error}
        details={errorDetails}
        onClose={() => {
          setError(undefined)
          setErrorDetails(undefined)
        }}
      />

      {success ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center">Payment Successful</CardTitle>
            <CardDescription className="text-center">Your transaction has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Transaction ID:</div>
                <div>{transactionId}</div>
                <div className="font-medium">Reference:</div>
                <div>{reference}</div>
                <div className="font-medium">Amount:</div>
                <div>${total.toFixed(2)}</div>
                <div className="font-medium">Payment Method:</div>
                <div>{paymentMethod}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => router.push("/transactions")}>
              View Transactions
            </Button>
            <Button variant="outline" className="w-full" onClick={handleReset}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Process Another Payment
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Process a new payment transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-id">Customer ID (Optional)</Label>
                <Input
                  id="customer-id"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter customer ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this transaction"
                  rows={3}
                />
              </div>

              <div className="rounded-md border p-4 mt-4">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="space-y-1">
                  {sampleCart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8.25%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-1">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Payment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}
