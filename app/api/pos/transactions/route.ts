import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const data = await request.json()

    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "No items in transaction" }, { status: 400 })
    }

    if (typeof data.subtotal !== "number" || typeof data.tax !== "number" || typeof data.total !== "number") {
      return NextResponse.json({ error: "Invalid transaction amounts" }, { status: 400 })
    }

    // Generate a unique reference number for the transaction
    const reference = `SALE-${Date.now().toString().slice(-6)}`

    try {
      // Start a transaction to ensure all operations succeed or fail together
      const result = await prisma.$transaction(async (tx) => {
        // Create the transaction - remove createdById which doesn't exist in the schema
        const transaction = await tx.transaction.create({
          data: {
            reference,
            subtotal: data.subtotal,
            tax: data.tax,
            discount: data.discountPercent ? (data.subtotal * data.discountPercent) / 100 : 0,
            total: data.total,
            paymentMethod: data.paymentMethod,
            status: "COMPLETED", // Use enum value from schema
            notes: data.notes || null,
            customer: data.customerId ? { connect: { id: data.customerId } } : undefined,
            cashierId: session.id,
            cashierName: session.fullName,
            // Remove createdById as it's not in the schema
          },
        })

        // Create transaction items and update product quantities
        for (const item of data.items) {
          // Check product availability
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { quantity: true },
          })

          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`)
          }

          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ID ${item.productId}`)
          }

          // Create transaction item
          await tx.transactionItem.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              transactionId: transaction.id,
              productId: item.productId,
            },
          })

          // Update product quantity
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          })
        }

        // If customer exists, update their stats
        if (data.customerId) {
          await tx.oUR_USER.update({
            where: { id: data.customerId },
            data: {
              totalSpent: { increment: data.total },
              visits: { increment: 1 },
              lastVisit: new Date(),
            },
          })
        }

        // Connect to register session if provided
        if (data.registerSessionId) {
          await tx.registerSession.update({
            where: { id: data.registerSessionId },
            data: {
              transactions: {
                connect: { id: transaction.id },
              },
              cashIn: { increment: data.total },
            },
          })
        }

        return transaction
      })

      return NextResponse.json({
        success: true,
        transactionId: result.id,
        reference: result.reference,
      })
    } catch (txError: any) {
      console.error("Transaction error:", txError)
      return NextResponse.json(
        {
          error: "Transaction failed",
          details: txError.message || "Database transaction error",
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Error processing transaction:", error)
    return NextResponse.json(
      {
        error: "Failed to process transaction",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const customerId = searchParams.get("customerId")
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : null
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : null
    const status = searchParams.get("status")

    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)

    const whereClause: any = {}

    // Role-based filtering
    if (session.role === "SALES_PERSON") {
      whereClause.cashierId = session.id
    }

    // Apply additional filters
    if (customerId) {
      whereClause.customerId = customerId
    }

    if (status) {
      whereClause.status = status
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      whereClause.date = {}
      if (dateFrom) {
        whereClause.date.gte = dateFrom
      }
      if (dateTo) {
        whereClause.date.lte = dateTo
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: whereClause,
    })

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    })
  } catch (error: any) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch transactions",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { transactionId } = data

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    // Check if the transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Delete the transaction and its items
    await prisma.transaction.delete({
      where: { id: transactionId },
    })

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      {
        error: "Failed to delete transaction",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
import { UserRole } from "@prisma/client"