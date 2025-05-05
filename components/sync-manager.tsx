"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2Icon, CloudIcon as CloudSyncIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { getPendingTransactions, forceSyncAllData } from "@/lib/db"

export function SyncManager() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial online state
    setIsOnline(navigator.onLine)

    // Add event listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for pending transactions
    const checkPending = async () => {
      try {
        const pending = await getPendingTransactions()
        setPendingCount(pending.length)
      } catch (error) {
        console.error("Error checking pending transactions:", error)
      }
    }

    // Get last synced time from localStorage
    const storedLastSynced = localStorage.getItem("lastSynced")
    if (storedLastSynced) {
      setLastSynced(storedLastSynced)
    }

    // Check pending transactions on load and every minute
    checkPending()
    const interval = setInterval(checkPending, 60000)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline) return

    setIsSyncing(true)
    try {
      const result = await forceSyncAllData()

      if (result.success) {
        // Update last synced time
        const now = new Date().toISOString()
        localStorage.setItem("lastSynced", now)
        setLastSynced(now)

        // Refresh pending count
        const pending = await getPendingTransactions()
        setPendingCount(pending.length)
      }
    } catch (error) {
      console.error("Error syncing data:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Don't show if there are no pending transactions and we're online
  if (pendingCount === 0 && isOnline) {
    return null
  }

  return (
    <Card className={!isOnline ? "border-amber-300" : pendingCount > 0 ? "border-blue-300" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Data Synchronization</CardTitle>
          <Badge variant={isOnline ? "outline" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
        </div>
        <CardDescription>
          {!isOnline
            ? "You're working offline. Changes will sync when you reconnect."
            : pendingCount > 0
              ? `${pendingCount} pending changes need to be synchronized.`
              : "All data is synchronized."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Last synced:</span>
          <span>{lastSynced ? new Date(lastSynced).toLocaleString() : "Never"}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
          className="w-full"
          variant={pendingCount > 0 ? "default" : "outline"}
        >
          {isSyncing ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : !isOnline ? (
            <>
              <AlertCircleIcon className="mr-2 h-4 w-4" />
              Waiting for connection
            </>
          ) : pendingCount > 0 ? (
            <>
              <CloudSyncIcon className="mr-2 h-4 w-4" />
              Sync now ({pendingCount})
            </>
          ) : (
            <>
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Fully synced
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
