import { db } from "./db-utils"
import type { Supplier } from "@/types"

// Function to sync a single supplier to Neon
export async function syncSupplierToNeon(supplier: Supplier): Promise<boolean> {
  try {
    const response = await fetch("/api/suppliers/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplier),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync supplier: ${response.statusText}`)
    }

    // Mark the supplier as synced in IndexedDB
    await db.suppliers.update(supplier.id, {
      ...supplier,
      synced: true,
      lastSyncedAt: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error syncing supplier to Neon:", error)
    return false
  }
}

// Function to sync all unsynced suppliers to Neon
export async function syncAllSuppliersToNeon(): Promise<{
  success: number
  failed: number
}> {
  try {
    // Get all unsynced suppliers from IndexedDB
    const unsyncedSuppliers = await db.suppliers.filter((supplier) => !supplier.synced).toArray()

    if (unsyncedSuppliers.length === 0) {
      return { success: 0, failed: 0 }
    }

    let successCount = 0
    let failedCount = 0

    // Sync each supplier
    for (const supplier of unsyncedSuppliers) {
      const success = await syncSupplierToNeon(supplier)
      if (success) {
        successCount++
      } else {
        failedCount++
      }
    }

    return {
      success: successCount,
      failed: failedCount,
    }
  } catch (error) {
    console.error("Error syncing suppliers to Neon:", error)
    return { success: 0, failed: (await db.suppliers.filter((supplier) => !supplier.synced).toArray()).length }
  }
}

// Function to fetch all suppliers from Neon and update IndexedDB
export async function fetchSuppliersFromNeon(): Promise<boolean> {
  try {
    const response = await fetch("/api/suppliers")

    if (!response.ok) {
      throw new Error(`Failed to fetch suppliers: ${response.statusText}`)
    }

    const suppliers = await response.json()

    // Update IndexedDB with the latest data from Neon
    // Use a transaction to ensure all operations complete together
    await db.transaction("rw", db.suppliers, async () => {
      // Clear existing suppliers
      await db.suppliers.clear()

      // Add all suppliers from Neon
      for (const supplier of suppliers) {
        await db.suppliers.put({
          ...supplier,
          synced: true,
          lastSyncedAt: new Date().toISOString(),
        })
      }
    })

    return true
  } catch (error) {
    console.error("Error fetching suppliers from Neon:", error)
    return false
  }
}

// Function to perform a two-way sync
export async function performTwoWaySync(): Promise<{
  uploaded: number
  downloaded: number
  failed: number
}> {
  try {
    // First, sync local changes to Neon
    const uploadResult = await syncAllSuppliersToNeon()

    // Then, fetch the latest data from Neon
    const downloadSuccess = await fetchSuppliersFromNeon()

    return {
      uploaded: uploadResult.success,
      downloaded: downloadSuccess ? 1 : 0,
      failed: uploadResult.failed,
    }
  } catch (error) {
    console.error("Error performing two-way sync:", error)
    return { uploaded: 0, downloaded: 0, failed: 0 }
  }
}

