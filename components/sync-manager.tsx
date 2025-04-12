"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Check, AlertCircle, WifiOff, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { syncPendingSuppliers, getPendingSupplierCount } from "@/lib/supplier-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SyncManager() {
  const isOnline = useNetworkStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [syncResults, setSyncResults] = useState<{
    synced: number
    failed: number
    errors: string[]
  } | null>(null)

  // Load pending count on mount and when network status changes
  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await getPendingSupplierCount()
      setPendingCount(count)

      // Auto-open if there are pending items and we just came online
      if (count > 0 && isOnline) {
        setIsOpen(true)
      }
    }

    loadPendingCount()

    // Get last synced time from localStorage
    const lastSyncedTime = localStorage.getItem("lastSynced")
    if (lastSyncedTime) {
      setLastSynced(new Date(lastSyncedTime))
    }

    // Set up interval to check pending count
    const interval = setInterval(loadPendingCount, 10000)
    return () => clearInterval(interval)
  }, [isOnline])

  // Listen for sync events
  useEffect(() => {
    const handleSyncStart = () => {
      setIsSyncing(true)
      setSyncResults(null)
    }

    const handleSyncEnd = (event: Event) => {
      const customEvent = event as CustomEvent
      setIsSyncing(false)

      // Update pending count
      getPendingSupplierCount().then(setPendingCount)

      // Update last synced time if there was a successful sync
      if (customEvent.detail?.summary?.synced > 0) {
        const now = new Date()
        setLastSynced(now)
        localStorage.setItem("lastSynced", now.toISOString())

        // Set sync results for display
        setSyncResults({
          synced: customEvent.detail.summary.synced,
          failed: customEvent.detail.summary.failed,
          errors: customEvent.detail.summary.errors || [],
        })
      }
    }

    // Listen for open-sync-manager event
    const handleOpenSyncManager = () => {
      setIsOpen(true)
    }

    window.addEventListener("sync-start", handleSyncStart)
    window.addEventListener("sync-end", handleSyncEnd)
    window.addEventListener("open-sync-manager", handleOpenSyncManager)

    return () => {
      window.removeEventListener("sync-start", handleSyncStart)
      window.removeEventListener("sync-end", handleSyncEnd)
      window.removeEventListener("open-sync-manager", handleOpenSyncManager)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline || isSyncing || pendingCount === 0) return

    setIsSyncing(true)
    setProgress(0)
    setSyncResults(null)

    try {
      const result = await syncPendingSuppliers((current, total, success, message) => {
        const percentage = Math.round((current / total) * 100)
        setProgress(percentage)

        // Show toast for individual sync failures
        if (!success && message) {
          toast({
            variant: "destructive",
            title: "Sync Error",
            description: message,
          })
        }
      })

      // Update last synced time
      const now = new Date()
      setLastSynced(now)
      localStorage.setItem("lastSynced", now.toISOString())

      // Update pending count
      const count = await getPendingSupplierCount()
      setPendingCount(count)

      // Set sync results
      setSyncResults({
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
      })

      // Show appropriate toast based on results
      if (result.success) {
        toast({
          title: "Sync Completed",
          description: `Successfully synced ${result.synced} item${result.synced !== 1 ? "s" : ""} with the database.`,
        })
      } else if (result.synced > 0 && result.failed > 0) {
        toast({
          variant: "destructive",
          title: "Partial Sync",
          description: `Synced ${result.synced} item${result.synced !== 1 ? "s" : ""}, but ${result.failed} failed to sync with the database.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: "Failed to sync with the database. Please try again when your connection improves.",
        })
      }

      // Auto-close if everything synced successfully
      if (result.success && result.failed === 0) {
        setTimeout(() => {
          setIsOpen(false)
        }, 3000)
      }
    } catch (error: any) {
      console.error("Sync error:", error)

      // Show a user-friendly error message
      let errorMessage = "There was an error syncing with the database. Please try again."

      if (error.message.includes("timed out")) {
        errorMessage = "The connection to the database timed out. Please check your internet connection and try again."
      } else if (error.message.includes("connect")) {
        errorMessage = "Unable to connect to the database. Please check your internet connection."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: errorMessage,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOpen && pendingCount === 0 && !isSyncing && !syncResults) {
    return null
  }

  return (
    <Card className={isOpen ? "block" : "hidden"}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {isSyncing ? (
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            ) : isOnline ? (
              pendingCount > 0 ? (
                <Database className="h-5 w-5 text-amber-500" />
              ) : (
                <Check className="h-5 w-5 text-green-500" />
              )
            ) : (
              <WifiOff className="h-5 w-5 text-amber-500" />
            )}
            Database Sync Status
          </CardTitle>
          <CardDescription>
            {isSyncing
              ? "Syncing your data with the database..."
              : !isOnline
                ? "You're currently offline. Changes will be synced when you're back online."
                : pendingCount > 0
                  ? `You have ${pendingCount} change${pendingCount === 1 ? "" : "s"} waiting to be synced to the database`
                  : "All your data is synced with the database"}
          </CardDescription>
        </div>
        {!isSyncing && (
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isSyncing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2 w-full" />
            <p className="text-xs text-muted-foreground text-right">{progress}% complete</p>
          </div>
        )}

        {!isSyncing && syncResults && (
          <div className="space-y-4 mt-2">
            {syncResults.synced > 0 && (
              <Alert variant="success" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Sync Successful</AlertTitle>
                <AlertDescription>
                  {syncResults.synced} item{syncResults.synced !== 1 ? "s" : ""} successfully synced with the database.
                </AlertDescription>
              </Alert>
            )}

            {syncResults.failed > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Connection Issues</AlertTitle>
                <AlertDescription>
                  {syncResults.failed} item{syncResults.failed !== 1 ? "s" : ""} failed to sync with the database.
                  {syncResults.errors.length > 0 && (
                    <ul className="mt-2 text-sm list-disc pl-5">
                      {syncResults.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {syncResults.errors.length > 3 && <li>...and {syncResults.errors.length - 3} more errors</li>}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!isSyncing && pendingCount > 0 && (
          <div className="text-sm">
            {isOnline ? (
              <p>
                You can sync your changes now or they will be automatically synced in the background when you make new
                changes.
              </p>
            ) : (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 mt-2">
                <WifiOff className="h-4 w-4 text-amber-500" />
                <AlertTitle>You're Offline</AlertTitle>
                <AlertDescription>
                  Your changes are saved locally and will be synced automatically when you're back online.
                </AlertDescription>
              </Alert>
            )}
            {lastSynced && (
              <p className="mt-2 text-xs text-muted-foreground">Last synced: {lastSynced.toLocaleString()}</p>
            )}
          </div>
        )}
      </CardContent>
      {!isSyncing && pendingCount > 0 && isOnline && (
        <CardFooter>
          <Button onClick={handleSync} disabled={!isOnline || isSyncing} className="w-full">
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Sync to Database Now ({pendingCount} item{pendingCount !== 1 ? "s" : ""})
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

