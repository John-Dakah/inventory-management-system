"use client"

import { useEffect, useState } from "react"
import { AlertCircleIcon, XIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorHandlerProps {
  error?: string
  details?: string
  onClose?: () => void
  timeout?: number
}

export function ErrorHandler({ error, details, onClose, timeout = 10000 }: ErrorHandlerProps) {
  const [visible, setVisible] = useState(Boolean(error))

  useEffect(() => {
    setVisible(Boolean(error))

    if (error && timeout > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [error, timeout, onClose])

  if (!visible || !error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>{error}</AlertTitle>
      {details && <AlertDescription>{details}</AlertDescription>}
      {onClose && (
        <button
          onClick={() => {
            setVisible(false)
            onClose()
          }}
          className="absolute top-2 right-2 p-1"
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}
