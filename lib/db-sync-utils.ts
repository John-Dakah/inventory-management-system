import { getDB } from "./check-storage-quota"

/**
 * Utility function to add a record to the sync queue
 */
export async function addToSyncQueue(
  operation: "create" | "update" | "delete",
  type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user",
  id: string,
  data?: any,
) {
  const db = await getDB()
  const now = Date.now()

  await db.put("syncQueue", {
    id: `${type}-${id}-${now}`,
    operation,
    type,
    data,
    timestamp: now,
  })
}

/**
 * Utility function to check if a record has pending sync operations
 */
export async function hasPendingSyncOperations(
  type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user",
  id: string,
): Promise<boolean> {
  const db = await getDB()
  const tx = db.transaction("syncQueue", "readonly")
  const store = tx.objectStore("syncQueue")

  // Use a cursor to find any sync operations for this entity
  let cursor = await store.openCursor()

  while (cursor) {
    const syncItem = cursor.value

    // Check if this sync item is for the specified entity
    if (syncItem.type === type && (syncItem.data?.id === id || syncItem.id.includes(`${type}-${id}-`))) {
      return true
    }

    cursor = await cursor.continue()
  }

  return false
}

/**
 * Utility function to get all pending sync operations for a specific entity
 */
export async function getPendingSyncOperationsForEntity(
  type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user",
  id: string,
) {
  const db = await getDB()
  const tx = db.transaction("syncQueue", "readonly")
  const store = tx.objectStore("syncQueue")

  const result = []
  let cursor = await store.openCursor()

  while (cursor) {
    const syncItem = cursor.value

    if (syncItem.type === type && (syncItem.data?.id === id || syncItem.id.includes(`${type}-${id}-`))) {
      result.push(syncItem)
    }

    cursor = await cursor.continue()
  }

  return result
}

/**
 * Utility function to clear all sync operations for a specific entity
 */
export async function clearSyncOperationsForEntity(
  type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user",
  id: string,
) {
  const operations = await getPendingSyncOperationsForEntity(type, id)

  if (operations.length === 0) {
    return
  }

  const db = await getDB()
  const tx = db.transaction("syncQueue", "readwrite")
  const store = tx.objectStore("syncQueue")

  for (const op of operations) {
    await store.delete(op.id)
  }

  await tx.done
}
