import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * GET handler for fetching stock items
 * Supports query parameters for filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || undefined
    const location = searchParams.get("location") || undefined
    const status = searchParams.get("status") || undefined
    const type = searchParams.get("type") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Build filter conditions
    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) whereClause.category = category
    if (location) whereClause.location = location
    if (status) whereClause.status = status
    if (type) whereClause.type = type

    // Execute query with pagination
    const [items, total] = await Promise.all([
      prisma.stockItem.findMany({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockItem.count({ where: whereClause }),
    ])

    // Map the response data
    const response = {
      data: items.map((item) => ({
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
    console.error("Error in GET /api/stock:", error)
    return NextResponse.json({ error: "Failed to fetch stock items", message: error.message }, { status: 500 })
  }
}

/**
 * POST handler for creating new stock items
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.sku) {
      return NextResponse.json(
        { error: "Missing required fields", details: "Name and SKU are required" },
        { status: 400 },
      )
    }

    // Create the stock item
    const item = await prisma.stockItem.create({
      data: {
        id: data.id,
        name: data.name,
        sku: data.sku,
        category: data.category || "",
        quantity: data.quantity || 0,
        location: data.location || "",
        status: data.status || "In Stock",
        type: data.type || "Finished Good",
        lastUpdated: new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/stock:", error)

    // Check for unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Duplicate record",
          message: "A stock item with this SKU already exists",
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: "Failed to create stock item", message: error.message }, { status: 500 })
  }
}
