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

    // Get stock items grouped by location
    const stockItems = await prisma.stockItem.findMany({
      where: finalWhereClause,
      select: {
        location: true,
        quantity: true,
      },
    })

    // Group by location
    const locationMap = new Map()
    stockItems.forEach((item) => {
      const location = item.location || "Unknown"
      const currentCount = locationMap.get(location) || 0
      locationMap.set(location, currentCount + 1)
    })

    // Format the data
    const result = Array.from(locationMap.entries()).map(([name, items]) => ({
      name,
      items,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching items by warehouse:", error)
    return NextResponse.json({ error: "Failed to fetch items by warehouse" }, { status: 500 })
  }
}
