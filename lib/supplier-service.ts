import {
  getDatabase,
  SUPPLIERS_DB,
  getAllFromStore,
  putToStore,
  deleteFromStore,
  getByIndex,
  countByIndex,
} from "@/lib/db-utils"
import type {Supplier } from "@/types"


export async function getSuppliers(): Promise<Supplier[]> {
  return getAllFromStore<Supplier>(SUPPLIERS_DB.stores.suppliers)
}

export async function getSupplierStats() {
  const total = await countByIndex(SUPPLIERS_DB.stores.suppliers, "status", "")
  const active = await countByIndex(SUPPLIERS_DB.stores.suppliers, "status", "Active")
  const onHold = await countByIndex(SUPPLIERS_DB.stores.suppliers, "status", "On Hold")
  const inactive = await countByIndex(SUPPLIERS_DB.stores.suppliers, "status", "Inactive")
  const newThisMonth = await getNewSuppliersThisMonth()

  return {
    total,
    active,
    newThisMonth,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    onHold,
    inactive,
  }
}
export async function getSupplierNames(): Promise<string[]> {
  const suppliers = await getSuppliers()
  return suppliers.map((s) => s.name)
}

async function getNewSuppliersThisMonth(): Promise<number> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const db = await getDatabase()
  const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readonly")
  const index = tx.store.index("createdAt")
  let count = 0

  let cursor = await index.openCursor(IDBKeyRange.lowerBound(firstDayOfMonth))
  while (cursor) {
    count++
    cursor = await cursor.continue()
  }

  await tx.done
  return count
}

export async function saveSupplier(supplier: Supplier): Promise<string> {
  return putToStore(SUPPLIERS_DB.stores.suppliers, supplier) as unknown as string
}

export async function deleteSupplier(id: string): Promise<void> {
  try {
    // Optimistically delete from IndexedDB
    await deleteFromStore(SUPPLIERS_DB.stores.suppliers, id)

    // If online, delete from server
    if (navigator.onLine) {
      await deleteSupplierFromServer(id)
    }
  } catch (error: any) {
    console.error(`Error deleting supplier ${id}:`, error)
    throw error
  }
}

export async function getPendingSuppliers(): Promise<Supplier[]> {
  return getByIndex<Supplier>(SUPPLIERS_DB.stores.suppliers, "syncStatus", "pending")
}

export async function getPendingSupplierCount(): Promise<number> {
  return countByIndex(SUPPLIERS_DB.stores.suppliers, "syncStatus", "pending")
}

export async function syncSupplier(supplierId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase()
    const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readonly")
    const supplier = await tx.store.get(supplierId)

    if (!supplier) {
      return { success: false, error: "Supplier not found in local database" }
    }

    // Sync the supplier with the server
    const syncedSupplier = await saveSupplierToServer(supplier)

    // Update the supplier's sync status in IndexedDB
    supplier.syncStatus = "synced"
    supplier.syncError = undefined
    await putToStore(SUPPLIERS_DB.stores.suppliers, supplier)

    return { success: true }
  } catch (error: any) {
    console.error(`Error syncing supplier ${supplierId}:`, error)

    // Update the supplier's sync status in IndexedDB
    const db = await getDatabase()
    const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readwrite")
    const supplier = await tx.store.get(supplierId)

    if (supplier) {
      supplier.syncStatus = "error"
      supplier.syncError = error.message || "Sync failed"
      await tx.store.put(supplier)
    }

    return { success: false, error: error.message || "Sync failed" }
  }
}

export async function syncPendingSuppliers(
  progressCallback?: (current: number, total: number, success: boolean, message?: string) => void,
): Promise<{ success: boolean; synced: number; failed: number; errors: string[] }> {
  let synced = 0
  let failed = 0
  const errors: string[] = []

  try {
    const pendingSuppliers = await getPendingSuppliers()
    const total = pendingSuppliers.length

    if (total === 0) {
      return { success: true, synced: 0, failed: 0, errors: [] }
    }

    // Dispatch sync-start event
    window.dispatchEvent(new Event("sync-start"))

    // Group suppliers by operation (create/update/delete)
    const suppliersToSync = pendingSuppliers.map((supplier) => {
      const { syncStatus, syncError, ...data } = supplier
      return data
    })

    // Sync with server
    const response = await fetch("/api/suppliers/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ suppliers: suppliersToSync }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to sync suppliers")
    }

    const data = await response.json()
    const syncResults = data.results

    // Update IndexedDB based on sync results
    for (const supplierId of syncResults.success) {
      const db = await getDatabase()
      const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readwrite")
      const supplier = await tx.store.get(supplierId)

      if (supplier) {
        supplier.syncStatus = "synced"
        supplier.syncError = undefined
        await tx.store.put(supplier)
        synced++
      }

      progressCallback?.(synced + failed, total, true)
    }

    for (const failedSupplier of syncResults.failed) {
      const db = await getDatabase()
      const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readwrite")
      const supplier = await tx.store.get(failedSupplier.id)

      if (supplier) {
        supplier.syncStatus = "error"
        supplier.syncError = failedSupplier.error
        await tx.store.put(supplier)
        errors.push(failedSupplier.error)
        failed++
      }

      progressCallback?.(synced + failed, total, false, failedSupplier.error)
    }

    // Dispatch sync-end event
    window.dispatchEvent(
      new CustomEvent("sync-end", {
        detail: {
          summary: {
            synced,
            failed,
            errors,
          },
        },
      }),
    )

    return { success: true, synced, failed, errors }
  } catch (error: any) {
    console.error("Error syncing pending suppliers:", error)

    // Dispatch sync-error event
    window.dispatchEvent(
      new CustomEvent("sync-error", {
        detail: {
          error: error.message || "Sync failed",
        },
      }),
    )

    return { success: false, synced: 0, failed: 0, errors: [error.message || "Sync failed"] }
  }
}

// Server API calls
async function saveSupplierToServer(supplier: Supplier): Promise<Supplier> {
  try {
    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch("/api/suppliers", {
      method: supplier.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplier),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Provide user-friendly error messages based on status codes
      let userFriendlyMessage = ""
      switch (response.status) {
        case 401:
          userFriendlyMessage = "Your session has expired. Please log in again."
          break
        case 403:
          userFriendlyMessage = "You don't have permission to perform this action."
          break
        case 404:
          userFriendlyMessage = "The supplier information couldn't be found on the server."
          break
        case 500:
          userFriendlyMessage = "The server encountered an error. Our team has been notified."
          break
        default:
          userFriendlyMessage = `The server returned an error (${response.status}). Please try again later.`
      }

      throw new Error(userFriendlyMessage)
    }

    return await response.json()
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        "The connection to the database timed out. Please check your internet connection and try again later.",
      )
    }

    // Customize network errors for better user understanding
    if (error.message.includes("fetch")) {
      throw new Error("Unable to connect to the database. Please check your internet connection.")
    }

    console.error("Error saving supplier to server:", error)
    throw error
  }
}

async function deleteSupplierFromServer(id: string): Promise<void> {
  try {
    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`/api/suppliers/${id}`, {
      method: "DELETE",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Provide user-friendly error messages based on status codes
      let userFriendlyMessage = ""
      switch (response.status) {
        case 401:
          userFriendlyMessage = "Your session has expired. Please log in again."
          break
        case 403:
          userFriendlyMessage = "You don't have permission to delete this supplier."
          break
        case 404:
          userFriendlyMessage = "This supplier has already been deleted or doesn't exist on the server."
          break
        case 500:
          userFriendlyMessage = "The server encountered an error while deleting. Our team has been notified."
          break
        default:
          userFriendlyMessage = `The server returned an error (${response.status}). Please try again later.`
      }

      throw new Error(userFriendlyMessage)
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        "The connection to the database timed out. Please check your internet connection and try again later.",
      )
    }

    // Customize network errors for better user understanding
    if (error.message.includes("fetch")) {
      throw new Error("Unable to connect to the database. Please check your internet connection.")
    }

    console.error(`Error deleting supplier ${id} from server:`, error)
    throw error
  }
}

