"use client"

import { useState, useEffect } from "react"
import { WifiIcon, WifiOffIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1">
      {isOnline ? (
        <>
          <WifiIcon className="h-3 w-3" />
          <span className="text-xs">Online</span>
        </>
      ) : (
        <>
          <WifiOffIcon className="h-3 w-3" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  )
}
