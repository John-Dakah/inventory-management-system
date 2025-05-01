"\"use client"

import { v4 as uuidv4 } from "uuid"
import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import {
  getStockItemsFromDB,
  saveStockItemToDB,
  recordStockTransactionToDB,
  getProductsFromDB,
  saveProductToDB,
  getStockStatsFromDB,
} from "./db-server"
import { type } from "os"

// Type definitions
export interface StockItem {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  location: string
  status: string
  type: string
  lastUpdated: string
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
  vendor?: string
}

export interface StockTransaction {
  id: string
  stockItemId: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  location?: string
  reference?: string
  reason?: string
  notes?: string
  createdAt: string
  metadata?: any
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

export interface Product {
  id: string
  name: string
  description: string
  sku: string
  price: number
  quantity: number
  category: string
  vendor: string
  imageUrl: string
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

// Local storage keys
const STOCK_ITEMS_KEY = "stock_items"
const STOCK_TRANSACTIONS_KEY = "stock_transactions"
const PRODUCTS_KEY = "products"
const SYNC_QUEUE_KEY = "sync_queue"

// IndexedDB Schema
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
      operation: "create" | "update" | "delete" | "upsert"
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
  auditLog: {
    key: number
    value: {
      action: string
      entityType: string
      entityId?: string
      details?: any
      userId?: string
      timestamp: number
    }
    indexes: {
      by_timestamp: number
    }
  }
  transactions: {
    key: string
    value: any
  }
}

// Database state management
let dbPromise: Promise<IDBPDatabase<ProductDBSchema>> | null = null
let dbInitialized = false

// Current database version - increment this when making schema changes
const CURRENT_DB_VERSION = 4

// Network status check
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

// Get database instance
export async function getDB(): Promise<IDBPDatabase<ProductDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ProductDBSchema>("inventory-db", CURRENT_DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        if (newVersion !== null) {
        for (let version = oldVersion + 1; version <= newVersion; version++) {
          await applySchemaChanges(db, version, transaction)
        }
      }
    }})
    dbInitialized = true
  }
  return dbPromise
}

// Ensure database is properly initialized
export async function ensureDBInitialized() {
  if (!dbInitialized) {
    try {
      await getDB() // This should trigger any needed upgrades
      dbInitialized = true
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Database initialization failed:", error)
      throw error
    }
  }
}

// Apply schema changes for each version
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
      // Add audit log store
      if (!db.objectStoreNames.contains("auditLog")) {
        const auditLogStore = db.createObjectStore("auditLog", { keyPath: "id", autoIncrement: true })
        auditLogStore.createIndex("by_timestamp", "timestamp")
      }
      break

    case 4:
      // Version 4 schema changes
      // Add vendor index to stockItems
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

// Queue for offline operations
interface SyncQueueItem {
  id: string
  type: "stockItem" | "stockTransaction" | "product" | "supplier" | "user"
  operation: "create" | "update" | "delete" | "upsert"
  data: any
  timestamp: number
}

// Add item to sync queue
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB()
  await db.put("syncQueue", item)
}

// Get sync queue
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB()
    const items = await db.getAll("syncQueue")
    return items.filter((item): item is SyncQueueItem => item.data !== undefined)
  } catch (error) {
    console.error("Error getting sync queue from IndexedDB:", error)

    // Fallback to localStorage
    const queueData = localStorage.getItem(SYNC_QUEUE_KEY)
    return queueData ? JSON.parse(queueData) : []
  }
}

// Clear sync queue
export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction("syncQueue", "readwrite")
    await tx.objectStore("syncQueue").clear()
    await tx.done

    // Also clear localStorage backup
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]))
  } catch (error) {
    console.error("Error clearing sync queue:", error)
    // Fallback to just clearing localStorage
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]))
  }
}

// Process sync queue
export async function processSyncQueue(): Promise<boolean> {
  if (!isOnline()) return false

  const queue = await getSyncQueue()
  if (queue.length === 0) return true

  const successfulItems: string[] = []

  try {
    for (const item of queue) {
      try {
        switch (item.type) {
          case "stockItem":
            await saveStockItemToDB(item.data)
            break
          case "stockTransaction":
            await recordStockTransactionToDB(item.data)
            break
          case "product":
            await saveProductToDB(item.data)
            break
          case "supplier":
            // Implement supplier sync
            break
          case "user":
            // Implement user sync
            break
        }
        successfulItems.push(item.id)

        // Add audit log entry for successful sync
        await addAuditLogEntry({
          action: "sync",
          entityType: item.type,
          entityId: item.data?.id,
          details: { operation: item.operation },
        })
      } catch (itemError) {
        console.error(`Error processing queue item ${item.id}:`, itemError)

        // Log sync error
        await addAuditLogEntry({
          action: "syncError",
          entityType: item.type,
          entityId: item.data?.id,
          details: {
            error: itemError instanceof Error ? itemError.message : String(itemError),
            operation: item.operation,
          },
        })
        // Continue with next item
      }
    }

    // Remove successful items from queue
    if (successfulItems.length > 0) {
      const db = await getDB()
      const tx = db.transaction("syncQueue", "readwrite")
      const store = tx.objectStore("syncQueue")

      for (const id of successfulItems) {
        await store.delete(id)
      }

      await tx.done
    }

    return successfulItems.length === queue.length
  } catch (error) {
    console.error("Error processing sync queue:", error)
    return false
  }
}

// AUDIT LOG FUNCTIONS
export async function addAuditLogEntry(entry: {
  action: string
  entityType: string
  entityId?: string
  details?: any
  userId?: string
}): Promise<number> {
  try {
    const db = await getDB()
    const timestamp = Date.now()
    const fullEntry = {
      ...entry,
      timestamp,
      userId: entry.userId || "system",
    }

    return await db.add("auditLog", fullEntry)
  } catch (error) {
    console.error("Error adding audit log entry:", error)
    return -1 // Error indicator
  }
}

export async function getAuditLogs(limit = 100): Promise<any[]> {
  try {
    const db = await getDB()
    return await db.getAllFromIndex("auditLog", "by_timestamp", null, limit)
  } catch (error) {
    console.error("Error getting audit logs:", error)
    return []
  }
}

// Get stock items
export async function getStockItems(filters?: { statuses?: string[] }): Promise<StockItem[]> {
  try {
    if (isOnline()) {
      // Try to get from database first
      const dbItems = await getStockItemsFromDB()

      // Store in IndexedDB
      const db = await getDB()
      const tx = db.transaction("stockItems", "readwrite")
      for (const item of dbItems) {
        await tx.store.put(item)
      }
      await tx.done

      // Update local storage with latest data
      localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(dbItems))

      // Apply filters if provided
      if (filters?.statuses && filters.statuses.length > 0) {
        return dbItems.filter((item) => filters.statuses!.includes(item.status))
      }

      return dbItems
    } else {
      // Fallback to IndexedDB when offline
      try {
        const db = await getDB()
        let items = await db.getAll("stockItems")

        // Apply filters if provided
        if (filters?.statuses && filters.statuses.length > 0) {
          items = items.filter((item) => filters.statuses!.includes(item.status))
        }

        return items
      } catch (dbError) {
        console.error("Error getting stock items from IndexedDB:", dbError)

        // Fallback to local storage
        const storedItems = localStorage.getItem(STOCK_ITEMS_KEY)
        const items = storedItems ? JSON.parse(storedItems) : []

        // Apply filters if provided
        if (filters?.statuses && filters.statuses.length > 0) {
          return items.filter((item: StockItem) => filters.statuses!.includes(item.status))
        }

        return items
      }
    }
  } catch (error) {
    console.error("Error getting stock items:", error)

    // Try IndexedDB first
    try {
      const db = await getDB()
      let items = await db.getAll("stockItems")

      // Apply filters if provided
      if (filters?.statuses && filters.statuses.length > 0) {
        items = items.filter((item) => filters.statuses!.includes(item.status))
      }

      return items
    } catch (dbError) {
      // Fallback to local storage on error
      const storedItems = localStorage.getItem(STOCK_ITEMS_KEY)
      const items = storedItems ? JSON.parse(storedItems) : []

      // Apply filters if provided
      if (filters?.statuses && filters.statuses.length > 0) {
        return items.filter((item: StockItem) => filters.statuses!.includes(item.status))
      }

      return items
    }
  }
}

// Save stock item
export async function saveStockItem(item: StockItem): Promise<StockItem> {
  // Ensure item has an ID
  if (!item.id) {
    item.id = uuidv4()
  }

  // Validate required fields
  if (!item.name || !item.sku) {
    throw new Error("Stock item must have name and SKU")
  }

  // Update timestamps
  const now = new Date().toISOString()
  const timestamp = Date.now()
  if (!item.createdAt) {
    item.createdAt = now
  }
  item.updatedAt = now
  item.lastUpdated = now // Ensure lastUpdated is also set
  item.modified = timestamp
  item.syncStatus = "pending"

  try {
    // Save to IndexedDB first
    const db = await getDB()
    await db.put("stockItems", item)

    // Add to sync queue
    await addToSyncQueue({
      id: `stockItem-${item.id}-${timestamp}`,
      type: "stockItem",
      operation: "upsert",
      data: item,
      timestamp,
    })

    // Also update localStorage as backup
    const items = await getStockItems()
    const existingIndex = items.findIndex((i) => i.id === item.id)

    if (existingIndex >= 0) {
      items[existingIndex] = item
    } else {
      items.unshift(item)
    }

    localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(items))

    // Add audit log entry
    await addAuditLogEntry({
      action: existingIndex >= 0 ? "update" : "create",
      entityType: "stockItem",
      entityId: item.id,
      details: { sku: item.sku },
    })

    // Try to save to database if online
    if (isOnline()) {
      return await saveStockItemToDB(item)
    }

    return item
  } catch (error) {
    console.error("Error saving stock item:", error)

    // Log error
    await addAuditLogEntry({
      action: "error",
      entityType: "stockItem",
      entityId: item.id,
      details: {
        error: error instanceof Error ? error.message : String(error),
        operation: "saveStockItem",
      },
    })

    // Try to save to localStorage as last resort
    try {
      const items = localStorage.getItem(STOCK_ITEMS_KEY)
      const parsedItems = items ? JSON.parse(items) : []
      const existingIndex = parsedItems.findIndex((i: StockItem) => i.id === item.id)

      if (existingIndex >= 0) {
        parsedItems[existingIndex] = item
      } else {
        parsedItems.unshift(item)
      }

      localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(parsedItems))

      // Queue for sync
      const queueData = localStorage.getItem(SYNC_QUEUE_KEY)
      const queue = queueData ? JSON.parse(queueData) : []
      queue.push({
        id: `stockItem-${item.id}-${timestamp}`,
        type: "stockItem",
        operation: "upsert",
        data: item,
        timestamp,
      })
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
    } catch (localStorageError) {
      console.error("Failed to save to localStorage:", localStorageError)
    }

    return item
  }
}

// Record stock transaction
export async function recordStockTransaction(transaction: StockTransaction): Promise<StockTransaction> {
  // Ensure transaction has an ID
  if (!transaction.id) {
    transaction.id = uuidv4()
  }

  // Set created timestamp
  if (!transaction.createdAt) {
    transaction.createdAt = new Date().toISOString()
  }

  const timestamp = Date.now()
  transaction.modified = timestamp
  transaction.syncStatus = "pending"

  try {
    const db = await getDB()
    const tx = db.transaction(["stockItems", "stockTransactions", "syncQueue"], "readwrite")

    // Get the stock item
    const stockItem = await tx.objectStore("stockItems").get(transaction.stockItemId)
    if (!stockItem) {
      throw new Error("Stock item not found")
    }

    // Update the stock item
    stockItem.quantity = transaction.newQuantity
    stockItem.lastUpdated = transaction.createdAt
    stockItem.modified = timestamp
    stockItem.syncStatus = "pending"

    // Update status based on new quantity
    if (transaction.newQuantity === 0) {
      stockItem.status = "Out of Stock"
    } else if (transaction.newQuantity <= 10) {
      stockItem.status = "Low Stock"
    } else {
      stockItem.status = "In Stock"
    }

    // Save updated stock item
    await tx.objectStore("stockItems").put(stockItem)

    // Save transaction
    await tx.objectStore("stockTransactions").put(transaction)

    // Add both to sync queue
    await tx.objectStore("syncQueue").put({
      id: `stockItem-${stockItem.id}-${timestamp}`,
      type: "stockItem",
      operation: "update",
      data: stockItem,
      timestamp,
    })

    await tx.objectStore("syncQueue").put({
      id: `stockTransaction-${transaction.id}-${timestamp}`,
      type: "stockTransaction",
      operation: "create",
      data: transaction,
      timestamp,
    })

    await tx.done

    // Update localStorage as backup
    try {
      // Update stock items in localStorage
      const storedItems = localStorage.getItem(STOCK_ITEMS_KEY)
      const items = storedItems ? JSON.parse(storedItems) : []
      const itemIndex = items.findIndex((item: StockItem) => item.id === transaction.stockItemId)

      if (itemIndex >= 0) {
        items[itemIndex].quantity = transaction.newQuantity
        items[itemIndex].lastUpdated = transaction.createdAt
        items[itemIndex].status = stockItem.status
        localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(items))
      }

      // Add transaction to localStorage
      const storedTransactions = localStorage.getItem(STOCK_TRANSACTIONS_KEY)
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : []
      transactions.unshift(transaction)
      localStorage.setItem(STOCK_TRANSACTIONS_KEY, JSON.stringify(transactions))
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError)
    }

    // Add audit log entry
    await addAuditLogEntry({
      action: "stockTransaction",
      entityType: "stockItem",
      entityId: transaction.stockItemId,
      details: {
        type: transaction.type,
        quantity: transaction.quantity,
        previousQuantity: transaction.previousQuantity,
        newQuantity: transaction.newQuantity,
      },
    })

    // Try to save to database if online
    if (isOnline()) {
      return await recordStockTransactionToDB(transaction)
    }

    return transaction
  } catch (error) {
    console.error("Error recording stock transaction:", error)

    // Log error
    await addAuditLogEntry({
      action: "error",
      entityType: "stockTransaction",
      entityId: transaction.id,
      details: {
        error: error instanceof Error ? error.message : String(error),
        operation: "recordStockTransaction",
      },
    })

    // Try to use localStorage as fallback
    try {
      // Get current transactions from local storage
      const storedTransactions = localStorage.getItem(STOCK_TRANSACTIONS_KEY)
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : []

      // Add new transaction
      transactions.unshift(transaction)
      localStorage.setItem(STOCK_TRANSACTIONS_KEY, JSON.stringify(transactions))

      // Update the stock item in local storage
      if (transaction.stockItemId) {
        const items = localStorage.getItem(STOCK_ITEMS_KEY)
        const parsedItems = items ? JSON.parse(items) : []
        const itemIndex = parsedItems.findIndex((item: StockItem) => item.id === transaction.stockItemId)

        if (itemIndex >= 0) {
          parsedItems[itemIndex].quantity = transaction.newQuantity
          parsedItems[itemIndex].lastUpdated = transaction.createdAt

          // Update status based on new quantity
          if (transaction.newQuantity === 0) {
            parsedItems[itemIndex].status = "Out of Stock"
          } else if (transaction.newQuantity <= 10) {
            parsedItems[itemIndex].status = "Low Stock"
          } else {
            parsedItems[itemIndex].status = "In Stock"
          }

          localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(parsedItems))
        }
      }

      // Add to sync queue in localStorage
      const queueData = localStorage.getItem(SYNC_QUEUE_KEY)
      const queue = queueData ? JSON.parse(queueData) : []
      queue.push({
        id: `storedTransactions-${transaction.id}-${timestamp}`,
        type: "stockTransaction",
        operation: "create",
        data: transaction,
        timestamp,
      })
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
    } catch (localStorageError) {
      console.error("Failed to save to localStorage:", localStorageError)
    }

    return transaction
  }
}

// Get stock transactions
export async function getStockTransactions(): Promise<StockTransaction[]> {
  try {
    const db = await getDB()
    return await db.getAll("stockTransactions")
  } catch (error) {
    console.error("Error getting stock transactions from IndexedDB:", error)

    // Fallback to localStorage
    const storedTransactions = localStorage.getItem(STOCK_TRANSACTIONS_KEY)
    return storedTransactions ? JSON.parse(storedTransactions) : []
  }
}

// Get products
export async function getProducts(): Promise<Product[]> {
  try {
    if (isOnline()) {
      // Try to get from database first
      const dbProducts = await getProductsFromDB()

      // Store in IndexedDB
      const db = await getDB()
      const tx = db.transaction("products", "readwrite")
      for (const product of dbProducts) {
        await tx.store.put(product)
      }
      await tx.done

      // Update local storage with latest data
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(dbProducts))

      return dbProducts
    } else {
      // Fallback to IndexedDB when offline
      try {
        const db = await getDB()
        return await db.getAll("products")
      } catch (dbError) {
        console.error("Error getting products from IndexedDB:", dbError)

        // Fallback to local storage
        const storedProducts = localStorage.getItem(PRODUCTS_KEY)
        return storedProducts ? JSON.parse(storedProducts) : []
      }
    }
  } catch (error) {
    console.error("Error getting products:", error)

    // Try IndexedDB first
    try {
      const db = await getDB()
      return await db.getAll("products")
    } catch (dbError) {
      // Fallback to local storage on error
      const storedProducts = localStorage.getItem(PRODUCTS_KEY)
      return storedProducts ? JSON.parse(storedProducts) : []
    }
  }
}

// Get a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = await getDB()
    const product = await db.get("products", id)
    return product ?? null
  } catch (error) {
    console.error("Error getting product from IndexedDB:", error)

    // Fallback to searching in localStorage
    const products = await getProducts()
    return products.find((p) => p.id === id) || null
  }
}

// Save product
export async function saveProduct(product: Product): Promise<Product> {
  // Ensure product has an ID
  if (!product.id) {
    product.id = uuidv4()
  }

  // Update timestamps
  const now = new Date().toISOString()
  const timestamp = Date.now()
  if (!product.createdAt) {
    product.createdAt = now
  }
  product.updatedAt = now
  product.modified = timestamp
  product.syncStatus = "pending"

  try {
    // Save to IndexedDB first
    const db = await getDB()
    await db.put("products", product)

    // Add to sync queue
    await addToSyncQueue({
      id: `product-${product.id}-${timestamp}`,
      type: "product",
      operation: "upsert",
      data: product,
      timestamp,
    })

    // Also update localStorage as backup
    const products = await getProducts()
    const existingIndex = products.findIndex((p) => p.id === product.id)

    if (existingIndex >= 0) {
      products[existingIndex] = product
    } else {
      products.unshift(product)
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))

    // Add audit log entry
    await addAuditLogEntry({
      action: existingIndex >= 0 ? "update" : "create",
      entityType: "product",
      entityId: product.id,
      details: { sku: product.sku },
    })

    // Try to save to database if online
    if (isOnline()) {
      return await saveProductToDB(product)
    }

    return product
  } catch (error) {
    console.error("Error saving product:", error)

    // Log error
    await addAuditLogEntry({
      action: "error",
      entityType: "product",
      entityId: product.id,
      details: {
        error: error instanceof Error ? error.message : String(error),
        operation: "saveProduct",
      },
    })

    // Try to save to localStorage as last resort
    try {
      const products = localStorage.getItem(PRODUCTS_KEY)
      const parsedProducts = products ? JSON.parse(products) : []
      const existingIndex = parsedProducts.findIndex((p: Product) => p.id === product.id)

      if (existingIndex >= 0) {
        parsedProducts[existingIndex] = product
      } else {
        parsedProducts.unshift(product)
      }

      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(parsedProducts))

      // Queue for sync
      const queueData = localStorage.getItem(SYNC_QUEUE_KEY)
      const queue = queueData ? JSON.parse(queueData) : []
      queue.push({
        id: `product-${product.id}-${timestamp}`,
        type: "product",
        operation: "upsert",
        data: product,
        timestamp,
      })
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
    } catch (localStorageError) {
      console.error("Failed to save to localStorage:", localStorageError)
    }

    return product
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const timestamp = Date.now()

  try {
    // Delete from IndexedDB
    const db = await getDB()
    const tx = db.transaction(["products", "syncQueue"], "readwrite")

    // Delete product
    await tx.objectStore("products").delete(id)

    // Add to sync queue
    await tx.objectStore("syncQueue").put({
      id: `product-delete-${id}-${timestamp}`,
      type: "product",
      operation: "delete",
      data: undefined,
      timestamp,
    })

    await tx.done

    // Update localStorage
    try {
      const products = localStorage.getItem(PRODUCTS_KEY)
      if (products) {
        const parsedProducts = JSON.parse(products)
        const filteredProducts = parsedProducts.filter((p: Product) => p.id !== id)
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filteredProducts))
      }
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError)
    }

    // Add audit log entry
    await addAuditLogEntry({
      action: "delete",
      entityType: "product",
      entityId: id,
    })
  } catch (error) {
    console.error("Error deleting product:", error)

    // Log error
    await addAuditLogEntry({
      action: "error",
      entityType: "product",
      entityId: id,
      details: {
        error: error instanceof Error ? error.message : String(error),
        operation: "deleteProduct",
      },
    })

    throw error
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const db = await getDB()
    const user = await db.get("users", userId)
    return user || null
  } catch (error) {
    console.error("Error getting user from IndexedDB:", error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
  try {
    const db = await getDB()
    const user = await db.get("users", userId)

    if (!user) {
      throw new Error("User not found")
    }

    const timestamp = Date.now()
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
      modified: timestamp,
      syncStatus: "pending" as "pending",
    }

    // Save to IndexedDB
    await db.put("users", updatedUser as User)

    // Add to sync queue
    await addToSyncQueue({
      id: `user-${userId}-${timestamp}`,
      type: "user",
      operation: "update",
      data: updatedUser,
      timestamp,
    })

    // Add audit log entry
    await addAuditLogEntry({
      action: "updateProfile",
      entityType: "user",
      entityId: userId,
      userId,
    })

    return updatedUser
  } catch (error) {
    console.error("Error updating user profile:", error)

    // Log error
    await addAuditLogEntry({
      action: "error",
      entityType: "user",
      entityId: userId,
      details: {
        error: error instanceof Error ? error.message : String(error),
        operation: "updateUserProfile",
      },
    })

    throw error
  }
}

// Get suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const db = await getDB()
    return await db.getAll("suppliers")
  } catch (error) {
    console.error("Error getting suppliers from IndexedDB:", error)
    return []
  }
}

// Get supplier names
export async function getSupplierNames(): Promise<string[]> {
  try {
    const suppliers = await getSuppliers()
    return suppliers.map((supplier) => supplier.name)
  } catch (error) {
    console.error("Error getting supplier names:", error)
    return []
  }
}

// Get supplier stats
export async function getSupplierStats(): Promise<{
  total: number
  active: number
  newThisMonth: number
  activePercentage: number
  onHold: number
  inactive: number
}> {
  try {
    const suppliers = await getSuppliers()

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
      total: suppliers.length,
      active: suppliers.filter((s) => s.status === "Active").length,
      onHold: suppliers.filter((s) => s.status === "On Hold").length,
      inactive: suppliers.filter((s) => s.status === "Inactive").length,
      newThisMonth: suppliers.filter((s) => new Date(s.createdAt) >= firstDayOfMonth).length,
      activePercentage: 0,
    }

    stats.activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0

    return stats
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

// Get stock stats
export async function getStockStats() {
  try {
    if (isOnline()) {
      // Try to get from database first
      return await getStockStatsFromDB()
    } else {
      // Calculate from IndexedDB when offline
      const items = await getStockItems()

      const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]
      const locations = [...new Set(items.map((item) => item.location).filter(Boolean))]
      const types = [...new Set(items.map((item) => item.type).filter(Boolean))]

      return {
        totalItems: items.length,
        totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
        lowStockItems: items.filter((item) => item.quantity > 0 && item.quantity <= 10).length,
        outOfStockItems: items.filter((item) => item.quantity === 0).length,
        categories,
        locations,
        types,
      }
    }
  } catch (error) {
    console.error("Error getting stock stats:", error)

    // Calculate from IndexedDB on error
    try {
      const items = await getStockItems()

      const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]
      const locations = [...new Set(items.map((item) => item.location).filter(Boolean))]
      const types = [...new Set(items.map((item) => item.type).filter(Boolean))]

      return {
        totalItems: items.length,
        totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
        lowStockItems: items.filter((item) => item.quantity > 0 && item.quantity <= 10).length,
        outOfStockItems: items.filter((item) => item.quantity === 0).length,
        categories,
        locations,
        types,
      }
    } catch (dbError) {
      console.error("Error calculating stats from IndexedDB:", dbError)
      return {
        totalItems: 0,
        totalUnits: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        categories: [],
        locations: [],
        types: [],
      }
    }
  }
}

// Get product stats
export async function getProductStats(): Promise<{
  total: number
  categories: string[]
}> {
  try {
    const products = await getProducts()

    const total = products.length
    const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)))

    return { total, categories }
  } catch (error) {
    console.error("Error getting product stats:", error)
    return { total: 0, categories: [] }
  }
}

// Check storage quota
export async function checkStorageQuota(): Promise<{
  used: number
  total: number
  percentUsed: number
}> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const total = estimate.quota || 0
      const percentUsed = total > 0 ? Math.round((used / total) * 100) : 0

      return { used, total, percentUsed }
    }

    return { used: 0, total: 0, percentUsed: 0 }
  } catch (error) {
    console.error("Error checking storage quota:", error)
    return { used: 0, total: 0, percentUsed: 0 }
  }
}
// Initialize database on load
;(async () => {
  try {
    await ensureDBInitialized()
  } catch (error) {
    console.error("Initialization error:", error)
  }
})()

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const db = await getDB()
    const product = await db.get("products", id)
    return product ?? null
  } catch (error) {
    console.error("Error getting product from IndexedDB:", error)

    // Fallback to searching in localStorage
    const products = await getProducts()
    return products.find((p) => p.id === id) || null
  }
}
// sdfghjkl;'fghjkl;fghjkl;dfghjkldfghjkfghjkghj

export const forceSyncAllData = async (): Promise<{ success: boolean; message: string }> => {
  if (!isOnline()) {
    return { success: false, message: "Cannot sync while offline" }
  }

  try {
    // First process any pending sync queue items
    await processSyncQueue()

    // Then fetch fresh data from the database
    const stockResult = await getStockItemsFromDB()
    const productsResult = await getProductsFromDB()

    if (!stockResult.success || !productsResult.success) {
      return {
        success: false,
        message: "Failed to fetch latest data from database",
      }
    }

    // Update IndexedDB with the latest data
    await saveStockItemToDB(stockResult.data)
    saveProductsToIndexedDB(productsResult.data)

    return {
      success: true,
      message: `Successfully synchronized ${stockResult.data.length} stock items and ${productsResult.data.length} products`,
    }
  } catch (error) {
    console.error("Error during force sync:", error)
    return {
      success: false,
      message: "Error during synchronization: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}
function saveProductsToIndexedDB(data: any) {
  throw new Error("Function not implemented.")
}

