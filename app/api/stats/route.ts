import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * GET handler for fetching system statistics
 */
export async function GET(request: NextRequest) {
  try {
    const [
      totalItems,
      totalUnits,
      lowStockItems,
      outOfStockItems,
      categories,
      locations,
      types,
      totalProducts,
      totalTransactions,
      recentTransactions,
    ] = await Promise.all([
      // Total stock items
      prisma.stockItem.count(),

      // Total units in stock
      prisma.stockItem.aggregate({
        _sum: {
          quantity: true,
        },
      }),

      // Count of low stock items
      prisma.stockItem.count({
        where: {
          quantity: {
            gt: 0,
            lte: 10,
          },
        },
      }),

      // Count of out of stock items
      prisma.stockItem.count({
        where: {
          quantity: 0,
        },
      }),

      // Distinct categories
      prisma.stockItem.findMany({
        select: {
          category: true,
        },
        distinct: ["category"],
        where: {
          category: {
            not: null,
            not: "",
          },
        },
      }),

      // Distinct locations
      prisma.stockItem.findMany({
        select: {
          location: true,
        },
        distinct: ["location"],
        where: {
          location: {
            not: null,
            not: "",
          },
        },
      }),

      // Distinct types
      prisma.stockItem.findMany({
        select: {
          type: true,
        },
        distinct: ["type"],
        where: {
          type: {
            not: null,
            not: "",
          },
        },
      }),

      // Total products
      prisma.product.count(),

      // Total transactions
      prisma.stockTransaction.count(),

      // Recent transactions
      prisma.stockTransaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          stockItem: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      }),
    ])

    // Format and return the data
    return NextResponse.json({
      stockSummary: {
        totalItems,
        totalUnits: Number(totalUnits._sum.quantity || 0),
        lowStockItems,
        outOfStockItems,
      },
      categories: categories.map((c) => c.category || "").filter(Boolean),
      locations: locations.map((l) => l.location || "").filter(Boolean),
      types: types.map((t) => t.type || "").filter(Boolean),
      systemStats: {
        totalProducts,
        totalTransactions,
        recentActivity: recentTransactions.map((t) => ({
          id: t.id,
          type: t.type,
          quantity: t.quantity,
          itemName: t.stockItem?.name || "Unknown Item",
          itemSku: t.stockItem?.sku || "Unknown SKU",
          createdAt: t.createdAt.toISOString(),
        })),
      },
    })
  } catch (error: any) {
    console.error("Error in GET /api/stats:", error)
    return NextResponse.json({ error: "Failed to fetch system statistics", message: error.message }, { status: 500 })
  }
}
