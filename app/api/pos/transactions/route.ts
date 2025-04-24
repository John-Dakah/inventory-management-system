import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { items, subtotal, tax, total, discountPercent, paymentMethod, customerId, date } = data

    // Calculate discount amount
    const discountAmount = (subtotal * discountPercent) / 100

    // Generate a unique reference number
    const reference = `SALE-${Date.now()}`

    // Create a new transaction record
    const transaction = await prisma.transaction.create({
      data: {
        reference,
        date: date ? new Date(date) : new Date(),
        subtotal,
        tax,
        discount: discountAmount,
        total,
        paymentMethod,
        status: "Completed",
        customerId,
        cashierName: "System User", // In a real app, this would be the logged-in user
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Update inventory for each product
    for (const item of items) {
      await prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Update customer stats if a customer was specified
    if (customerId) {
      const customerTransactions = await prisma.transaction.findMany({
        where: {
          customerId,
        },
      })

      const totalSpent = customerTransactions.reduce((sum, t) => sum + t.total, 0)
      const visits = customerTransactions.length

      await prisma.oUR_USER.update({
        where: {
          id: customerId,
        },
        data: {
          totalSpent,
          visits,
          lastVisit: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      transactionId: reference,
      transaction,
    })
  } catch (error) {
    console.error("Error processing transaction:", error)
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 })
  }
}

