import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const id = params.id

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        sku: true,
        price: true,
        quantity: true,
        category: true,
        vendor: true,
        imageUrl: true,
        createdById: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has permission to access this product
    if (session.role !== "sales_person" && product.createdById !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const id = params.id
    const data = await request.json()

    // Find the product first to check permissions
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has permission to update this product
    if (existingProduct.createdById !== session.id) {
      return NextResponse.json({ error: "Unauthorized to update this product" }, { status: 403 })
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        sku: data.sku,
        price: Number.parseFloat(data.price),
        quantity: Number.parseInt(data.quantity),
        category: data.category || null,
        vendor: data.vendor || null,
        imageUrl: data.imageUrl || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)

    // Handle unique constraint violations
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const id = params.id

    // Find the product first to check permissions
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has permission to delete this product
    if (existingProduct.createdById !== session.id) {
      return NextResponse.json({ error: "Unauthorized to delete this product" }, { status: 403 })
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
