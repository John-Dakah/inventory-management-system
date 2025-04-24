"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/db"
import { Receipt } from "@/components/pos/receipt"
import { Printer, Download, Share2 } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface ReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function ReceiptDialog({ isOpen, onClose, transaction }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${transaction?.receiptNumber || ""}`,
    onAfterPrint: () => {
      // Optional: Do something after printing
    },
  })

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt #{transaction.receiptNumber}</DialogTitle>
        </DialogHeader>

        <Receipt ref={receiptRef} transaction={transaction} onPrint={handlePrint} />

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="sm:flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="sm:flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
