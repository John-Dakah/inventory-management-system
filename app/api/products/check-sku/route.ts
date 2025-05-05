import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)

    // Get the SKU from the query parameters
    const url = new URL(request.url)
    const sku = url.searchParams.get("sku")

    if (!sku) {
      return NextResponse.json({ error: "SKU parameter is required" }, { status: 400 })
    }

    // Check if a product with this SKU already exists for this user
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: sku,
        createdById: session.id,
      },
    })

    return NextResponse.json({ exists: !!existingProduct })
  } catch (error) {
    console.error("Error checking SKU:", error)
    return NextResponse.json({ error: "Failed to check SKU" }, { status: 500 })
  }
}
