import { getPendingSyncItems, markAsSynced, markSyncError } from "@/lib/db"

// Function to sync data from IndexedDB to PostgreSQL
export async function syncToServer() {
  try {
    // Get all pending items from the sync queue
    const pendingItems = await getPendingSyncItems()

    if (pendingItems.length === 0) {
      return { success: true, message: "No items to sync", synced: 0 }
    }

    // Track successful and failed syncs
    let successCount = 0
    let failureCount = 0

    // Process each item in the queue
    for (const item of pendingItems) {
      try {
        // Construct the API endpoint based on the item type
        const endpoint = `/api/sync/${item.type}`

        // Send the data to the server
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: item.operation,
            id: item.id,
            data: item.data,
          }),
        })

        if (response.ok) {
          // Mark the item as synced in IndexedDB
          await markAsSynced(item.id)
          successCount++
        } else {
          // Mark the item as having a sync error
          await markSyncError(item.id)
          failureCount++
          console.error(`Failed to sync item ${item.id}: ${response.statusText}`)
        }
      } catch (error) {
        // Mark the item as having a sync error
        await markSyncError(item.id)
        failureCount++
        console.error(`Error syncing item ${item.id}:`, error)
      }
    }

    return {
      success: failureCount === 0,
      message: `Synced ${successCount} items${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
      synced: successCount,
      failed: failureCount,
    }
  } catch (error) {
    console.error("Error during sync process:", error)
    return { success: false, message: "Sync process failed", error: String(error) }
  }
}

// Function to check if we're online
export function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine
}

// Function to set up automatic sync
export function setupAutoSync(interval = 60000) {
  // Initial sync when coming online
  window.addEventListener("online", async () => {
    console.log("Back online, syncing data...")
    await syncToServer()
  })

  // Set up interval for regular syncing
  const intervalId = setInterval(async () => {
    if (isOnline()) {
      await syncToServer()
    }
  }, interval)

  // Return a function to clear the interval
  return () => clearInterval(intervalId)
}

