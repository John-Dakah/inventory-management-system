"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CloudIcon as CloudSync, Check, AlertTriangle } from "lucide-react"
import { getPendingSyncItems, processSyncQueue } from "@/lib/sync-manager"

export function SyncManager() {
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
  const checkPendingItems = useCallback(async () => {
    try {
      const items = await getPendingSyncItems()
      setPendingCount(items.length)
    } catch (error) {
      console.error("Error checking pending items:", error)
    }
  }, [])

  useEffect(() => {
    // Check on mount
    checkPendingItems()

    // Set up interval to check periodically
    const interval = setInterval(checkPendingItems, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [checkPendingItems])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncData()
    }
  }, [isOnline, pendingCount, isSyncing])

  const syncData = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline. Please connect to the internet.",
        variant: "destructive",
      })
      return
    }

    if (isSyncing) return

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

        toast({
          title: "Sync Complete",
          description: "All data has been synchronized with the server.",
        })
      } else {
        setSyncStatus("error")
        toast({
          title: "Sync Failed",
          description: "Failed to synchronize data with the server.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error syncing data:", error)
      setSyncStatus("error")

      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data with the server.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)

      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus("idle")
      }, 3000)
    }
  }

  if (pendingCount === 0 && syncStatus === "idle") {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="mb-4"
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncStatus === "syncing" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : syncStatus === "success" ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : syncStatus === "error" ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CloudSync className="h-5 w-5 text-primary" />
              )}

              <div>
                {syncStatus === "syncing" ? (
                  <p className="text-sm font-medium">Syncing data...</p>
                ) : syncStatus === "success" ? (
                  <p className="text-sm font-medium">Sync complete</p>
                ) : syncStatus === "error" ? (
                  <p className="text-sm font-medium">Sync failed</p>
                ) : (
                  <p className="text-sm font-medium">
                    {pendingCount} {pendingCount === 1 ? "item" : "items"} pending sync
                  </p>
                )}

                {lastSynced && (
                  <p className="text-xs text-muted-foreground">Last synced: {lastSynced.toLocaleTimeString()}</p>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant={syncStatus === "error" ? "destructive" : "outline"}
              onClick={syncData}
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? (
                <>
                  Syncing <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                </>
              ) : (
                "Sync Now"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

