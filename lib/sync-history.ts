// lib/sync-history.ts
import { getDB } from "./check-storage-quota"

export interface SyncHistoryEntry {
  id?: number
  timestamp: number
  success: boolean
  itemsSynced: number
  itemsFailed: number
  duration: number
  message?: string
  details?: {
    type: string
    id: string
    operation: string
    success: boolean
    error?: string
  }[]
}

/**
 * Add a sync history entry
 */
export async function addSyncHistoryEntry(entry: SyncHistoryEntry): Promise<number> {
  try {
    const db = await getDB()

    // Check if auditLog store exists
    if (!db.objectStoreNames.contains("auditLog")) {
      console.error("auditLog store does not exist")
      return -1
    }

    const tx = db.transaction("auditLog", "readwrite")
    const store = tx.objectStore("auditLog")

    // Add the entry
    const id = await store.add({
      ...entry,
      type: "sync",
      timestamp: entry.timestamp || Date.now(),
    })

    await tx.done
    return id as number
  } catch (error) {
    console.error("Error adding sync history entry:", error)
    return -1
  }
}

/**
 * Get sync history entries
 */
export async function getSyncHistory(limit = 50): Promise<SyncHistoryEntry[]> {
  try {
    const db = await getDB()

    // Check if auditLog store exists
    if (!db.objectStoreNames.contains("auditLog")) {
      console.error("auditLog store does not exist")
      return []
    }

    const tx = db.transaction("auditLog", "readonly")
    const store = tx.objectStore("auditLog")

    // Get all entries
    const allEntries = await store.getAll()

    // Filter sync entries and sort by timestamp (newest first)
    const syncEntries = allEntries
      .filter((entry) => entry.type === "sync")
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    await tx.done
    return syncEntries
  } catch (error) {
    console.error("Error getting sync history:", error)
    return []
  }
}

/**
 * Clear sync history
 */
export async function clearSyncHistory(): Promise<void> {
  try {
    const db = await getDB()

    // Check if auditLog store exists
    if (!db.objectStoreNames.contains("auditLog")) {
      console.error("auditLog store does not exist")
      return
    }

    const tx = db.transaction("auditLog", "readwrite")
    const store = tx.objectStore("auditLog")

    // Get all entries
    const allEntries = await store.getAll()

    // Delete sync entries
    for (const entry of allEntries) {
      if (entry.type === "sync") {
        await store.delete(entry.id)
      }
    }

    await tx.done
  } catch (error) {
    console.error("Error clearing sync history:", error)
  }
}
