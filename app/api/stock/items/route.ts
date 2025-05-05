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
      items = await prisma.stockItem.findMany({
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Both admins and warehouse managers can only see their own stock items
      items = await prisma.stockItem.findMany({
        where: {
          createdById: session.id,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching stock items:", error)
    return NextResponse.json({ error: "Failed to fetch stock items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const data = await request.json()

    // Create the stock item with the current user as creator
    const stockItem = await prisma.stockItem.create({
      data: {
        ...data,
        createdById: session.id,
      },
    })

    return NextResponse.json(stockItem)
  } catch (error) {
    console.error("Error creating stock item:", error)
    return NextResponse.json({ error: "Failed to create stock item" }, { status: 500 })
  }
}
