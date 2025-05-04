import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)

    // Fetch products based on user role
    let products = []

    if (session.role === "sales_person") {
      // Sales persons can see all products (for selling purposes)
      products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Both admins and warehouse managers can only see their own products
      products = await prisma.product.findMany({
        where: {
          createdById: session.id,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ data: products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.sku || data.price === undefined || data.quantity === undefined) {
      return NextResponse.json({ error: "Name, SKU, price, and quantity are required" }, { status: 400 })
    }

    // Create the product with the current user as creator
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        sku: data.sku,
        price: Number.parseFloat(data.price),
        quantity: Number.parseInt(data.quantity),
        category: data.category || null,
        vendor: data.vendor || null,
        imageUrl: data.imageUrl || null,
        createdById: session.id, // Associate the product with the current user
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)

    // Handle unique constraint violations
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
