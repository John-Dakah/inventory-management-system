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

    // Get all stock transactions within the date range
    const stockTransactions = await prisma.stockTransaction.findMany({
      where: {
        ...finalWhereClause,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    })

    // Group transactions by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData = new Map()

    // Initialize data for all months in the range
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const currentDate = new Date(startDateObj)

    while (currentDate <= endDateObj) {
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
      const monthLabel = months[currentDate.getMonth()]

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthLabel,
          stockIn: 0,
          stockOut: 0,
          monthIndex: currentDate.getMonth(),
          year: currentDate.getFullYear(),
        })
      }

      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Process transactions
    stockTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt)
      const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`

      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey)

        if (transaction.type === "in") {
          monthData.stockIn += transaction.quantity
        } else if (transaction.type === "out") {
          monthData.stockOut += transaction.quantity
        } else if (transaction.type === "adjustment") {
          const difference = transaction.newQuantity - transaction.previousQuantity
          if (difference > 0) {
            monthData.stockIn += difference
          } else {
            monthData.stockOut -= difference
          }
        }
      }
    })

    // Convert map to array and sort by date
    const result = Array.from(monthlyData.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.monthIndex - b.monthIndex
      })
      .map(({ month, stockIn, stockOut }) => ({
        month,
        stockIn,
        stockOut,
      }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating stock movements:", error)
    return NextResponse.json({ error: "Failed to calculate stock movements" }, { status: 500 })
  }
}
