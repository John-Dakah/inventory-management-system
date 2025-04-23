"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { BrowserMultiFormatReader, type Result, BarcodeFormat, type Exception } from "@zxing/library"

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onDetected: (barcode: string) => void
}

export function BarcodeScanner({ isOpen, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !videoRef.current) return

    const codeReader = new BrowserMultiFormatReader()

    // Set hints to improve performance
    const hints = new Map()
    hints.set(2, [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE])

    let isActive = true

    // Start video stream
    codeReader.decodeFromVideoDevice(
      undefined, // Use default camera
      videoRef.current,
      (result: Result | null, error: Exception | undefined) => {
        if (!isActive) return

        if (result) {
          const barcode = result.getText()
          onDetected(barcode)
          onClose()
        }

        if (error && !(error instanceof TypeError)) {
          // Ignore TypeError as it's often just a frame without a barcode
          console.error("Barcode scanning error:", error)
        }
      },
    )

    return () => {
      isActive = false
      codeReader.reset()
    }
  }, [isOpen, onDetected, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-video bg-black rounded-md overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/50"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/50"></div>
            </div>
          </div>

          {error && <p className="text-destructive mt-2">{error}</p>}

          <p className="text-sm text-muted-foreground mt-4">Position the barcode within the frame to scan</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
