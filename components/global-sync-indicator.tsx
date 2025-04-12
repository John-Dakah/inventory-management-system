"use client"

import { useEffect, useState } from "react"
import { RefreshCw, WifiOff, AlertCircle } from "lucide-react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { getPendingSupplierCount } from "@/lib/supplier-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function GlobalSyncIndicator() {
  const isOnline = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkPendingChanges = async () => {
      const count = await getPendingSupplierCount()
      setPendingCount(count)
      setIsVisible(count > 0 || isSyncing || !!syncError)
    }

    checkPendingChanges()

    // Check for pending changes every 15 seconds
    const interval = setInterval(checkPendingChanges, 15000)

    return () => clearInterval(interval)
  }, [isSyncing, syncError])

  // Listen for sync events
  useEffect(() => {
    const handleSyncStart = () => {
      setIsSyncing(true)
      setSyncError(null)
      setIsVisible(true)
    }

    const handleSyncEnd = (event: Event) => {
      const customEvent = event as CustomEvent
      setIsSyncing(false)

      // Check if there was an error
      if (customEvent.detail?.error) {
        setSyncError(customEvent.detail.error)
      } else {
        setSyncError(null)
      }

      // Check pending count again
      getPendingSupplierCount().then((count) => {
        setPendingCount(count)
        setIsVisible(count > 0 || !!customEvent.detail?.error)
      })
    }

    const handleSyncError = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.error) {
        setSyncError(customEvent.detail.error)
        setIsVisible(true)
      }
    }

    window.addEventListener("sync-start", handleSyncStart)
    window.addEventListener("sync-end", handleSyncEnd)
    window.addEventListener("sync-error", handleSyncError)

    return () => {
      window.removeEventListener("sync-start", handleSyncStart)
      window.removeEventListener("sync-end", handleSyncEnd)
      window.removeEventListener("sync-error", handleSyncError)
    }
  }, [])

  // Also show when network status changes
  useEffect(() => {
    if (!isOnline && pendingCount > 0) {
      setIsVisible(true)
    }
  }, [isOnline, pendingCount])

  if (!isVisible) {
    return null
  }

  let bgColor = "bg-primary"
  let icon = <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
  let message = ""

  if (!isOnline) {
    bgColor = "bg-amber-500"
    icon = <WifiOff className="h-4 w-4" />
    message = "Offline - Changes saved locally"
  } else if (syncError) {
    bgColor = "bg-red-500"
    icon = <AlertCircle className="h-4 w-4" />
    message = "Sync error"
  } else if (isSyncing) {
    message = "Syncing..."
  } else {
    message = `${pendingCount} pending change${pendingCount === 1 ? "" : "s"}`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 rounded-full ${bgColor} px-3 py-2 text-sm text-white shadow-lg`}>
              {icon}
              <span>{message}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            {!isOnline ? (
              <p>You're currently offline. Changes are saved locally and will sync when you're back online.</p>
            ) : syncError ? (
              <p>Error: {syncError}</p>
            ) : isSyncing ? (
              <p>Syncing your changes with the server...</p>
            ) : (
              <p>
                You have {pendingCount} change{pendingCount === 1 ? "" : "s"} waiting to be synced.
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

