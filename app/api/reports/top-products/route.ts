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

    // Get all products
    const products = await prisma.product.findMany({
      where: finalWhereClause,
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
      },
    })

    // Calculate value and sort
    const productsWithValue = products.map((product) => ({
      ...product,
      value: product.price * product.quantity,
    }))

    // Sort by value and take top 10
    const topProducts = productsWithValue
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((product) => ({
        name: product.name,
        value: product.value,
      }))

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error("Error fetching top products:", error)
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 })
  }
}
