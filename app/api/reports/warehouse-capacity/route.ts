import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const cookieStore = await cookies()
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

    // Define warehouse capacities (in a real system, this would come from a database)
    // For now, we'll use a fixed capacity for each warehouse
    const warehouseCapacities = new Map([
      ["Main Warehouse", 1000],
      ["East Wing", 500],
      ["West Wing", 750],
      ["North Storage", 300],
      ["South Storage", 450],
    ])

    // Group by location and calculate usage
    const locationMap = new Map()

    // Initialize with all known warehouses
    warehouseCapacities.forEach((capacity, name) => {
      locationMap.set(name, {
        name,
        totalItems: 0,
        capacity,
      })
    })

    // Add data from stock items
    stockItems.forEach((item) => {
      const location = item.location || "Unknown"

      if (!locationMap.has(location)) {
        // For unknown locations, assume a default capacity
        locationMap.set(location, {
          name: location,
          totalItems: 0,
          capacity: 500, // Default capacity
        })
      }

      const locationData = locationMap.get(location)
      locationData.totalItems += item.quantity
    })

    // Calculate percentages and format the data
    const result = Array.from(locationMap.values())
      .filter((location) => location.totalItems > 0) // Only include warehouses with items
      .map((location) => {
        const usedPercentage = Math.min(100, Math.round((location.totalItems / location.capacity) * 100))
        return {
          name: location.name,
          used: usedPercentage,
          available: 100 - usedPercentage,
        }
      })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating warehouse capacity:", error)
    return NextResponse.json({ error: "Failed to calculate warehouse capacity" }, { status: 500 })
  }
}
