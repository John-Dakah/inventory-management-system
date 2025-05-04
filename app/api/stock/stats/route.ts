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

    // Fetch stock items based on user role
    let items = []

    if (session.role === "sales_person") {
      // Sales persons can see all stock items
      items = await prisma.stockItem.findMany()
    } else {
      // Both admins and warehouse managers can only see their own stock items
      items = await prisma.stockItem.findMany({
        where: {
          createdById: session.id,
        },
      })
    }

    // Calculate stats
    const totalItems = items.length
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
    const lowStockItems = items.filter((item) => item.quantity > 0 && item.quantity <= 10).length
    const outOfStockItems = items.filter((item) => item.quantity === 0).length

    // Get unique categories, locations, and types
    const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]
    const locations = [...new Set(items.map((item) => item.location).filter(Boolean))]
    const types = [...new Set(items.map((item) => item.type).filter(Boolean))]

    return NextResponse.json({
      totalItems,
      totalUnits,
      lowStockItems,
      outOfStockItems,
      categories,
      locations,
      types,
    })
  } catch (error) {
    console.error("Error fetching stock stats:", error)
    return NextResponse.json({ error: "Failed to fetch stock stats" }, { status: 500 })
  }
}
