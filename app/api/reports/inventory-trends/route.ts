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
    const { whereClause, startDate, endDate, timePeriod } = await request.json()

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
      orderBy: {
        createdAt: "asc",
      },
    })

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

    // Determine the number of data points based on the time period
    let numDataPoints
    let interval

    switch (timePeriod) {
      case "30days":
        numDataPoints = 30
        interval = "day"
        break
      case "3months":
        numDataPoints = 12 // Weekly data points
        interval = "week"
        break
      case "12months":
        numDataPoints = 12
        interval = "month"
        break
      case "6months":
      default:
        numDataPoints = 6
        interval = "month"
        break
    }

    // Generate data points
    const dataPoints = []
    const now = new Date(endDate)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Start with the current inventory value
    let runningValue = currentInventoryValue

    // Work backwards from the current date
    for (let i = 0; i < numDataPoints; i++) {
      let label
      let date

      if (interval === "day") {
        date = new Date(now)
        date.setDate(now.getDate() - i)
        label = `${date.getDate()} ${months[date.getMonth()]}`
      } else if (interval === "week") {
        date = new Date(now)
        date.setDate(now.getDate() - i * 7)
        label = `W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)} ${months[date.getMonth()]}`
      } else {
        date = new Date(now)
        date.setMonth(now.getMonth() - i)
        label = months[date.getMonth()]
      }

      // Add the data point
      dataPoints.unshift({
        month: label,
        value: runningValue,
      })

      // Adjust the running value based on transactions
      // For each transaction that occurred before this data point but after the previous one,
      // reverse its effect on the inventory value
      const previousDate = new Date(date)
      if (interval === "day") {
        previousDate.setDate(date.getDate() - 1)
      } else if (interval === "week") {
        previousDate.setDate(date.getDate() - 7)
      } else {
        previousDate.setMonth(date.getMonth() - 1)
      }

      // Find transactions in this period
      const periodTransactions = stockTransactions.filter((t) => {
        const transactionDate = new Date(t.createdAt)
        return transactionDate >= previousDate && transactionDate < date
      })

      // Adjust the running value
      for (const transaction of periodTransactions) {
        if (transaction.type === "in") {
          // For stock in, we need to subtract the value that was added
          runningValue -= transaction.quantity * 50 // Using an average price of 50 for simplicity
        } else if (transaction.type === "out") {
          // For stock out, we need to add back the value that was removed
          runningValue += transaction.quantity * 50
        } else if (transaction.type === "adjustment") {
          // For adjustments, we need to reverse the adjustment
          const difference = transaction.newQuantity - transaction.previousQuantity
          runningValue -= difference * 50
        }
      }
    }

    return NextResponse.json(dataPoints)
  } catch (error) {
    console.error("Error calculating inventory trends:", error)
    return NextResponse.json({ error: "Failed to calculate inventory trends" }, { status: 500 })
  }
}
