"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Check, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { performTwoWaySync } from "@/lib/neon-sync"
import {db} from "@/lib/db-utils"
import { useToast } from "@/components/ui/use-toast"

export function SyncManager() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [unsyncedCount, setUnsyncedCount] = useState(0)
  const { toast } = useToast()

  // Check for unsynced items
  const checkUnsyncedItems = async () => {
    try {
      const count = await db.suppliers.filter((supplier) => !supplier.synced).count()
      setUnsyncedCount(count)
    } catch (error) {
      console.error("Error checking unsynced items:", error)
    }
  }

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Get last sync time from localStorage
    const storedLastSync = localStorage.getItem("lastSyncTime")
    if (storedLastSync) {
      setLastSyncTime(storedLastSync)
    }

    // Check for unsynced items on mount
    checkUnsyncedItems()

    // Set up interval to check for unsynced items
    const interval = setInterval(checkUnsyncedItems, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && unsyncedCount > 0) {
      handleSync()
    }
  }, [isOnline])

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to sync data.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      const result = await performTwoWaySync()

      const now = new Date().toISOString()
      setLastSyncTime(now)
      localStorage.setItem("lastSyncTime", now)

      // Refresh unsynced count
      await checkUnsyncedItems()

      toast({
        title: "Sync completed",
        description: `Uploaded: ${result.uploaded}, Downloaded: ${result.downloaded}, Failed: ${result.failed}`,
        variant: result.failed > 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Sync error:", error)
      toast({
        title: "Sync failed",
        description: "There was an error syncing your data.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Synchronization</CardTitle>
            <CardDescription>Sync your local data with the cloud database</CardDescription>
          </div>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" /> Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" /> Offline
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Last synced:</span>
            <span className="text-sm font-medium">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Unsynced items:</span>
            <Badge variant={unsyncedCount > 0 ? "outline" : "secondary"}>{unsyncedCount}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={isSyncing || !isOnline} className="w-full">
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...
            </>
          ) : unsyncedCount > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" /> Sync Now ({unsyncedCount})
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" /> Sync Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

