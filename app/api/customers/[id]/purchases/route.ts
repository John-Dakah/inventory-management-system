import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    // Fetch customer's purchase history
    const transactions = await prisma.transaction.findMany({
      where: {
        customerId,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      take: 50,
    })

    // Format purchase history
    const purchaseHistory = transactions.map((transaction) => ({
      id: transaction.reference,
      date: transaction.date,
      amount: transaction.total,
      items: transaction.items.length,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
    }))

    return NextResponse.json(purchaseHistory)
  } catch (error) {
    console.error("Error fetching customer purchase history:", error)
    return NextResponse.json({ error: "Failed to fetch purchase history" }, { status: 500 })
  }
}

