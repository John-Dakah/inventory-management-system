// Type definitions
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

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  products: string
  status: string
  createdAt: string
  updatedAt: string
  createdById?: string | null
}

// Check if we're online
export function isOnline(): boolean {
  if (typeof navigator !== "undefined") {
    return navigator.onLine
  }
  return true
}

import { openDB } from "idb";
 // Ensure the path is correct

const DB_NAME = "stock_management_db";
const DB_VERSION = 1;
const TRANSACTIONS_STORE = "stock_transactions";

// Initialize IndexedDB
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        db.createObjectStore(TRANSACTIONS_STORE, { keyPath: "id" });
      }
    },
  });
}

// Function to retrieve cached stock transactions
export async function getCachedStockTransactions(): Promise<StockTransaction[]> {
  try {
    const db = await getDB();
    return await db.getAll(TRANSACTIONS_STORE);
  } catch (error) {
    console.error("Failed to retrieve cached stock transactions:", error);
    return [];
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
export async function getStockTransactions(): Promise<StockTransaction[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // If online, fetch from API
    if (isOnline()) {
      const response = await fetch("/api/stock/transactions", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stock transactions");
      }

      const data = await response.json();

      // Filter transactions based on the current user's role
      if (currentUser.role !== "sales_person") {
        return data.transactions.filter(
          (transaction: StockTransaction) => transaction.createdById === currentUser.id
        );
      }

      return data.transactions;
    } else {
      // If offline, get from IndexedDB
      const cachedTransactions = await getCachedStockTransactions();

      // Filter transactions based on the current user's role
      if (currentUser.role !== "sales_person") {
        return cachedTransactions.filter(
          (transaction) => transaction.createdById === currentUser.id
        );
      }

      return cachedTransactions;
    }
  } catch (error) {
    console.error("Error fetching stock transactions:", error);
    return [];
  }
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

// Get suppliers - modified to only return suppliers created by the current user
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // If online, fetch from API
    if (isOnline()) {
      const response = await fetch("/api/suppliers", {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers from API")
      }

      const data = await response.json()
      return data.suppliers || []
    } else {
      // If offline, get from IndexedDB
      const cachedSuppliers = await getCachedSuppliers()

      // Filter by current user ID
      if (currentUser.role === "sales_person") {
        return cachedSuppliers
      } else {
        return cachedSuppliers.filter((supplier) => supplier.createdById === currentUser.id)
      }
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error)

    // Try to get from cache as fallback
    const cachedSuppliers = await getCachedSuppliers()
    const currentUser = await getCurrentUser()

    // Filter by current user ID if we have a user
    if (currentUser && currentUser.role !== "sales_person") {
      return cachedSuppliers.filter((supplier) => supplier.createdById === currentUser.id)
    }

    return cachedSuppliers
  }
}

// Get a specific supplier
export async function getSupplier(id: string): Promise<Supplier | null> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // If online, fetch from API
    if (isOnline()) {
      const response = await fetch(`/api/suppliers/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch supplier")
      }

      const supplier = await response.json()

      // Check if the supplier belongs to the current user
      if (currentUser.role !== "sales_person" && supplier.createdById !== currentUser.id) {
        return null
      }

      return supplier
    } else {
      // If offline, get from IndexedDB
      const cachedSuppliers = await getCachedSuppliers()
      const supplier = cachedSuppliers.find((s) => s.id === id)

      // Check if the supplier belongs to the current user
      if (supplier && currentUser.role !== "sales_person" && supplier.createdById !== currentUser.id) {
        return null
      }

      return supplier || null
    }
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return null
  }
}

// Save a supplier - add createdById
export async function saveSupplier(supplier: Supplier): Promise<Supplier> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Add the current user ID to the supplier if it's a new supplier
    const supplierWithUser = {
      ...supplier,
      createdById: supplier.createdById || currentUser.id,
    }

    // If online, save to API
    if (isOnline()) {
      const method = supplier.id ? "PUT" : "POST"
      const url = supplier.id ? `/api/suppliers/${supplier.id}` : "/api/suppliers"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierWithUser),
      })

      if (!response.ok) {
        throw new Error("Failed to save supplier")
      }

      const savedSupplier = await response.json()

      // Also save to IndexedDB for offline access
      await cacheSupplier(savedSupplier)

      return savedSupplier
    } else {
      // If offline, save to IndexedDB
      await cacheSupplier(supplierWithUser)
      return supplierWithUser
    }
  } catch (error) {
    console.error("Error saving supplier:", error)
    throw error
  }
}

// Delete a supplier
export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // If online, delete from API
    if (isOnline()) {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete supplier")
      }

      // Also delete from IndexedDB
      await removeCachedSupplier(id)

      return true
    } else {
      // If offline, mark for deletion in IndexedDB
      await markSupplierForDeletion(id)
      return true
    }
  } catch (error) {
    console.error("Error deleting supplier:", error)
    throw error
  }
}

// Get supplier statistics
export async function getSupplierStats(): Promise<{
  total: number
  active: number
  newThisMonth: number
  activePercentage: number
  onHold: number
  inactive: number
}> {
  try {
    const response = await fetch("/api/suppliers/stats")
    if (!response.ok) {
      throw new Error("Failed to fetch supplier stats")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching supplier stats:", error)
    // Return default stats
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

export async function getCachedSuppliers(): Promise<Supplier[]> {
  // Implementation would use IndexedDB to get cached suppliers
  return []
}

export async function cacheStockItem(item: StockItem): Promise<void> {
  // Implementation would use IndexedDB to cache a stock item
}

export async function cacheStockTransaction(transaction: StockTransaction): Promise<void> {
  // Implementation would use IndexedDB to cache a stock transaction
}

export async function cacheSupplier(supplier: Supplier): Promise<void> {
  // Implementation would use IndexedDB to cache a supplier
}

export async function removeCachedSupplier(id: string): Promise<void> {
  // Implementation would use IndexedDB to remove a cached supplier
}

export async function markSupplierForDeletion(id: string): Promise<void> {
  // Implementation would mark a supplier for deletion in IndexedDB
}

export async function getStockStats(): Promise<any> {
  try {
    const response = await fetch("/api/stock/stats")
    if (!response.ok) {
      throw new Error("Failed to fetch stock stats")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching stock stats:", error)
    // Return default stats
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
