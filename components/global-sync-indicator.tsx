"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CloudIcon as CloudSync, Check, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { motion } from "framer-motion"
import { getPendingSyncItems, processSyncQueue } from "@/lib/sync-manager"

export function GlobalSyncIndicator() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Check for pending sync items
  useEffect(() => {
    const checkPendingItems = async () => {
      try {
        const items = await getPendingSyncItems()
        setPendingCount(items.length)
      } catch (error) {
        console.error("Error checking pending items:", error)
      }
    }

    // Check on mount
    checkPendingItems()

    // Set up interval to check periodically
    const interval = setInterval(checkPendingItems, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const syncNow = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    setSyncStatus("syncing")

    try {
      // Process sync queue
      const success = await processSyncQueue()

      if (success) {
        // Update last synced time
        setLastSynced(new Date())
        setPendingCount(0)
        setSyncStatus("success")
      } else {
        setSyncStatus("error")
      }
    } catch (error) {
      console.error("Error syncing data:", error)
      setSyncStatus("error")
    } finally {
      setIsSyncing(false)

      // Reset status after a delay
      setTimeout(() => {
        if (syncStatus !== "error") {
          setSyncStatus("idle")
        }
      }, 3000)
    }
  }

  if (pendingCount === 0 && syncStatus === "idle") {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md border">
        {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-orange-500" />}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 px-4 rounded-full shadow-md border"
    >
      {syncStatus === "syncing" ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : syncStatus === "success" ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : syncStatus === "error" ? (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      ) : (
        <CloudSync className="h-4 w-4 text-primary" />
      )}

      <div className="text-xs">
        {syncStatus === "syncing" ? (
          <span>Syncing...</span>
        ) : syncStatus === "success" ? (
          <span>Sync complete</span>
        ) : syncStatus === "error" ? (
          <span>Sync failed</span>
        ) : (
          <span>
            {pendingCount} {pendingCount === 1 ? "change" : "changes"} pending
          </span>
        )}
      </div>

      {!isSyncing && syncStatus !== "success" && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={syncNow}
          disabled={!isOnline || isSyncing}
        >
          Sync
        </Button>
      )}
    </motion.div>
  )
}

