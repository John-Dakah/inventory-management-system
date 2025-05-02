 import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 🔐 Helper to enforce authentication
async function requireAuth(request: Request) {
  const session = await auth(request)
  if (!session || !session.user?.id) {
    console.warn("Unauthorized access attempt detected.")
    return null
  }
  return session
}

export async function GET(request: Request) {
  const session = await requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const openSession = await prisma.registerSession.findFirst({
      where: { status: "Open", closedAt: null },
      orderBy: { openedAt: "desc" },
    })

    const recentTransactions = await prisma.transaction.findMany({
      take: 50,
      orderBy: { date: "desc" },
      include: {
        items: true,
        customer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    })

    const drawerHistory = await prisma.registerSession.findMany({
      take: 20,
      where: { status: "Closed" },
      orderBy: { closedAt: "desc" },
    })

    let drawerStatus = {
      isOpen: false,
      openedAt: null as Date | null,
      openingBalance: 0,
      currentBalance: 0,
      cashSales: 0,
      cardSales: 0,
      mobileSales: 0,
      expectedAmount: 0,
      cashPayouts: 0,
    }

    if (openSession) {
      const [cashSales, cardSales, mobileSales, cashPayouts] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            paymentMethod: "Cash",
            date: { gte: openSession.openedAt },
            status: "Completed",
          },
          _sum: { total: true },
        }),
        prisma.transaction.aggregate({
          where: {
            paymentMethod: "Card",
            date: { gte: openSession.openedAt },
            status: "Completed",
          },
          _sum: { total: true },
        }),
        prisma.transaction.aggregate({
          where: {
            paymentMethod: "Mobile",
            date: { gte: openSession.openedAt },
            status: "Completed",
          },
          _sum: { total: true },
        }),
        prisma.transaction.aggregate({
          where: {
            paymentMethod: "Cash",
            date: { gte: openSession.openedAt },
            status: "Completed",
            total: { lt: 0 },
          },
          _sum: { total: true },
        }),
      ])

      const cashSalesTotal = cashSales._sum.total || 0
      const cashPayoutsTotal = Math.abs(cashPayouts._sum.total || 0)

      drawerStatus = {
        isOpen: true,
        openedAt: openSession.openedAt,
        openingBalance: openSession.openingBalance,
        currentBalance: openSession.openingBalance + cashSalesTotal - cashPayoutsTotal,
        cashSales: cashSalesTotal,
        cardSales: cardSales._sum.total || 0,
        mobileSales: mobileSales._sum.total || 0,
        expectedAmount: openSession.openingBalance + cashSalesTotal - cashPayoutsTotal,
        cashPayouts: cashPayoutsTotal,
      }
    }

    const formattedTransactions = recentTransactions.map((t) => ({
      id: t.id,
      date: t.date,
      type: t.total < 0 ? "Cash Payout" : `${t.paymentMethod} Sale`,
      amount: t.total,
      reference: t.reference,
      notes: t.notes || "",
    }))

    const formattedHistory = drawerHistory.map((s) => ({
      id: s.id,
      date: s.openedAt,
      openedAt: s.openedAt.toLocaleTimeString(),
      closedAt: s.closedAt ? s.closedAt.toLocaleTimeString() : "N/A",
      openingBalance: s.openingBalance,
      closingBalance: s.closingBalance || 0,
      difference: (s.closingBalance || 0) - s.openingBalance,
      status: s.status,
      cashier: s.cashierName || "Unknown",
    }))

    return NextResponse.json({
      drawerStatus,
      transactions: formattedTransactions,
      history: formattedHistory,
    })
  } catch (error) {
    console.error("Error fetching cash drawer data:", error)
    return NextResponse.json({ error: "Failed to fetch cash drawer data", details: String(error) }, { status: 500 })
  }
}

// 📤 POST — Open, close, or payout actions
export async function POST(request: Request) {
  const session = await requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { action, amount, reason, reference } = data

    if (action === "open") {
      const openDrawer = await prisma.registerSession.findFirst({
        where: { status: "Open", closedAt: null },
      })

      if (openDrawer) {
        return NextResponse.json({ error: "A cash drawer is already open" }, { status: 400 })
      }

      const newSession = await prisma.registerSession.create({
        data: {
          openingBalance: Number(amount),
          closingBalance: null,
          status: "Open",
          cashierId: session.user.id,
          cashierName: session.user.name || "Unknown",
        },
      })

      return NextResponse.json({ success: true, session: newSession })
    }

    if (action === "close") {
      const openDrawer = await prisma.registerSession.findFirst({
        where: { status: "Open", closedAt: null },
      })

      if (!openDrawer) {
        return NextResponse.json({ error: "No open cash drawer found" }, { status: 400 })
      }

      const [cashSales, cashPayouts] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            paymentMethod: "Cash",
            date: { gte: openDrawer.openedAt },
            status: "Completed",
            total: { gt: 0 },
          },
          _sum: { total: true },
        }),
        prisma.transaction.aggregate({
          where: {
            paymentMethod: "Cash",
            date: { gte: openDrawer.openedAt },
            status: "Completed",
            total: { lt: 0 },
          },
          _sum: { total: true },
        }),
      ])

      const cashSalesTotal = cashSales._sum.total || 0
      const cashPayoutsTotal = Math.abs(cashPayouts._sum.total || 0)
      const expectedAmount = openDrawer.openingBalance + cashSalesTotal - cashPayoutsTotal
      const difference = Number(amount) - expectedAmount

      const closedDrawer = await prisma.registerSession.update({
        where: { id: openDrawer.id },
        data: {
          closedAt: new Date(),
          closingBalance: Number(amount),
          difference,
          status: "Closed",
        },
      })

      return NextResponse.json({
        success: true,
        session: closedDrawer,
        details: {
          expectedAmount,
          actualAmount: Number(amount),
          difference,
        },
      })
    }

    if (action === "payout") {
      const openDrawer = await prisma.registerSession.findFirst({
        where: { status: "Open", closedAt: null },
      })

      if (!openDrawer) {
        return NextResponse.json({ error: "No open cash drawer found" }, { status: 400 })
      }

      const payout = await prisma.transaction.create({
        data: {
          reference: reference || `PAYOUT-${Date.now()}`,
          date: new Date(),
          subtotal: -Number(amount),
          tax: 0,
          discount: 0,
          total: -Number(amount),
          paymentMethod: "Cash",
          status: "Completed",
          notes: `Cash payout: ${reason}`,
          cashierId: session.user.id,
          cashierName: session.user.name || "Unknown",
        },
      })

      return NextResponse.json({ success: true, payout })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing cash drawer action:", error)
    return NextResponse.json(
      { error: "Failed to process cash drawer action", details: String(error) },
      { status: 500 },
    )
  }
}
// Compare this snippet from app/api/pos/cash-drawer/route.ts:
// import { NextResponse } from "next/server" 