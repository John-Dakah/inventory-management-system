import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

/**
 * Test endpoint for validating transaction processing without affecting inventory
 * Use this route for testing payment processing with dummy data
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const data = await request.json()

    // Validate the transaction data
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "No items in transaction" }, { status: 400 })
    }

    // Check if all required product IDs exist
    const productIds = data.items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Make sure all products exist
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id)
      const missingIds = productIds.filter((id) => !foundIds.includes(id))
      return NextResponse.json(
        {
          error: "Some products do not exist",
          details: `Missing product IDs: ${missingIds.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Validate customer ID if provided
    if (data.customerId) {
      const customer = await prisma.oUR_USER.findUnique({
        where: { id: data.customerId },
      })

      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 400 })
      }
    }

    // Simulate a transaction without actually creating records
    return NextResponse.json({
      success: true,
      test: true,
      transactionId: "TEST-" + Date.now(),
      reference: `TEST-SALE-${Date.now().toString().slice(-6)}`,
      message: "Test transaction validated. All data is valid but no database changes were made.",
    })
  } catch (error: any) {
    console.error("Error testing transaction:", error)
    return NextResponse.json(
      {
        error: "Failed to test transaction",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
