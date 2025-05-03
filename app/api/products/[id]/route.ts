import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Adjust the import path if needed

/**
 * GET handler for fetching a specific product by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
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
    })
  } catch (error: any) {
    console.error(`Error in GET /api/products/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch product", message: error.message }, { status: 500 })
  }
}

/**
 * PUT handler for updating a product
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price !== undefined ? data.price : existingProduct.price,
        quantity: data.quantity !== undefined ? data.quantity : existingProduct.quantity,
        category: data.category,
        vendor: data.vendor,
        imageUrl: data.imageUrl,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error(`Error in PUT /api/products/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update product", message: error.message }, { status: 500 })
  }
}

/**
 * DELETE handler for removing a product
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const relatedStockItems = await prisma.stockItem.findMany({
      where: {
        OR: [{ name: existingProduct.name }, { sku: existingProduct.sku }],
      },
      select: { id: true },
    })

    if (relatedStockItems.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete product",
          message: "This product is associated with stock items and cannot be deleted",
          relatedItems: relatedStockItems.length,
        },
        { status: 409 },
      )
    }

    await prisma.product.delete({
      where: { id },
    })

    return new Response(null, { status: 204 })
  } catch (error: any) {
    console.error(`Error in DELETE /api/products/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete product", message: error.message }, { status: 500 })
  }
}
