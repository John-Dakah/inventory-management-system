// Enhanced sync-service.ts with better error handling and logging
import { getPendingSyncItems, markAsSynced } from "./db"
import { addSyncHistoryEntry } from "./sync-history"

// Configuration
const SYNC_INTERVAL = 60000 // 1 minute
const SYNC_ENDPOINT = "/api/sync"
let syncInProgress = false
let syncInterval: NodeJS.Timeout | null = null
let lastSyncResult: {
  success: boolean
  synced: number
  failed: number
  message?: string
  timestamp: Date
} | null = null

// Sync listeners for UI updates
type SyncListener = () => void
const syncListeners: SyncListener[] = []

/**
 * Start the sync service
 */
export function startSyncService() {
  if (syncInterval) {
    clearInterval(syncInterval)
  }

  // Perform initial sync if online
  if (navigator.onLine) {
    performSync()
  }

  // Set up interval for regular syncing
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      performSync()
    }
  }, SYNC_INTERVAL)

  // Set up online event listener to sync when connection is restored
  window.addEventListener("online", () => {
    console.log("Connection restored. Triggering sync...")
    performSync()
    notifySyncListeners()
  })

  // Set up offline event listener to notify listeners
  window.addEventListener("offline", () => {
    console.log("Connection lost. Sync paused.")
    notifySyncListeners()
  })

  console.log("Sync service started")

  return () => {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
    window.removeEventListener("online", performSync)
    console.log("Sync service stopped")
  }
}

/**
 * Perform a sync operation
 */
export async function performSync(): Promise<{
  success: boolean
  synced: number
  failed: number
  message?: string
}> {
  // Prevent multiple syncs from running simultaneously
  if (syncInProgress) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      message: "Sync already in progress",
    }
  }

  syncInProgress = true
  notifySyncListeners()

  const startTime = Date.now()
  const syncDetails = []

  try {
    // Check for network connectivity
    if (!navigator.onLine) {
      syncInProgress = false
      notifySyncListeners()
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: "No internet connection",
      }
    }

    // Get pending sync items
    const pendingItems = await getPendingSyncItems()

    if (pendingItems.length === 0) {
      syncInProgress = false
      notifySyncListeners()

      // Record empty sync in history
      await addSyncHistoryEntry({
        timestamp: Date.now(),
        success: true,
        itemsSynced: 0,
        itemsFailed: 0,
        duration: Date.now() - startTime,
        message: "No items to sync",
        details: [],
      })

      return {
        success: true,
        synced: 0,
        failed: 0,
        message: "No items to sync",
      }
    }

    console.log(`Syncing ${pendingItems.length} items...`)

    // Send to server
    const response = await fetch(SYNC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pendingItems),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server returned ${response.status}: ${errorText}`)
    }

    const results = await response.json()

    // Process results
    let synced = 0
    let failed = 0

    for (const result of results) {
      // Add to sync details for history
      syncDetails.push({
        type: result.type,
        id: result.entityId,
        operation: pendingItems.find((item: { id: any }) => item.id === result.id)?.operation || "unknown",
        success: result.status === "fulfilled",
        error: result.error,
      })

      if (result.status === "fulfilled") {
        // Mark as synced in local DB
        try {
          await markAsSynced(result.entityId, result.type)
          synced++
        } catch (error) {
          console.error(`Failed to mark ${result.type} ${result.entityId} as synced:`, error)
          failed++
        }
      } else {
        console.error(`Failed to sync ${result.type} ${result.entityId}:`, result.error)
        failed++
      }
    }

    const resultMessage = `Sync completed: ${synced} synced, ${failed} failed`
    console.log(resultMessage)

    // Record sync history
    await addSyncHistoryEntry({
      timestamp: Date.now(),
      success: true,
      itemsSynced: synced,
      itemsFailed: failed,
      duration: Date.now() - startTime,
      message: resultMessage,
      details: syncDetails,
    })

    // Store last sync result
    lastSyncResult = {
      success: true,
      synced,
      failed,
      message: resultMessage,
      timestamp: new Date(),
    }

    syncInProgress = false
    notifySyncListeners()

    return {
      success: true,
      synced,
      failed,
      message: resultMessage,
    }
  } catch (error) {
    console.error("Sync error:", error)

    // Record failed sync in history
    await addSyncHistoryEntry({
      timestamp: Date.now(),
      success: false,
      itemsSynced: 0,
      itemsFailed: 0,
      duration: Date.now() - startTime,
      message: `Sync error: ${error instanceof Error ? error.message : String(error)}`,
      details: syncDetails,
    })

    // Store last sync result
    lastSyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      message: `Sync error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    }

    syncInProgress = false
    notifySyncListeners()

    return {
      success: false,
      synced: 0,
      failed: 0,
      message: `Sync error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Force an immediate sync
 */
export async function forceSync() {
  return performSync()
}

/**
 * Get the sync status
 */
export async function getSyncStatus() {
  const pendingItems = await getPendingSyncItems()
  return {
    pendingCount: pendingItems.length,
    isSyncing: syncInProgress,
    lastSync: lastSyncResult,
    isOnline: navigator.onLine,
  }
}

/**
 * Add a sync listener to update UI when sync status changes
 */
export function addSyncListener(listener: SyncListener) {
  syncListeners.push(listener)
  return () => {
    const index = syncListeners.indexOf(listener)
    if (index !== -1) {
      syncListeners.splice(index, 1)
    }
  }
}

/**
 * Notify all sync listeners
 */
function notifySyncListeners() {
  syncListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error("Error in sync listener:", error)
    }
  })
}
