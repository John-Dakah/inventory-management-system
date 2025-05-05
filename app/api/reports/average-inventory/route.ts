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
    const { whereClause, startDate, endDate } = await request.json()

    // Apply role-based filtering
    const finalWhereClause = session.role !== "sales_person" ? { createdById: session.id } : whereClause || {}

    // Get all products
    const products = await prisma.product.findMany({
      where: finalWhereClause,
      select: {
        id: true,
        price: true,
        quantity: true,
      },
    })

    // Calculate current inventory value
    const currentInventoryValue = products.reduce((total, product) => {
      return total + product.price * product.quantity
    }, 0)

    // Since we don't have historical inventory data, we'll use the current inventory value
    // In a real system, you would calculate the average from multiple inventory snapshots
    const averageInventory = currentInventoryValue

    return NextResponse.json({ averageInventory })
  } catch (error) {
    console.error("Error calculating average inventory:", error)
    return NextResponse.json({ error: "Failed to calculate average inventory" }, { status: 500 })
  }
}
