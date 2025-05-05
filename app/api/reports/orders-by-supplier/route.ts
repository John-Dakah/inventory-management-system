import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const { whereClause } = await request.json()

    // Apply role-based filtering
    const finalWhereClause = session.role !== "sales_person" ? { createdById: session.id } : whereClause || {}

    // Get suppliers
    const suppliers = await prisma.supplier.findMany({
      where: finalWhereClause,
      select: {
        id: true,
        name: true,
      },
    })

    // Since we don't have a direct orders table, we'll use stock transactions as a proxy
    // In a real system, you would query an orders or purchase_orders table
    const stockTransactions = await prisma.stockTransaction.findMany({
      where: {
        ...finalWhereClause,
        type: "in", // Assuming "in" transactions represent orders
      },
      select: {
        id: true,
        reference: true,
      },
    })

    // Randomly assign transactions to suppliers for demonstration
    // In a real system, you would have a proper relationship between orders and suppliers
    const result = suppliers.map((supplier) => {
      // Assign a random number of orders to each supplier
      const orderCount = Math.floor(Math.random() * 20) + 5

      return {
        name: supplier.name,
        orders: orderCount,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching orders by supplier:", error)
    return NextResponse.json({ error: "Failed to fetch orders by supplier" }, { status: 500 })
  }
}
