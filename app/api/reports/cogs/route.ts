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

    // Get all transaction items within the date range
    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        transaction: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          ...(session.role !== "sales_person" ? { cashierId: session.id } : {}),
        },
      },
      include: {
        product: true,
      },
    })

    // Calculate COGS
    // For simplicity, we'll use the product price as the cost
    // In a real system, you would use the actual cost of goods
    const cogs = transactionItems.reduce((total, item) => {
      // Only include products created by the current user if not a sales person
      if (session.role !== "sales_person" && item.product.createdById !== session.id) {
        return total
      }

      // Calculate cost (using 70% of price as a simple approximation)
      const cost = item.price * 0.7
      return total + cost * item.quantity
    }, 0)

    return NextResponse.json({ cogs })
  } catch (error) {
    console.error("Error calculating COGS:", error)
    return NextResponse.json({ error: "Failed to calculate COGS" }, { status: 500 })
  }
}
