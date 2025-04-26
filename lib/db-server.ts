"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import type { StockItem, StockTransaction, Product } from "./db"

// Initialize Prisma client
const prisma = new PrismaClient()

// Get stock items from database
export async function getStockItemsFromDB(): Promise<StockItem[]> {
  try {
    const items = await prisma.stockItem.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    })

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category || "",
      quantity: Number(item.quantity),
      location: item.location || "",
      status: item.status || "In Stock",
      type: item.type || "Finished Good",
      lastUpdated: item.lastUpdated.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Database error fetching stock items:", error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

// Save stock item to database
export async function saveStockItemToDB(item: StockItem): Promise<StockItem> {
  try {
    const savedItem = await prisma.stockItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        location: item.location,
        status: item.status,
        type: item.type,
        lastUpdated: new Date(item.lastUpdated),
      },
      create: {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        location: item.location,
        status: item.status,
        type: item.type,
        lastUpdated: new Date(item.lastUpdated),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    })

    revalidatePath("/stock")

    return {
      ...item,
      id: savedItem.id,
    }
  } catch (error) {
    console.error("Database error saving stock item:", error)
    throw new Error("Failed to save stock item to database")
  }
}

// Record stock transaction in database
export async function recordStockTransactionToDB(transaction: StockTransaction): Promise<StockTransaction> {
  try {
    // Use Prisma transaction to ensure both operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      const savedTransaction = await tx.stockTransaction.create({
        data: {
          id: transaction.id,
          type: transaction.type,
          quantity: transaction.quantity,
          previousQuantity: transaction.previousQuantity,
          newQuantity: transaction.newQuantity,
          location: transaction.location,
          reference: transaction.reference,
          reason: transaction.reason,
          notes: transaction.notes,
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(),
          stockItemId: transaction.stockItemId,
          metadata: transaction.metadata || {},
        },
      })

      // Also update the related stock item
      if (transaction.stockItemId) {
        await tx.stockItem.update({
          where: { id: transaction.stockItemId },
          data: {
            quantity: transaction.newQuantity,
            lastUpdated: new Date(),
            updatedAt: new Date(),
            status:
              transaction.newQuantity === 0 ? "Out of Stock" : transaction.newQuantity <= 10 ? "Low Stock" : "In Stock",
          },
        })
      }

      revalidatePath("/stock")

      return transaction
    })
  } catch (error) {
    console.error("Database error recording stock transaction:", error)
    throw new Error("Failed to record stock transaction in database")
  }
}

// Get products from database
export async function getProductsFromDB(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    })

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      category: product.category || "",
      vendor: product.vendor || "",
      imageUrl: product.imageUrl || "",
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Database error fetching products:", error)
    throw new Error("Failed to fetch products from database")
  }
}

// Save product to database
export async function saveProductToDB(product: Product): Promise<Product> {
  try {
    const savedProduct = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        vendor: product.vendor,
        imageUrl: product.imageUrl,
        updatedAt: new Date(),
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        vendor: product.vendor,
        imageUrl: product.imageUrl,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    })

    revalidatePath("/stock")

    return {
      ...product,
      id: savedProduct.id,
    }
  } catch (error) {
    console.error("Database error saving product:", error)
    throw new Error("Failed to save product to database")
  }
}

// Get stock stats from database
export async function getStockStatsFromDB() {
  try {
    const [totalItems, totalUnits, lowStockItems, outOfStockItems, categories, locations, types] = await Promise.all([
      prisma.stockItem.count(),
      prisma.stockItem.aggregate({
        _sum: {
          quantity: true,
        },
      }),
      prisma.stockItem.count({
        where: {
          quantity: {
            gt: 0,
            lte: 10,
          },
        },
      }),
      prisma.stockItem.count({
        where: {
          quantity: 0,
        },
      }),
      prisma.stockItem.findMany({
        select: {
          category: true,
        },
        distinct: ["category"],
        where: {
          category: {
            not: null,
          },
        },
      }),
      prisma.stockItem.findMany({
        select: {
          location: true,
        },
        distinct: ["location"],
        where: {
          location: {
            not: null,
          },
        },
      }),
      prisma.stockItem.findMany({
        select: {
          type: true,
        },
        distinct: ["type"],
        where: {
          type: {
            not: null,
          },
        },
      }),
    ])

    return {
      totalItems,
      totalUnits: Number(totalUnits._sum.quantity || 0),
      lowStockItems,
      outOfStockItems,
      categories: categories.map((c) => c.category || "").filter(Boolean),
      locations: locations.map((l) => l.location || "").filter(Boolean),
      types: types.map((t) => t.type || "").filter(Boolean),
    }
  } catch (error) {
    console.error("Database error fetching stock stats:", error)
    throw new Error("Failed to fetch stock stats from database")
  }
}
