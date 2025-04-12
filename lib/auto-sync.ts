import { getPendingSuppliers, syncPendingSuppliers } from "@/lib/supplier-service"

// Auto-sync service
let syncInProgress = false
let syncTimeout: NodeJS.Timeout | null = null

// Function to start auto-sync
export function startAutoSync() {
  if (typeof window === "undefined") return

  // Clear any existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Set up auto-sync
  const attemptSync = async () => {
    // Skip if already syncing or offline
    if (syncInProgress || !navigator.onLine) {
      scheduleNextSync()
      return
    }

    try {
      syncInProgress = true

      // Check if there are pending suppliers
      const pendingSuppliers = await getPendingSuppliers()

      if (pendingSuppliers.length > 0) {
        console.log(`Auto-sync: Found ${pendingSuppliers.length} pending suppliers`)

        // Attempt to sync
        await syncPendingSuppliers()
      }
    } catch (error) {
      console.error("Auto-sync error:", error)
    } finally {
      syncInProgress = false
      scheduleNextSync()
    }
  }

  // Schedule next sync attempt
  const scheduleNextSync = () => {
    // Random delay between 30-60 seconds to avoid thundering herd
    const delay = 30000 + Math.floor(Math.random() * 30000)
    syncTimeout = setTimeout(attemptSync, delay)
  }

  // Start the sync cycle
  scheduleNextSync()

  // Also sync when coming back online
  window.addEventListener("online", () => {
    console.log("Network is back online, attempting sync")
    // Wait a moment for the connection to stabilize
    setTimeout(attemptSync, 3000)
  })

  return () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }
    window.removeEventListener("online", attemptSync)
  }
}

