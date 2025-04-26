"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Check, AlertTriangle, WifiOff, Info } from "lucide-react"
import { startSyncService, forceSync, getSyncStatus, addSyncListener } from "@/lib/sync-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SyncManager() {
  const [status, setStatus] = useState({
    pendingCount: 0,
    isSyncing: false,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSync: undefined as Date | undefined,
    lastMessage: undefined as string | undefined,
    lastSyncSuccess: undefined as boolean | undefined,
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
      forceSync().catch((err) => console.error("Error syncing after coming online:", err))
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
        lastSync: syncStatus.lastSync?.timestamp,
        lastMessage: syncStatus.lastSync?.message,
        lastSyncSuccess: syncStatus.lastSync?.success,
      }))
    } catch (error) {
      console.error("Error updating sync status:", error)
    }
  }

  async function handleForceSync() {
    if (!status.isOnline) {
      alert("Cannot sync while offline. Please check your internet connection.")
      return
    }

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={status.pendingCount > 0 ? "outline" : "secondary"}
                  className={status.pendingCount > 0 ? "bg-amber-100 text-amber-800 cursor-help" : "cursor-help"}
                >
                  {status.pendingCount} pending
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Changes waiting to be synchronized with the server database</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceSync}
          disabled={status.isSyncing || !status.isOnline}
          className="relative"
        >
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
            Last: {new Date(status.lastSync).toLocaleTimeString()}
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <Info className="h-3 w-3" />
                <span className="sr-only">Sync Info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Changes are automatically synchronized with the server database when you're online. Click "Sync Now" to
                manually trigger synchronization.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {status.lastMessage && (
        <p className={`text-xs ${status.lastSyncSuccess ? "text-muted-foreground" : "text-red-500"}`}>
          {status.lastMessage}
        </p>
      )}
    </div>
  )
}
