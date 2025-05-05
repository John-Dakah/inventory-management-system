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

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching supplier performance:", error)
    return NextResponse.json({ error: "Failed to fetch supplier performance" }, { status: 500 })
  }
}
