import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get recent stock transactions for cash drawer
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        type: { in: ["Cash Sale", "Payout"] },
      },
      include: {
        stockItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Calculate drawer status based on transactions
    const cashSales = transactions.filter((t) => t.type === "Cash Sale").reduce((sum, t) => sum + t.quantity, 0)

    const cashPayouts = transactions.filter((t) => t.type === "Payout").reduce((sum, t) => sum + t.quantity, 0)

    // Assuming opening balance of 200.0 for now
    // In a real app, this would come from the most recent "Open Drawer" transaction
    const openingBalance = 200.0
    const currentBalance = openingBalance + cashSales - cashPayouts

    const drawerStatus = {
      isOpen: true, // This would normally be stored in the database
      openedAt: new Date(new Date().setHours(new Date().getHours() - 8)),
      openingBalance,
      currentBalance,
      cashSales,
      cardSales: 0, // This would come from different transaction types
      mobileSales: 0, // This would come from different transaction types
      expectedAmount: openingBalance + cashSales - cashPayouts,
      cashPayouts,
    }

    // Format transactions for the UI
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.createdAt,
      type: transaction.type,
      amount: transaction.type === "Payout" ? -transaction.quantity : transaction.quantity,
      reference: transaction.reference || "",
      notes: transaction.notes || "",
    }))

    // Get drawer history
    const drawerHistory = await prisma.stockTransaction.findMany({
      where: {
        type: { in: ["Open Drawer", "Close Drawer"] },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Format drawer history
    // In a real app, you'd pair opening and closing records
    const formattedHistory = []
    for (let i = 0; i < drawerHistory.length; i += 2) {
      if (i + 1 < drawerHistory.length) {
        const closeRecord = drawerHistory[i]
        const openRecord = drawerHistory[i + 1]

        formattedHistory.push({
          id: closeRecord.id,
          date: openRecord.createdAt,
          openedAt: new Date(openRecord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          closedAt: new Date(closeRecord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          openingBalance: openRecord.previousQuantity,
          closingBalance: closeRecord.newQuantity,
          difference: closeRecord.newQuantity - closeRecord.previousQuantity - openRecord.quantity,
          status: closeRecord.newQuantity === closeRecord.previousQuantity ? "Balanced" : "Discrepancy",
          cashier: "System User", // This would come from the user who performed the operation
        })
      }
    }

    return NextResponse.json({
      drawerStatus,
      transactions: formattedTransactions,
      history: formattedHistory,
    })
  } catch (error) {
    console.error("Error fetching cash drawer data:", error)
    return NextResponse.json({ error: "Failed to fetch cash drawer data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { action, amount, reason, reference, notes } = data

    if (action === "open") {
      // Create a new "Open Drawer" transaction
      const transaction = await prisma.stockItem.update({
        where: {
          sku: "CASH_DRAWER", // You would need a stock item representing your cash drawer
        },
        data: {
          quantity: amount,
          lastUpdated: new Date(),
          transactions: {
            create: {
              type: "Open Drawer",
              quantity: amount,
              previousQuantity: 0,
              newQuantity: amount,
              location: "Main Register",
              reference: reference || "Opening Balance",
              notes: notes || "Cash drawer opened",
            },
          },
        },
        include: {
          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Cash drawer opened successfully",
        transaction: transaction.transactions[0],
      })
    } else if (action === "close") {
      // Get current cash drawer quantity
      const drawer = await prisma.stockItem.findUnique({
        where: {
          sku: "CASH_DRAWER",
        },
      })

      if (!drawer) {
        return NextResponse.json({ error: "Cash drawer not found" }, { status: 404 })
      }

      // Create a "Close Drawer" transaction
      const transaction = await prisma.stockItem.update({
        where: {
          sku: "CASH_DRAWER",
        },
        data: {
          quantity: 0, // Reset to 0 when closing
          lastUpdated: new Date(),
          transactions: {
            create: {
              type: "Close Drawer",
              quantity: 0,
              previousQuantity: drawer.quantity,
              newQuantity: 0,
              location: "Main Register",
              reference: reference || "Closing Balance",
              notes: notes || "Cash drawer closed",
            },
          },
        },
        include: {
          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Cash drawer closed successfully",
        transaction: transaction.transactions[0],
      })
    } else if (action === "payout") {
      // Get current cash drawer quantity
      const drawer = await prisma.stockItem.findUnique({
        where: {
          sku: "CASH_DRAWER",
        },
      })

      if (!drawer) {
        return NextResponse.json({ error: "Cash drawer not found" }, { status: 404 })
      }

      // Create a "Payout" transaction
      const transaction = await prisma.stockItem.update({
        where: {
          sku: "CASH_DRAWER",
        },
        data: {
          quantity: drawer.quantity - amount,
          lastUpdated: new Date(),
          transactions: {
            create: {
              type: "Payout",
              quantity: amount,
              previousQuantity: drawer.quantity,
              newQuantity: drawer.quantity - amount,
              location: "Main Register",
              reference: reference || "",
              reason: reason || "",
              notes: notes || "Cash payout",
            },
          },
        },
        include: {
          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Payout recorded successfully",
        transaction: transaction.transactions[0],
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing cash drawer operation:", error)
    return NextResponse.json({ error: "Failed to process cash drawer operation" }, { status: 500 })
  }
}

