import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { action, amount, notes } = data

    // Check if cash drawer exists
    const cashDrawer = await prisma.stockItem.findUnique({
      where: {
        sku: "CASH_DRAWER",
      },
    })

    if (!cashDrawer) {
      return NextResponse.json({ error: "Cash drawer not found" }, { status: 404 })
    }

    if (action === "open") {
      // Check if drawer is already open
      if (cashDrawer.status === "Open") {
        return NextResponse.json({ error: "Register is already open" }, { status: 400 })
      }

      // Open the register
      const updatedDrawer = await prisma.stockItem.update({
        where: {
          sku: "CASH_DRAWER",
        },
        data: {
          status: "Open",
          quantity: amount || 0,
          lastUpdated: new Date(),
          transactions: {
            create: {
              type: "Open Drawer",
              quantity: amount || 0,
              previousQuantity: 0,
              newQuantity: amount || 0,
              location: "Main Register",
              reference: `OPEN-${Date.now()}`,
              notes: notes || "Register opened",
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Register opened successfully",
        status: updatedDrawer.status,
        balance: updatedDrawer.quantity,
      })
    } else if (action === "close") {
      // Check if drawer is already closed
      if (cashDrawer.status === "Closed") {
        return NextResponse.json({ error: "Register is already closed" }, { status: 400 })
      }

      // Close the register
      const updatedDrawer = await prisma.stockItem.update({
        where: {
          sku: "CASH_DRAWER",
        },
        data: {
          status: "Closed",
          quantity: 0,
          lastUpdated: new Date(),
          transactions: {
            create: {
              type: "Close Drawer",
              quantity: 0,
              previousQuantity: cashDrawer.quantity,
              newQuantity: 0,
              location: "Main Register",
              reference: `CLOSE-${Date.now()}`,
              notes: notes || "Register closed",
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Register closed successfully",
        status: updatedDrawer.status,
        balance: updatedDrawer.quantity,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing register operation:", error)
    return NextResponse.json({ error: "Failed to process register operation" }, { status: 500 })
  }
}

