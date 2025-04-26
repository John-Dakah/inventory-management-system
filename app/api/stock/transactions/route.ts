import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * GET handler for fetching stock transactions
 * Supports filtering by stockItemId and transaction type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const stockItemId = searchParams.get("stockItemId")
    const type = searchParams.get("type") // "in", "out", "adjustment"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build filter conditions
    const whereClause: any = {}

    if (stockItemId) whereClause.stockItemId = stockItemId
    if (type) whereClause.type = type

    // Execute query with pagination
    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          stockItem: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      }),
      prisma.stockTransaction.count({ where: whereClause }),
    ])

    // Map the response data
    const response = {
      data: transactions.map((transaction) => ({
        id: transaction.id,
        stockItemId: transaction.stockItemId,
        stockItemName: transaction.stockItem?.name || "Unknown",
        stockItemSku: transaction.stockItem?.sku || "Unknown",
        type: transaction.type,
        quantity: transaction.quantity,
        previousQuantity: transaction.previousQuantity,
        newQuantity: transaction.newQuantity,
        location: transaction.location,
        reference: transaction.reference,
        reason: transaction.reason,
        notes: transaction.notes,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        metadata: transaction.metadata,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error in GET /api/stock/transactions:", error)
    return NextResponse.json({ error: "Failed to fetch stock transactions", message: error.message }, { status: 500 })
  }
}

/**
 * POST handler for creating a stock transaction
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (
      !data.stockItemId ||
      data.quantity === undefined ||
      data.previousQuantity === undefined ||
      data.newQuantity === undefined
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "stockItemId, quantity, previousQuantity, and newQuantity are required",
        },
        { status: 400 },
      )
    }

    // Start a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.stockTransaction.create({
        data: {
          id: data.id, // Use provided ID or let Prisma generate one
          stockItemId: data.stockItemId,
          type: data.type || "adjustment",
          quantity: data.quantity,
          previousQuantity: data.previousQuantity,
          newQuantity: data.newQuantity,
          location: data.location,
          reference: data.reference,
          reason: data.reason,
          notes: data.notes,
          metadata: data.metadata || {},
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: new Date(),
        },
      })

      // Update the related stock item
      await tx.stockItem.update({
        where: { id: data.stockItemId },
        data: {
          quantity: data.newQuantity,
          lastUpdated: new Date(),
          updatedAt: new Date(),
          status: data.newQuantity === 0 ? "Out of Stock" : data.newQuantity <= 10 ? "Low Stock" : "In Stock",
        },
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/stock/transactions:", error)

    // Check for foreign key constraint violations
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Invalid reference",
          message: "The referenced stock item does not exist",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Failed to create stock transaction", message: error.message }, { status: 500 })
  }
}
