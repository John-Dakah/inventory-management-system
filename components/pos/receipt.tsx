"use client"

import { forwardRef, useRef } from "react"
import type { Transaction } from "@/lib/db"
import { businessInfo } from "@/lib/pos-config"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ReceiptProps {
  transaction: Transaction
  onPrint: () => void
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction, onPrint }, ref) => {
  return (
    <div ref={ref} className="bg-white p-4 max-w-md mx-auto text-black font-mono text-sm">
      {/* Business Header */}
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg">{businessInfo.name}</h2>
        <p>{businessInfo.address}</p>
        <p>{businessInfo.phone}</p>
        <p>{businessInfo.email}</p>
        <p>{businessInfo.website}</p>
        <p>Tax ID: {businessInfo.taxId}</p>
      </div>

      {/* Receipt Info */}
      <div className="border-t border-b border-black py-2 mb-4">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(new Date(transaction.createdAt))}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{transaction.cashierName}</span>
        </div>
        {transaction.customerName && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{transaction.customerName}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex font-bold border-b border-black pb-1">
          <div className="w-1/2">Item</div>
          <div className="w-1/6 text-right">Qty</div>
          <div className="w-1/6 text-right">Price</div>
          <div className="w-1/6 text-right">Total</div>
        </div>
        {transaction.items.map((item) => (
          <div key={item.id} className="flex py-1 text-xs">
            <div className="w-1/2">{item.name}</div>
            <div className="w-1/6 text-right">{item.quantity}</div>
            <div className="w-1/6 text-right">{formatCurrency(item.price)}</div>
            <div className="w-1/6 text-right">{formatCurrency(item.subtotal)}</div>
          </div>
        ))}
        {transaction.items.some((item) => item.discount > 0) && (
          <div className="border-t border-dashed border-gray-400 mt-1 pt-1">
            {transaction.items
              .filter((item) => item.discount > 0)
              .map((item) => (
                <div key={`disc-${item.id}`} className="flex text-xs">
                  <div className="w-1/2">Discount: {item.name}</div>
                  <div className="w-1/6"></div>
                  <div className="w-1/6"></div>
                  <div className="w-1/6 text-right">-{formatCurrency(item.discount)}</div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-black pt-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>
        {transaction.discountTotal > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(transaction.discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(transaction.taxTotal)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4">
        <div className="font-bold">Payment Information</div>
        {transaction.payments.map((payment, index) => (
          <div key={index} className="flex justify-between">
            <span>{payment.method}:</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
        ))}
        {transaction.change > 0 && (
          <div className="flex justify-between">
            <span>Change:</span>
            <span>{formatCurrency(transaction.change)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center border-t border-black pt-2">
        <p>{businessInfo.receiptFooter}</p>
        <p className="text-xs mt-2">Thank you for your purchase!</p>
      </div>

      {/* Print button - only visible on screen, not when printing */}
      <div className="print:hidden mt-4">
        <Button onClick={onPrint} className="w-full">
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  )
})

Receipt.displayName = "Receipt"

export function PrintableReceipt({ transaction }: { transaction: Transaction }) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  return <Receipt ref={receiptRef} transaction={transaction} onPrint={handlePrint} />
}
