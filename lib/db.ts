import { getSuppliers } from "@/app/actions/supplier-actions"
import {
  getDB,
  type Product,
  type Supplier,
  type StockItem,
  type StockTransaction,
  type User,
} from "./check-storage-quota"

// Re-export types from check-storage-quota
export type { Product, Supplier, StockItem, StockTransaction, User }

// Database state management
let dbInitialized = false
const DB_VERSION = 3 // Increment when schema changes

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

// Verify store exists helper
function verifyStoreExists(db: IDBDatabase, storeName: string) {
  if (!db.objectStoreNames.contains(storeName)) {
    throw new Error(`Store ${storeName} does not exist`)
  }
}

// Wrapper for database operations
async function withDB<T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  operation: (tx: IDBTransaction) => Promise<T>
): Promise<T> {
  await ensureDBInitialized()
  const db = await getDB()
  
  storeNames.forEach(store => verifyStoreExists(db, store))
  
  const tx = db.transaction(storeNames, mode)
  try {
    const result = await operation(tx)
    await tx.done
    return result
  } catch (error) {
    tx.abort()
    throw error
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
  return withDB(['auditLog'], 'readwrite', async (tx) => {
    const store = tx.objectStore('auditLog')
    const timestamp = Date.now()
    const fullEntry = {
      ...entry,
      timestamp,
      userId: entry.userId || 'system'
    }
    const request = store.add(fullEntry)
    return new Promise<number>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  })
}

export async function getAuditLogs(limit = 100): Promise<any[]> {
  return withDB(['auditLog'], 'readonly', async (tx) => {
    const store = tx.objectStore('auditLog')
    const index = store.index('by_timestamp')
    const request = index.getAll(null, limit)
    return new Promise<any[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  })
}

// PRODUCT FUNCTIONS
export async function saveProduct(product: Product): Promise<string> {
  try {
    const now = Date.now()
    
    // Set metadata
    if (!product.id) product.id = generateId()
    if (!product.createdAt) product.createdAt = new Date().toISOString()
    product.updatedAt = new Date().toISOString()
    product.modified = now
    product.syncStatus = product.syncStatus || 'pending'

    await withDB(['products', 'syncQueue'], 'readwrite', async (tx) => {
      // Save product
      await tx.objectStore('products').put(product)

      // Add to sync queue
      await tx.objectStore('syncQueue').put({
        id: `product-${product.id}-${now}`,
        operation: 'upsert',
        data: product,
        type: 'product',
        timestamp: now,
      })
    })

    // Audit log
    await addAuditLogEntry({
      action: 'save',
      entityType: 'product',
      entityId: product.id,
      details: { sku: product.sku }
    })

    return product.id
  } catch (error) {
    await addAuditLogEntry({
      action: 'error',
      entityType: 'product',
      details: { 
        error: error instanceof Error ? error.message : String(error),
        operation: 'saveProduct' 
      }
    })
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const now = Date.now()

    await withDB(['products', 'syncQueue'], 'readwrite', async (tx) => {
      // Delete product
      await tx.objectStore('products').delete(id)

      // Add to sync queue
      await tx.objectStore('syncQueue').put({
        id: `product-delete-${id}-${now}`,
        operation: 'delete',
        type: 'product',
        data: { id },
        timestamp: now,
      })
    })

    // Audit log
    await addAuditLogEntry({
      action: 'delete',
      entityType: 'product',
      entityId: id
    })
  } catch (error) {
    await addAuditLogEntry({
      action: 'error',
      entityType: 'product',
      details: { 
        error: error instanceof Error ? error.message : String(error),
        operation: 'deleteProduct' 
      }
    })
    throw error
  }
}

export async function getProducts(): Promise<Product[]> {
  return withDB(['products'], 'readonly', async (tx) => {
    const request = tx.objectStore('products').getAll()
    return new Promise<Product[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as unknown as Product[])
      request.onerror = () => reject(request.error)
    })
  })
}
export async function getProductById(id: string): Promise<Product | null> {
  return withDB(['products'], 'readonly', async (tx) => {
    const request = tx.objectStore('products').get(id)
    return new Promise<Product | null>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as unknown as Product | null)
      request.onerror = () => reject(request.error)
    })
  })}
// STOCK FUNCTIONS
export async function saveStockItem(stockItem: StockItem): Promise<void> {
  try {
    const now = Date.now()
    stockItem.modified = now
    stockItem.syncStatus = 'pending'

    await withDB(['stockItems', 'syncQueue'], 'readwrite', async (tx) => {
      await tx.objectStore('stockItems').put(stockItem)
      await tx.objectStore('syncQueue').put({
        id: `stockItem-${stockItem.id}-${now}`,
        operation: stockItem.id ? 'update' : 'create',
        data: stockItem,
        type: 'stockItem',
        timestamp: now,
      })
    })

    await addAuditLogEntry({
      action: stockItem.id ? 'update' : 'create',
      entityType: 'stockItem',
      entityId: stockItem.id,
    })
  } catch (error) {
    await addAuditLogEntry({
      action: 'error',
      entityType: 'stockItem',
      details: { error: error instanceof Error ? error.message : String(error) }
    })
    throw error
  }
}

export async function recordStockTransaction(transaction: StockTransaction): Promise<void> {
  try {
    const now = Date.now()
    transaction.modified = now
    transaction.syncStatus = 'pending'

    await withDB(
      ['stockItems', 'stockTransactions', 'syncQueue'], 
      'readwrite', 
      async (tx) => {
        // Update stock item
        const stockItemRequest = tx.objectStore('stockItems').get(transaction.stockItemId)
        const stockItem = await new Promise<any>((resolve, reject) => {
          stockItemRequest.onsuccess = () => resolve(stockItemRequest.result)
          stockItemRequest.onerror = () => reject(stockItemRequest.error)
        })
        if (!stockItem) throw new Error('Stock item not found')

        stockItem.quantity = transaction.newQuantity
        stockItem.lastUpdated = new Date().toISOString()
        stockItem.modified = now
        stockItem.syncStatus = 'pending'
        await tx.objectStore('stockItems').put(stockItem)

        // Record transaction
        await tx.objectStore('stockTransactions').put(transaction)

        // Add to sync queue
        await tx.objectStore('syncQueue').put({
          id: `stockItem-${stockItem.id}-${now}`,
          operation: 'update',
          data: stockItem,
          type: 'stockItem',
          timestamp: now,
        })

        await tx.objectStore('syncQueue').put({
          id: `stockTransaction-${transaction.id}-${now}`,
          operation: 'create',
          data: transaction,
          type: 'stockTransaction',
          timestamp: now,
        })
      }
    )

    await addAuditLogEntry({
      action: 'stockTransaction',
      entityType: 'stockItem',
      entityId: transaction.stockItemId,
      details: {
        type: transaction.type,
        quantityChange: transaction.quantityChange
      }
    })
  } catch (error) {
    await addAuditLogEntry({
      action: 'error',
      entityType: 'stockTransaction',
      details: { error: error instanceof Error ? error.message : String(error) }
    })
    throw error
  }
}

// STATISTICS FUNCTIONS
export async function getProductStats() {
  const products = await getProducts()
  return {
    total: products.length,
    categories: Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  }
}

export async function getStockStats() {
  const products = await getProducts()
  return {
    totalItems: products.length,
    lowStockItems: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
    outOfStockItems: products.filter(p => p.quantity === 0).length
  }
}

export async function getSupplierStats() {
  const suppliers = await getSuppliers()
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = {
    total: Array.isArray(suppliers.suppliers) ? suppliers.suppliers.length : 0,
    active: Array.isArray(suppliers.suppliers) 
      ? suppliers.suppliers.filter(s => s.status === 'Active').length 
      : 0,
    onHold: Array.isArray(suppliers.suppliers) 
      ? suppliers.suppliers.filter(s => s.status === 'On Hold').length 
      : 0,
    inactive: Array.isArray(suppliers.suppliers) 
      ? suppliers.suppliers.filter(s => s.status === 'Inactive').length 
      : 0,
    newThisMonth: Array.isArray(suppliers.suppliers) 
      ? suppliers.suppliers.filter(s => new Date(s.createdAt) >= firstDayOfMonth).length 
      : 0,
    activePercentage: 0,
  }

  stats.activePercentage = stats.total > 0 
    ? Math.round((stats.active / stats.total) * 100) 
    : 0

  return stats
}

// SYNC FUNCTIONS
export async function getPendingSyncItems() {
  return withDB(['syncQueue'], 'readonly', async (tx) => {
    return tx.objectStore('syncQueue').getAll()
  })
}

export async function markAsSynced(
  id: string,
  type: "product" | "supplier" | "stockItem" | "stockTransaction"
) {
  try {
    const storeName = `${type}s` as "products" | "suppliers" | "stockItems" | "stockTransactions"
    
    await withDB([storeName, 'syncQueue'], 'readwrite', async (tx) => {
      // Update entity sync status
      const request = tx.objectStore(storeName).get(id)
      const entity = await new Promise<any>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      if (entity) {
        entity.syncStatus = 'synced'
        await tx.objectStore(storeName).put(entity)
      }

      // Remove from sync queue
      const syncQueue = tx.objectStore('syncQueue')
      let cursorRequest = syncQueue.openCursor()
      
      while (cursorRequest) {
        const cursor = await new Promise<IDBCursorWithValue | null>((resolve, reject) => {
          cursorRequest.onsuccess = () => resolve(cursorRequest.result)
          cursorRequest.onerror = () => reject(cursorRequest.error)
        })
        if (!cursor) break

        const syncItem = cursor.value
        if (syncItem.type === type && 
            (syncItem.data?.id === id || syncItem.id.includes(id))) {
          await cursor.delete()
        }
        cursor.continue()
      }
    })

    await addAuditLogEntry({
      action: 'syncComplete',
      entityType: type,
      entityId: id
    })
  } catch (error) {
    await addAuditLogEntry({
      action: 'syncError',
      entityType: type,
      entityId: id,
      details: { error: error instanceof Error ? error.message : String(error) }
    })
    throw error
  }
}

// UTILITY FUNCTIONS
function generateId(): string {
  return crypto.randomUUID() || Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Initialize database on load
;(async () => {
  try {
    await ensureDBInitialized()
  } catch (error) {
    console.error("Initialization error:", error)
  }
})()