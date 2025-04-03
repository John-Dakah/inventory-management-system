"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getPendingSyncItems, processSyncQueue } from "@/lib/sync-manager"
import { syncWithPrisma } from "@/lib/prisma-sync"

interface SyncContextType {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSynced: Date | null
  syncStatus: "idle" | "syncing" | "success" | "error"
  syncNow: () => Promise<void>
}

const SyncContext = createContext<SyncContextType | undefined>(undefined)

interface SyncStatusProviderProps {
  children: ReactNode
}

export function SyncStatusProvider({ children }: SyncStatusProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
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

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncNow()
    }
  }, [isOnline, pendingCount])

  const syncNow = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    setSyncStatus("syncing")

    try {
      // Sync with Prisma
      const success = await syncWithPrisma()

      if (success) {
        // Process local sync queue
        await processSyncQueue()

        // Update state
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

  const value = {
    isOnline,
    isSyncing,
    pendingCount,
    lastSynced,
    syncStatus,
    syncNow,
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export function useSyncStatus() {
  const context = useContext(SyncContext)
  if (context === undefined) {
    throw new Error("useSyncStatus must be used within a SyncStatusProvider")
  }
  return context
}

