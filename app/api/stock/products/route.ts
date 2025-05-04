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

    // Fetch products based on user role
    let products = []

    if (session.role === "sales_person") {
      // Sales persons can see all products (for selling purposes)
      products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Both admins and warehouse managers can only see their own products
      products = await prisma.product.findMany({
        where: {
          createdById: session.id,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
