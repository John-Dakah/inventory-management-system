import {
  getDatabase,
  SUPPLIERS_DB,
  getAllFromStore,
  putToStore,
  deleteFromStore,
  getByIndex,
  countByIndex,
} from "@/lib/db-utils"
import type { Supplier } from "@/types"

export async function getSuppliers(userId: string): Promise<Supplier[]> {
  const all = await getAllFromStore<Supplier>(SUPPLIERS_DB.stores.suppliers)
  return all.filter((s) => s.userId === userId)
}

export async function getSupplierStats(userId: string) {
  const all = await getSuppliers(userId)
  const total = all.length
  const active = all.filter((s) => s.status === "Active").length
  const onHold = all.filter((s) => s.status === "On Hold").length
  const inactive = all.filter((s) => s.status === "Inactive").length
  const newThisMonth = all.filter((s) => {
    const created = new Date(s.createdAt)
    const now = new Date()
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
  }).length

  return {
    total,
    active,
    newThisMonth,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    onHold,
    inactive,
  }
}

export async function getSupplierNames(userId: string): Promise<string[]> {
  const suppliers = await getSuppliers(userId)
  return suppliers.map((s) => s.name)
}

export async function saveSupplier(supplier: Supplier, userId: string): Promise<string> {
  supplier.userId = userId
  return putToStore(SUPPLIERS_DB.stores.suppliers, supplier) as unknown as string
}

export async function deleteSupplier(id: string, userId: string): Promise<void> {
  try {
    const db = await getDatabase()
    const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readwrite")
    const supplier = await tx.store.get(id)
    if (!supplier || supplier.userId !== userId) throw new Error("Unauthorized access")

    await deleteFromStore(SUPPLIERS_DB.stores.suppliers, id)

    if (navigator.onLine) {
      await deleteSupplierFromServer(id)
    }
  } catch (error: any) {
    console.error(`Error deleting supplier ${id}:`, error)
    throw error
  }
}

export async function getPendingSuppliers(userId: string): Promise<Supplier[]> {
  const pending = await getByIndex<Supplier>(SUPPLIERS_DB.stores.suppliers, "syncStatus", "pending")
  return pending.filter((s) => s.userId === userId)
}

export async function getPendingSupplierCount(userId: string): Promise<number> {
  const pending = await getPendingSuppliers(userId)
  return pending.length
}

export async function syncSupplier(supplierId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase()
    const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readonly")
    const supplier = await tx.store.get(supplierId)

    if (!supplier || supplier.userId !== userId) {
      return { success: false, error: "Unauthorized or not found" }
    }

    const syncedSupplier = await saveSupplierToServer(supplier)

    supplier.syncStatus = "synced"
    supplier.syncError = undefined
    await putToStore(SUPPLIERS_DB.stores.suppliers, supplier)

    return { success: true }
  } catch (error: any) {
    console.error(`Error syncing supplier ${supplierId}:`, error)
    const db = await getDatabase()
    const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readwrite")
    const supplier = await tx.store.get(supplierId)

    if (supplier && supplier.userId === userId) {
      supplier.syncStatus = "error"
      supplier.syncError = error.message || "Sync failed"
      await tx.store.put(supplier)
    }

    return { success: false, error: error.message || "Sync failed" }
  }
}

export async function syncPendingSuppliers(
  userId: string,
  progressCallback?: (current: number, total: number, success: boolean, message?: string) => void,
): Promise<{ success: boolean; synced: number; failed: number; errors: string[] }> {
  let synced = 0
  let failed = 0
  const errors: string[] = []

  try {
    const pendingSuppliers = await getPendingSuppliers(userId)
    const total = pendingSuppliers.length

    if (total === 0) {
      return { success: true, synced: 0, failed: 0, errors: [] }
    }

    window.dispatchEvent(new Event("sync-start"))

    const suppliersToSync = pendingSuppliers.map((supplier) => {
      const { syncStatus, syncError, ...data } = supplier
      return data
    })

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

    for (const supplierId of syncResults.success) {
      const db = await getDatabase()
      const tx = db.transaction(SUPPLIERS_DB.stores.suppliers, "readwrite")
      const supplier = await tx.store.get(supplierId)

      if (supplier && supplier.userId === userId) {
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

      if (supplier && supplier.userId === userId) {
        supplier.syncStatus = "error"
        supplier.syncError = failedSupplier.error
        await tx.store.put(supplier)
        errors.push(failedSupplier.error)
        failed++
      }

      progressCallback?.(synced + failed, total, false, failedSupplier.error)
    }

    window.dispatchEvent(
      new CustomEvent("sync-end", {
        detail: { summary: { synced, failed, errors } },
      }),
    )

    return { success: true, synced, failed, errors }
  } catch (error: any) {
    console.error("Error syncing pending suppliers:", error)
    window.dispatchEvent(
      new CustomEvent("sync-error", {
        detail: { error: error.message || "Sync failed" },
      }),
    )
    return { success: false, synced: 0, failed: 0, errors: [error.message || "Sync failed"] }
  }
}

async function saveSupplierToServer(supplier: Supplier): Promise<Supplier> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

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
      throw new Error("The connection to the database timed out. Please check your internet connection and try again later.")
    }
    if (error.message.includes("fetch")) {
      throw new Error("Unable to connect to the database. Please check your internet connection.")
    }
    console.error("Error saving supplier to server:", error)
    throw error
  }
}

async function deleteSupplierFromServer(id: string): Promise<void> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(`/api/suppliers/${id}`, {
      method: "DELETE",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
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
      throw new Error("The connection to the database timed out. Please check your internet connection and try again later.")
    }
    if (error.message.includes("fetch")) {
      throw new Error("Unable to connect to the database. Please check your internet connection.")
    }
    console.error(`Error deleting supplier ${id} from server:`, error)
    throw error
  }
}
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"  