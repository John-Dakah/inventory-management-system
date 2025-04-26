import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * GET handler for fetching a specific stock item by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const item = await prisma.stockItem.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10, 
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    return NextResponse.json({
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
      recentTransactions: item.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        quantity: t.quantity,
        previousQuantity: t.previousQuantity,
        newQuantity: t.newQuantity,
        createdAt: t.createdAt.toISOString(),
        reason: t.reason || null,
      })),
    })
  } catch (error: any) {
    console.error(`Error in GET /api/stock/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch stock item", message: error.message }, { status: 500 })
  }
}

/**
 * PUT handler for updating a stock item
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Check if the item exists
    const existingItem = await prisma.stockItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    // Update the stock item
    const updatedItem = await prisma.stockItem.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity !== undefined ? data.quantity : existingItem.quantity,
        location: data.location,
        status: data.status,
        type: data.type,
        lastUpdated: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error(`Error in PUT /api/stock/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update stock item", message: error.message }, { status: 500 })
  }
}

/**
 * DELETE handler for removing a stock item
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if the item exists
    const existingItem = await prisma.stockItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    // Delete the stock item
    await prisma.stockItem.delete({
      where: { id },
    })

    return new Response(null, { status: 204 })
  } catch (error: any) {
    console.error(`Error in DELETE /api/stock/${params.id}:`, error)

    // Check for reference constraints
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Cannot delete stock item",
          message: "This item is referenced by transactions and cannot be deleted",
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: "Failed to delete stock item", message: error.message }, { status: 500 })
  }
}
