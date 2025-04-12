import { v4 as uuidv4 } from "uuid"
import { getDB } from "../db-utils"
import { addToSyncQueue } from "./sync-manager"
import { getProduct, saveProduct } from "./product-service"
import type { Product, StockItem, StockTransaction } from "../types"

// Get all stock items
export async function getStockItems(filter?: {
  search?: string
  category?: string
  location?: string
  status?: string
  type?: string
}): Promise<StockItem[]> {
  try {
    const db = await getDB()
    let stockItems = await (db as any).getAll("stockItems")

    // Apply filters if provided
    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        stockItems = stockItems.filter(
          (item: StockItem) => item.name.toLowerCase().includes(searchTerm) || item.sku.toLowerCase().includes(searchTerm),
        )
      }

      if (filter.category) {
        stockItems = stockItems.filter((item: StockItem) => item.category === filter.category)
      }

      if (filter.location) {
        stockItems = stockItems.filter((item: StockItem) => item.location === filter.location)
      }

      if (filter.status) {
        stockItems = stockItems.filter((item: StockItem) => item.status === filter.status)
      }

      if (filter.type) {
        stockItems = stockItems.filter((item: StockItem) => item.type === filter.type)
      }
    }

    return stockItems
  } catch (error) {
    console.error("Error getting stock items:", error)
    return []
  }
}

// Get stock levels summary
export async function getStockLevels(): Promise<{
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
}> {
  try {
    const products = await getProduct()
    
    const total = products.length
    const inStock = products.filter(p => p.quantity > 5).length
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length
    const outOfStock = products.filter(p => p.quantity === 0).length
    
    return {
      total,
      inStock,
      lowStock,
      outOfStock
    }
  } catch (error) {
    console.error("Error getting stock levels:", error)
    return {
      total: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0
    }
  }
}

// Update product quantity with transaction
export async function updateProductQuantity(
  productId: string,
  change: number,
  reason?: string
): Promise<Product | null> {
  try {
    const product = await getProduct(productId)

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`)
    }

    const previousQuantity = product.quantity
    let newQuantity = previousQuantity

    // Update quantity based on change
    if (change > 0) {
      newQuantity = previousQuantity + change
    } else if (change < 0) {
      newQuantity = Math.max(0, previousQuantity + change)
    }

    // Create transaction record
    const transaction: StockTransaction = {
      id: uuidv4(),
      stockItemId: productId,
      type: change > 0 ? "RECEIVE" : "ISSUE",
      quantity: Math.abs(change),
      previousQuantity,
      newQuantity,
      location: "Warehouse",
      reference: "",
      reason,
      notes: `Stock adjustment: ${change > 0 ? "Added" : "Removed"} ${Math.abs(change)} units`,
      createdAt: new Date(),
    }

    await createStockTransaction(transaction)

    // Update product
    const updatedProduct = {
      ...product,
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    }

    await saveProduct(updatedProduct)

    return updatedProduct
  } catch (error) {
    console.error(`Error updating stock quantity for ${productId}:`, error)
    throw error
  }
}

// Create stock transaction
export async function createStockTransaction(transaction: StockTransaction): Promise<string> {
  try {
    const db = await getDB()

    // Ensure transaction has an ID
    if (!transaction.id) {
      transaction.id = uuidv4()
    }

    // Save to IndexedDB
    await (db as any).put("stockTransactions", transaction)

    // Add to sync queue
    const now = Date.now()
    await addToSyncQueue({
      id: `stockTransaction-${transaction.id}-${now}`,
      operation: "create",
      data: transaction,
      type: "stockTransaction",
      timestamp: now,
    })

    return transaction.id
  } catch (error) {
    console.error("Error creating stock transaction:", error)
    throw error
  }
}

// Get stock transactions
export async function getStockTransactions(filter?: {
  stockItemId?: string
  type?: string
  startDate?: Date
  endDate?: Date
}): Promise<StockTransaction[]> {
  try {
    const db = await getDB()
    let transactions = await (db as any).getAll("stockTransactions")

    // Apply filters if provided
    if (filter) {
      if (filter.stockItemId) {
        transactions = transactions.filter((tx: StockTransaction) => tx.stockItemId === filter.stockItemId)
      }

      if (filter.type) {
        transactions = transactions.filter((tx: StockTransaction) => tx.type === filter.type)
      }

      if (filter.startDate) {
        transactions = transactions.filter((tx: StockTransaction) => new Date(tx.createdAt) >= filter.startDate)
      }

      if (filter.endDate) {
        transactions = transactions.filter((tx: StockTransaction) => new Date(tx.createdAt) <= filter.endDate)
      }
    }

    // Sort by date, newest first
    transactions.sort((a: StockTransaction, b: StockTransaction) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return transactions
  } catch (error) {
    console.error("Error getting stock transactions:", error)
    return []
  }
}

// Get stock categories
export async function getStockCategories(): Promise<string[]> {
  try {
    const stockItems = await getStockItems()
    const categories = [...new Set(stockItems.map((item: StockItem) => item.category))]
    return categories
  } catch (error) {
    console.error("Error getting stock categories:", error)
    return []
  }
}

// Get stock locations
export async function getStockLocations(): Promise<string[]> {
  try {
    const stockItems = await getStockItems()
    const locations = [...new Set(stockItems.map((item: StockItem) => item.location))]
    return locations
  } catch (error) {
    console.error("Error getting stock locations:", error)
    return []
  }
}
