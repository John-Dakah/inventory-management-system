"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

export type StockItemFormData = {
  name: string
  sku: string
  category: string
  quantity: number
  location: string
  type: "Finished Good" | "Raw Material"
}

export type StockTransactionFormData = {
  stockItemId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  location: string
  reference?: string
  reason?: string
  notes?: string
}

export type StockFilter = {
  search?: string
  categories?: string[]
  locations?: string[]
  types?: string[]
  statuses?: string[]
  dateRange?: { from: string; to: string }
}

export async function getStockItems(filters?: StockFilter) {
  try {
    // Build the filter conditions
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters?.categories && filters.categories.length > 0) {
      where.category = { in: filters.categories }
    }

    if (filters?.locations && filters.locations.length > 0) {
      where.location = { in: filters.locations }
    }

    if (filters?.types && filters.types.length > 0) {
      where.type = { in: filters.types }
    }

    if (filters?.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses }
    }

    if (filters?.dateRange?.from && filters?.dateRange?.to) {
      where.lastUpdated = {
        gte: new Date(filters.dateRange.from),
        lte: new Date(filters.dateRange.to),
      }
    }

    const stockItems = await prisma.stockItem.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get unique values for filters
    const categories = await prisma.stockItem.findMany({
      select: { category: true },
      distinct: ["category"],
    })

    const locations = await prisma.stockItem.findMany({
      select: { location: true },
      distinct: ["location"],
    })

    const types = await prisma.stockItem.findMany({
      select: { type: true },
      distinct: ["type"],
    })

    const statuses = await prisma.stockItem.findMany({
      select: { status: true },
      distinct: ["status"],
    })

    return {
      stockItems,
      categories: categories.map((c) => c.category),
      locations: locations.map((l) => l.location),
      types: types.map((t) => t.type),
      statuses: statuses.map((s) => s.status),
    }
  } catch (error) {
    console.error("Failed to fetch stock items:", error)
    return { error: "Failed to fetch stock items" }
  }
}

export async function getStockStats() {
  try {
    // Get total items
    const totalItems = await prisma.stockItem.count()

    // Get total units
    const stockItems = await prisma.stockItem.findMany({
      select: { quantity: true },
    })
    const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0)

    // Get low stock and out of stock counts
    const lowStockItems = await prisma.stockItem.count({
      where: { status: "Low Stock" },
    })

    const outOfStockItems = await prisma.stockItem.count({
      where: { status: "Out of Stock" },
    })

    return {
      totalItems,
      totalUnits,
      lowStockItems,
      outOfStockItems,
    }
  } catch (error) {
    console.error("Failed to fetch stock stats:", error)
    return { error: "Failed to fetch stock statistics" }
  }
}

export async function addStockItem(data: StockItemFormData) {
  try {
    // Determine status based on quantity
    let status = "In Stock"
    if (data.quantity === 0) {
      status = "Out of Stock"
    } else if (data.quantity <= 10) {
      status = "Low Stock"
    }

    const stockItem = await prisma.stockItem.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        status: status,
        type: data.type,
        lastUpdated: new Date(),
      },
    })

    revalidatePath("/stock")
    return { stockItem }
  } catch (error) {
    console.error("Failed to add stock item:", error)
    return { error: "Failed to add stock item" }
  }
}

export async function updateStockItem(id: string, data: StockItemFormData) {
  try {
    // Determine status based on quantity
    let status = "In Stock"
    if (data.quantity === 0) {
      status = "Out of Stock"
    } else if (data.quantity <= 10) {
      status = "Low Stock"
    }

    const stockItem = await prisma.stockItem.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        status: status,
        type: data.type,
        lastUpdated: new Date(),
      },
    })

    revalidatePath("/stock")
    return { stockItem }
  } catch (error) {
    console.error("Failed to update stock item:", error)
    return { error: "Failed to update stock item" }
  }
}

export async function deleteStockItem(id: string) {
  try {
    // First delete all related transactions
    await prisma.stockTransaction.deleteMany({
      where: { stockItemId: id },
    })

    // Then delete the stock item
    await prisma.stockItem.delete({
      where: { id },
    })

    revalidatePath("/stock")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete stock item:", error)
    return { error: "Failed to delete stock item" }
  }
}

export async function recordStockTransaction(data: StockTransactionFormData) {
  try {
    // Get current stock item
    const stockItem = await prisma.stockItem.findUnique({
      where: { id: data.stockItemId },
    })

    if (!stockItem) {
      return { error: "Stock item not found" }
    }

    const previousQuantity = stockItem.quantity
    let newQuantity = previousQuantity

    // Calculate new quantity based on transaction type
    switch (data.type) {
      case "in":
        newQuantity = previousQuantity + data.quantity
        break
      case "out":
        newQuantity = Math.max(0, previousQuantity - data.quantity)
        break
      case "adjustment":
        newQuantity = data.quantity
        break
    }

    // Determine new status
    let status = "In Stock"
    if (newQuantity === 0) {
      status = "Out of Stock"
    } else if (newQuantity <= 10) {
      status = "Low Stock"
    }

    // Create transaction
    const transaction = await prisma.stockTransaction.create({
      data: {
        stockItemId: data.stockItemId,
        type: data.type,
        quantity: data.quantity,
        previousQuantity,
        newQuantity,
        location: data.location,
        reference: data.reference,
        reason: data.reason,
        notes: data.notes,
      },
    })

    // Update stock item
    await prisma.stockItem.update({
      where: { id: data.stockItemId },
      data: {
        quantity: newQuantity,
        status,
        lastUpdated: new Date(),
      },
    })

    revalidatePath("/stock")
    return { transaction }
  } catch (error) {
    console.error("Failed to record stock transaction:", error)
    return { error: "Failed to record stock transaction" }
  }
}

export async function getStockTransactions(stockItemId?: string) {
  try {
    const where = stockItemId ? { stockItemId } : {}

    const transactions = await prisma.stockTransaction.findMany({
      where,
      include: {
        stockItem: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { transactions }
  } catch (error) {
    console.error("Failed to fetch stock transactions:", error)
    return { error: "Failed to fetch stock transactions" }
  }
}

