import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const data = await request.json()

    // Generate a unique reference number for the transaction
    const reference = `SALE-${Date.now().toString().slice(-6)}`

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        reference,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discountPercent ? (data.subtotal * data.discountPercent) / 100 : 0,
        total: data.total,
        paymentMethod: data.paymentMethod,
        status: "Completed",
        notes: data.notes || null,
        customerId: data.customerId || null,
        cashierId: session.id,
        cashierName: session.fullName,
        createdById: session.id, // Associate the transaction with the current user
      },
    })

    // Create transaction items
    for (const item of data.items) {
      await prisma.transactionItem.create({
        data: {
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          transactionId: transaction.id,
          productId: item.productId,
        },
      })

      // Update product quantity
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      reference: transaction.reference,
    })
  } catch (error) {
    console.error("Error processing transaction:", error)
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get the current user from the session
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)

    // Build the query
    const whereClause: any = {}

    // Add user filter based on role
    if (session.role !== "sales_person") {
      whereClause.cashierId = session.id
    }

    // Fetch recent transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
