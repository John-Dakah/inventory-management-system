"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Check, AlertTriangle, WifiOff } from "lucide-react"
import { startSyncService, forceSync, getSyncStatus, addSyncListener } from "@/lib/sync-service"

export default function SyncStatus() {
  const [status, setStatus] = useState<{
    pendingCount: number
    isSyncing: boolean
    isOnline: boolean
    lastSync?: Date
    lastMessage?: string
    lastSyncSuccess?: boolean
  }>({
    pendingCount: 0,
    isSyncing: false,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  })

  useEffect(() => {
    // Start the sync service
    const stopSync = startSyncService()

    // Update status every 5 seconds
    const statusInterval = setInterval(updateStatus, 5000)

    // Add online/offline event listeners
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }))
      // Try to sync when we come back online
      forceSync()
    }

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Add sync listener
    const removeSyncListener = addSyncListener(updateStatus)

    // Initial status update
    updateStatus()

    return () => {
      stopSync()
      clearInterval(statusInterval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      removeSyncListener()
    }
  }, [])

  async function updateStatus() {
    try {
      const syncStatus = await getSyncStatus()
      setStatus((prev) => ({
        ...prev,
        pendingCount: syncStatus.pendingCount,
        isSyncing: syncStatus.isSyncing,
        isOnline: navigator.onLine,
      }))
    } catch (error) {
      console.error("Error updating sync status:", error)
    }
  }

  async function handleForceSync() {
    setStatus((prev) => ({ ...prev, isSyncing: true }))

    try {
      const result = await forceSync()

      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        lastMessage: result.message,
        lastSyncSuccess: result.success,
      }))

      // Update the pending count
      updateStatus()
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        lastMessage: error instanceof Error ? error.message : String(error),
        lastSyncSuccess: false,
      }))
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Database Sync</h3>
        <div className="flex items-center gap-2">
          {!status.isOnline && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
          <Badge
            variant={status.pendingCount > 0 ? "outline" : "secondary"}
            className={status.pendingCount > 0 ? "bg-amber-100 text-amber-800" : ""}
          >
            {status.pendingCount} pending
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleForceSync} disabled={status.isSyncing || !status.isOnline}>
          {status.isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>

        {status.lastSync && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {status.lastSyncSuccess ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            )}
            Last: {status.lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      {status.lastMessage && (
        <p className={`text-xs ${status.lastSyncSuccess ? "text-muted-foreground" : "text-red-500"}`}>
          {status.lastMessage}
        </p>
      )}
    </div>
  )
}
