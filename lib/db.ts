// Type definitions
import { PrismaClient } from "@prisma/client";
export interface Product {
  id: string
  name: string
  description?: string | null
  sku: string
  price: number
  quantity: number
  category?: string | null
  vendor?: string | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  createdById?: string | null
}
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  products: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
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
  createdById?: string | null
}

export interface StockTransaction {
  id: string
  stockItemId: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  location: string
  reference?: string
  reason?: string
  notes?: string
  createdAt: string
  createdById?: string | null
}

// Check if we're online
export function isOnline(): boolean {
  if (typeof navigator !== "undefined") {
    return navigator.onLine
  }
  return true
}
export async function saveSupplier(supplier: Supplier): Promise<Supplier> {
  // Example implementation
  try {
    const response = await fetch("/api/suppliers", {
      method: supplier.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplier),
    });

    if (!response.ok) {
      throw new Error("Failed to save supplier");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in saveSupplier:", error);
    throw error;
  }
}
// Client-side function to get current user from cookies
export async function getCurrentUser() {
  try {
    // For client-side, we'll use the /api/auth/me endpoint
    const response = await fetch("/api/auth/me")
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}


const prisma = new PrismaClient();

// Fetch all suppliers
export async function getSuppliers() {
  return await prisma.supplier.findMany();
}

// Fetch supplier statistics
export async function getSupplierStats() {
  const total = await prisma.supplier.count();
  const active = await prisma.supplier.count({ where: { status: "Active" } });
  const onHold = await prisma.supplier.count({ where: { status: "On Hold" } });
  const inactive = await prisma.supplier.count({ where: { status: "Inactive" } });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = await prisma.supplier.count({
    where: { createdAt: { gte: firstDayOfMonth } },
  });

  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

  return {
    total,
    active,
    onHold,
    inactive,
    newThisMonth,
    activePercentage,
  };
}
// Get products - modified to only return products created by the current user
export async function getProducts(): Promise<Product[]> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // If online, fetch from API
    if (isOnline()) {
      const response = await fetch("/api/stock/products", {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products from API")
      }

      const data = await response.json()
      return data.products || []
    } else {
      // If offline, get from IndexedDB
      // This would need to be implemented with IndexedDB filtering by createdById
      const cachedProducts = await getCachedProducts()

      // Filter by current user ID
      return cachedProducts.filter((product) => product.createdById === currentUser.id)
    }
  } catch (error) {
    console.error("Error fetching products:", error)

    // Try to get from cache as fallback
    const cachedProducts = await getCachedProducts()
    const currentUser = await getCurrentUser()

    // Filter by current user ID if we have a user
    if (currentUser) {
      return cachedProducts.filter((product) => product.createdById === currentUser.id)
    }

    return cachedProducts
  }
}

// Get a specific product
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // If online, fetch from API
    if (isOnline()) {
      const response = await fetch(`/api/products/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }

      const product = await response.json()

      // Check if the product belongs to the current user
      if (currentUser.role !== "sales_person" && product.createdById !== currentUser.id) {
        return null
      }

      return product
    } else {
      // If offline, get from IndexedDB
      const cachedProducts = await getCachedProducts()
      const product = cachedProducts.find((p) => p.id === id)

      // Check if the product belongs to the current user
      if (product && currentUser.role !== "sales_person" && product.createdById !== currentUser.id) {
        return null
      }

      return product || null
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

// Get stock items - modified to only return items related to products created by the current user
export async function getStockItems(): Promise<StockItem[]> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // If online, fetch from API
    if (isOnline()) {
      const response = await fetch("/api/stock/items", {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stock items")
      }

      const data = await response.json()
      return data.items || []
    } else {
      // If offline, get from IndexedDB
      // This would need to be implemented with IndexedDB
      const cachedItems = await getCachedStockItems()

      // Filter by current user ID
      if (currentUser.role === "sales_person") {
        return cachedItems
      } else {
        return cachedItems.filter((item) => item.createdById === currentUser.id)
      }
    }
  } catch (error) {
    console.error("Error fetching stock items:", error)

    // Try to get from cache as fallback
    const cachedItems = await getCachedStockItems()
    const currentUser = await getCurrentUser()

    // Filter by current user ID if we have a user
    if (currentUser && currentUser.role !== "sales_person") {
      return cachedItems.filter((item) => item.createdById === currentUser.id)
    }

    return cachedItems
  }
}

// Save a stock item - add createdById
export async function saveStockItem(item: StockItem): Promise<StockItem> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Add the current user ID to the item
    const itemWithUser = {
      ...item,
      createdById: currentUser.id,
    }

    // If online, save to API
    if (isOnline()) {
      const response = await fetch("/api/stock/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemWithUser),
      })

      if (!response.ok) {
        throw new Error("Failed to save stock item")
      }

      const savedItem = await response.json()

      // Also save to IndexedDB for offline access
      await cacheStockItem(savedItem)

      return savedItem
    } else {
      // If offline, save to IndexedDB
      await cacheStockItem(itemWithUser)
      return itemWithUser
    }
  } catch (error) {
    console.error("Error saving stock item:", error)
    throw error
  }
}

// Record a stock transaction - add createdById
export async function recordStockTransaction(transaction: StockTransaction): Promise<StockTransaction> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Add the current user ID to the transaction
    const transactionWithUser = {
      ...transaction,
      createdById: currentUser.id,
    }

    // If online, save to API
    if (isOnline()) {
      const response = await fetch("/api/stock/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionWithUser),
      })

      if (!response.ok) {
        throw new Error("Failed to record stock transaction")
      }

      const savedTransaction = await response.json()

      // Also save to IndexedDB for offline access
      await cacheStockTransaction(savedTransaction)

      return savedTransaction
    } else {
      // If offline, save to IndexedDB
      await cacheStockTransaction(transactionWithUser)
      return transactionWithUser
    }
  } catch (error) {
    console.error("Error recording stock transaction:", error)
    throw error
  }
}

// These are placeholder functions that would be implemented in the actual code
export async function getCachedProducts(): Promise<Product[]> {
  // Implementation would use IndexedDB to get cached products
  return []
}

export async function getCachedStockItems(): Promise<StockItem[]> {
  // Implementation would use IndexedDB to get cached stock items
  return []
}

export async function cacheStockItem(item: StockItem): Promise<void> {
  // Implementation would use IndexedDB to cache a stock item
}

export async function cacheStockTransaction(transaction: StockTransaction): Promise<void> {
  // Implementation would use IndexedDB to cache a stock transaction
}

export async function getStockStats(): Promise<any> {
  try {
    const response = await fetch("/api/stock/stats")
    if (!response.ok) {
      throw new Error("Failed to fetch stock stats")
    }
    return await response.json()
  } catch (error) {
<<<<<<< HEAD
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

    if (!stockResult.length || !productsResult.length) {
      return {
        success: false,
        message: "Failed to fetch latest data from database",
      }
    }

    // Update IndexedDB with the latest data
    await saveStockItemToDB(stockResult.data)
    saveProductsToIndexedDB(productsResult)

=======
    console.error("Error fetching stock stats:", error)
    // Return default stats
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
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

export async function forceSyncAllData(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("/api/sync", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to sync data")
    }

    return await response.json()
  } catch (error) {
    console.error("Error syncing data:", error)
    return {
      success: false,
      message: "Failed to synchronize data. Please try again later.",
    }
  }
}

export async function storePendingTransaction(transaction: any): Promise<void> {
  // Implementation would store a pending transaction
}

export async function getPendingTransactions(): Promise<any[]> {
  // Implementation would get pending transactions
  return []
}

export async function markTransactionSynced(id: string): Promise<void> {
  // Implementation would mark a transaction as synced
}

export async function deleteTransaction(id: string): Promise<void> {
  // Implementation would delete a transaction
}

export async function saveProduct(product: Product): Promise<Product> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Add the current user ID to the product if it's a new product
    const productWithUser = {
      ...product,
      createdById: product.createdById || currentUser.id,
    }

    // If online, save to API
    if (isOnline()) {
      const method = product.id ? "PUT" : "POST"
      const url = product.id ? `/api/products/${product.id}` : "/api/products"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productWithUser),
      })

      if (!response.ok) {
        throw new Error("Failed to save product")
      }

      const savedProduct = await response.json()

      // Also save to IndexedDB for offline access
      await cacheProduct(savedProduct)

      return savedProduct
    } else {
      // If offline, save to IndexedDB
      await cacheProduct(productWithUser)
      return productWithUser
    }
  } catch (error) {
    console.error("Error saving product:", error)
    throw error
  }
}

export async function cacheProduct(product: Product): Promise<void> {
  // Implementation would use IndexedDB to cache a product
}

export async function cacheProducts(products: Product[]): Promise<void> {
  // Implementation would cache products
}

export async function getCachedCustomers(): Promise<any[]> {
  // Implementation would get cached customers
  return []
}

export async function cacheCustomers(customers: any[]): Promise<void> {
  // Implementation would cache customers
}

export async function registerServiceWorker(): Promise<void> {
  // Implementation would register a service worker
}
