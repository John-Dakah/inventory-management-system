import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET handler for fetching products
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || undefined
    const vendor = searchParams.get("vendor") || undefined
    const inStock = searchParams.get("inStock") === "true" ? true : undefined
    const outOfStock = searchParams.get("outOfStock") === "true" ? true : undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) whereClause.category = category
    if (vendor) whereClause.vendor = vendor
    if (inStock) whereClause.quantity = { gt: 0 }
    if (outOfStock) whereClause.quantity = { equals: 0 }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ])

    const response = {
      data: products.map((product) => ({
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
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: "Failed to fetch products", message: error.message }, { status: 500 })
  }
}

/**
 * POST handler for creating a new product
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.name || !data.sku) {
      return NextResponse.json(
        { error: "Missing required fields", details: "Name and SKU are required" },
        { status: 400 },
      )
    }

    const product = await prisma.product.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description || "",
        sku: data.sku,
        price: data.price || 0,
        quantity: data.quantity || 0,
        category: data.category || "",
        vendor: data.vendor || "",
        imageUrl: data.imageUrl || "",
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/products:", error)

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Duplicate record",
          message: "A product with this SKU already exists",
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: "Failed to create product", message: error.message }, { status: 500 })
  }
}
