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

    // Fetch suppliers based on user role
    let suppliers = []

    if (session.role === "sales_person") {
      // Sales persons can see all suppliers
      suppliers = await prisma.supplier.findMany()
    } else {
      // Both admins and warehouse managers can only see their own suppliers
      suppliers = await prisma.supplier.findMany({
        where: {
          createdById: session.id,
        },
      })
    }

    // Calculate stats
    const total = suppliers.length
    const active = suppliers.filter((supplier) => supplier.status === "Active").length
    const onHold = suppliers.filter((supplier) => supplier.status === "On Hold").length
    const inactive = suppliers.filter((supplier) => supplier.status === "Inactive").length

    // Calculate new suppliers this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = suppliers.filter((supplier) => new Date(supplier.createdAt) >= firstDayOfMonth).length

    // Calculate active percentage
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0

    return NextResponse.json({
      total,
      active,
      newThisMonth,
      activePercentage,
      onHold,
      inactive,
    })
  } catch (error) {
    console.error("Error fetching supplier stats:", error)
    return NextResponse.json({ error: "Failed to fetch supplier stats" }, { status: 500 })
  }
}
