import { v4 as uuidv4 } from "uuid"
import { getDB, addToSyncQueue } from "./db-utils"

// Get all suppliers
export async function getSuppliers(filter) {
  try {
    const db = await getDB()
    let suppliers = await db.getAll("suppliers")

    // Filter out deleted suppliers
    suppliers = suppliers.filter((supplier) => !supplier.deleted)

    // Apply filters if provided
    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        suppliers = suppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchTerm) ||
            supplier.contactPerson.toLowerCase().includes(searchTerm) ||
            supplier.email.toLowerCase().includes(searchTerm) ||
            supplier.phone.includes(searchTerm) ||
            supplier.products.toLowerCase().includes(searchTerm),
        )
      }

      if (filter.status && filter.status !== "All") {
        suppliers = suppliers.filter((supplier) => supplier.status === filter.status)
      }
    }

    return suppliers
  } catch (error) {
    console.error("Error getting suppliers:", error)
    return []
  }
}

// Get supplier by ID
export async function getSupplier(id) {
  try {
    const db = await getDB()
    const supplier = await db.get("suppliers", id)
    return supplier && !supplier.deleted ? supplier : null
  } catch (error) {
    console.error(`Error getting supplier ${id}:`, error)
    return null
  }
}

// Save supplier
export async function saveSupplier(supplier) {
  try {
    const db = await getDB()

    // Ensure supplier has an ID
    if (!supplier.id) {
      supplier.id = uuidv4()
      supplier.createdAt = new Date().toISOString()
    }

    // Set modified timestamp and sync status
    const now = Date.now()
    supplier.modified = now
    supplier.syncStatus = "pending"
    supplier.updatedAt = new Date().toISOString()

    // Save to IndexedDB
    await db.put("suppliers", supplier)

    // Add to sync queue
    await addToSyncQueue({
      id: `supplier-${supplier.id}-${now}`,
      operation: supplier.id ? "update" : "create",
      data: supplier,
      type: "supplier",
      timestamp: now,
    })

    return supplier.id
  } catch (error) {
    console.error("Error saving supplier:", error)
    throw error
  }
}

// Delete supplier
export async function deleteSupplier(id) {
  try {
    const db = await getDB()

    // Get the supplier first
    const supplier = await db.get("suppliers", id)

    if (supplier) {
      // Mark as deleted instead of actually deleting
      supplier.deleted = true
      supplier.syncStatus = "pending"
      supplier.modified = Date.now()

      // Update in IndexedDB
      await db.put("suppliers", supplier)

      // Add to sync queue
      await addToSyncQueue({
        id: `supplier-${id}-${Date.now()}`,
        operation: "delete",
        data: { id },
        type: "supplier",
        timestamp: Date.now(),
      })
    }
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error)
    throw error
  }
}

// Get supplier stats
export async function getSupplierStats() {
  try {
    const suppliers = await getSuppliers()

    // Calculate stats
    const total = suppliers.length
    const active = suppliers.filter((s) => s.status === "Active").length
    const onHold = suppliers.filter((s) => s.status === "On Hold").length
    const inactive = suppliers.filter((s) => s.status === "Inactive").length

    // Calculate new this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = suppliers.filter((s) => new Date(s.createdAt) >= firstDayOfMonth).length

    // Calculate active percentage
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0

    return {
      total,
      active,
      newThisMonth,
      activePercentage,
      onHold,
      inactive,
    }
  } catch (error) {
    console.error("Error getting supplier stats:", error)
    return {
      total: 0,
      active: 0,
      newThisMonth: 0,
      activePercentage: 0,
      onHold: 0,
      inactive: 0,
    }
  }
}

// Get supplier names for product form
export async function getSupplierNames() {
  try {
    const suppliers = await getSuppliers()
    return suppliers.filter((supplier) => supplier.status === "Active").map((supplier) => supplier.name)
  } catch (error) {
    console.error("Error getting supplier names:", error)
    return []
  }
}

