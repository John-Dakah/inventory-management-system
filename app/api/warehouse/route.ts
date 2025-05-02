import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined
  const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined

  try {
    // Fetch products with proper field selection based on your schema
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        price: true,
        quantity: true,
        category: true,
        vendor: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Fetch stock items with proper field selection
    const stockItems = await prisma.stockItem.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        quantity: true,
        location: true,
        status: true,
        type: true,
        lastUpdated: true,
        createdAt: true,
        updatedAt: true,
        transactions: {
          select: {
            id: true,
            type: true,
            quantity: true,
            previousQuantity: true,
            newQuantity: true,
            location: true,
            reference: true,
            reason: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    // Fetch stock transactions with date filtering
    const stockTransactions = await prisma.stockTransaction.findMany({
      where: {
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      },
      include: {
        stockItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Fetch suppliers
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
        contactPerson: true,
        email: true,
        phone: true,
        products: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      products,
      stockItems,
      stockTransactions,
      suppliers,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch warehouse data" }, { status: 500 })
  }
}
