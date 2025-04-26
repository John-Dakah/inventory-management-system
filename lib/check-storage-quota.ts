import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface ProductDBSchema extends DBSchema {
  products: {
    key: string
    value: Product
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-category": string
    }
  }
  suppliers: {
    key: string
    value: Supplier
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-status": string
    }
  }
  stockItems: {
    key: string
    value: StockItem
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-category": string
      "by-location": string
      "by-status": string
      "by-type": string
      "by-vendor": string
    }
  }
  stockTransactions: {
    key: string
    value: StockTransaction
    indexes: {
      "by-stockItemId": string
      "by-type": string
      "by-modified": number
      "by-sync-status": string
      "by-createdAt": string
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      operation: "create" | "update" | "delete"
      data?: Product | Supplier | StockItem | StockTransaction | User
      type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user"
      timestamp: number
    }
  }
  users: {
    key: string
    value: User
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-role": string
      "by-status": string
      "by-email": string
    }
  }
  categories: {
    key: string
    value: {
      name: string
      createdAt: string
    }
  }
  transactions: {
    key: string
    value: any
  }
  auditLog: {
    key: string
    value: any
    indexes: {}
  }
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  price: number
  quantity: number
  category?: string
  vendor?: string
  weight?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  products: string
  status: "Active" | "Inactive" | "On Hold"
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

export interface StockItem {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  location: string
  status: "In Stock" | "Low Stock" | "Out of Stock"
  lastUpdated: string
  type: "Finished Good" | "Raw Material"
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

export interface StockTransaction {
  quantityChange: any
  id: string
  stockItemId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  previousQuantity: number
  newQuantity: number
  location: string
  reference?: string
  reason?: string
  notes?: string
  createdAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

export interface User {
  id: string
  email: string
  password: string
  fullName: string
  department?: string
  status: "ACTIVE" | "INACTIVE"
  role: "admin" | "warehouse_manager" | "sales_person"
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

let pendingSyncItems: any[] = [] // In-memory storage for demonstration purposes

export async function getPendingSyncItems(): Promise<any[]> {
  // Use the real IndexedDB implementation
  try {
    const db = await getDB()
    return db.getAll("syncQueue")
  } catch (error) {
    console.error("Error getting pending sync items:", error)
    return pendingSyncItems // Fallback to in-memory storage
  }
}

export async function markAsSynced(entityId: string, type: string): Promise<void> {
  try {
    const db = await getDB()
    const storeName = `${type}s` as "products" | "suppliers" | "stockItems" | "stockTransactions" | "users"
    const tx = db.transaction([storeName, "syncQueue"], "readwrite")

    // Get the entity
    const store = tx.objectStore(storeName)
    const entity = await store.get(entityId)

    if (entity) {
      // Update sync status
      entity.syncStatus = "synced"
      await store.put(entity)

      // Remove from sync queue (all entries for this entity)
      const syncQueue = tx.objectStore("syncQueue")
      let cursor = await syncQueue.openCursor()

      while (cursor) {
        const syncItem = cursor.value

        if (
          syncItem.type === type &&
          ((syncItem.data && syncItem.data.id === entityId) ||
            syncItem.id.includes(`${type}-${entityId}-`) ||
            syncItem.id.includes(`${type}-delete-${entityId}-`))
        ) {
          await cursor.delete()
        }

        cursor = await cursor.continue()
      }

      await tx.done
      console.log(`${type} with ID ${entityId} marked as synced and removed from sync queue`)
    }
  } catch (error) {
    console.error(`Error marking ${type} as synced:`, error)
    // Fallback to in-memory implementation
    pendingSyncItems = pendingSyncItems.filter(
      (item) =>
        !(item.data?.id === entityId && item.type === type) &&
        !(item.id.split("-")[1] === entityId && item.type === type),
    )
  }
}

let dbPromise: Promise<IDBPDatabase<ProductDBSchema>> | null = null

// Current database version - increment this when making schema changes
const CURRENT_DB_VERSION = 4

export async function getDB(): Promise<IDBPDatabase<ProductDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ProductDBSchema>("inventory-db", CURRENT_DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        // Handle incremental upgrades based on oldVersion
        for (let version = oldVersion + 1; version <= newVersion; version++) {
          await applySchemaChanges(db, version, transaction)
        }
      },
    })
  }
  return dbPromise
}

async function applySchemaChanges(db: IDBPDatabase<ProductDBSchema>, version: number, transaction: any): Promise<void> {
  switch (version) {
    case 1:
      // Initial schema setup
      const productStore = db.createObjectStore("products", { keyPath: "id" })
      productStore.createIndex("by-modified", "modified")
      productStore.createIndex("by-sync-status", "syncStatus")

      const supplierStore = db.createObjectStore("suppliers", { keyPath: "id" })
      supplierStore.createIndex("by-modified", "modified")
      supplierStore.createIndex("by-sync-status", "syncStatus")
      supplierStore.createIndex("by-status", "status")

      const stockItemStore = db.createObjectStore("stockItems", { keyPath: "id" })
      stockItemStore.createIndex("by-modified", "modified")
      stockItemStore.createIndex("by-sync-status", "syncStatus")
      stockItemStore.createIndex("by-category", "category")
      stockItemStore.createIndex("by-location", "location")
      stockItemStore.createIndex("by-status", "status")
      stockItemStore.createIndex("by-type", "type")

      const stockTransactionStore = db.createObjectStore("stockTransactions", { keyPath: "id" })
      stockTransactionStore.createIndex("by-stockItemId", "stockItemId")
      stockTransactionStore.createIndex("by-type", "type")
      stockTransactionStore.createIndex("by-modified", "modified")
      stockTransactionStore.createIndex("by-sync-status", "syncStatus")
      stockTransactionStore.createIndex("by-createdAt", "createdAt")

      db.createObjectStore("syncQueue", { keyPath: "id" })

      const userStore = db.createObjectStore("users", { keyPath: "id" })
      userStore.createIndex("by-modified", "modified")
      userStore.createIndex("by-sync-status", "syncStatus")
      userStore.createIndex("by-role", "role")
      userStore.createIndex("by-status", "status")
      userStore.createIndex("by-email", "email", { unique: true })

      db.createObjectStore("categories", { keyPath: "name" })
      db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true })
      break

    case 2:
      // Version 2 schema changes
      // Example: Add new index to products
      const products = transaction.objectStore("products")
      if (!products.indexNames.contains("by-category")) {
        products.createIndex("by-category", "category")
      }
      break

    case 3:
      // Version 3 schema changes
      // Example: Add new object store
      if (!db.objectStoreNames.contains("auditLog")) {
        db.createObjectStore("auditLog", { keyPath: "id", autoIncrement: true })
      }
      break

    case 4:
      // Version 4 schema changes
      // Example: Modify existing store
      const stockItems = transaction.objectStore("stockItems")
      if (!stockItems.indexNames.contains("by-vendor")) {
        stockItems.createIndex("by-vendor", "vendor")
      }
      break

    // Add more cases for future versions
    default:
      console.warn(`Unknown database version: ${version}`)
  }
}

// Check storage quota
export async function checkStorageQuota(): Promise<{ used: number; total: number; percentUsed: number }> {
  try {
    const quota = await navigator.storage.estimate()
    const used = quota.usage || 0
    const total = quota.quota || 0
    const percentUsed = (used / total) * 100

    return { used, total, percentUsed }
  } catch (error) {
    console.error("Error checking storage quota:", error)
    return { used: 0, total: 0, percentUsed: 0 }
  }
}
