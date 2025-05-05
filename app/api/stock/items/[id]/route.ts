import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Helper function to get current user
async function getCurrentUser() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth")

  if (!authCookie) {
    return null
  }

  return JSON.parse(authCookie.value)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser()

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
        }),
        { status: 401 },
      )
    }

    const { id } = params

    // Check if the stock item exists
    const stockItem = await prisma.stockItem.findUnique({
      where: { id },
    })

    if (!stockItem) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Stock item not found",
        }),
        { status: 404 },
      )
    }

    // If user is not admin or sales_person, check if they created the item
    if (session.role !== "admin" && session.role !== "sales_person" && stockItem.createdById !== session.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Unauthorized to delete this stock item",
        }),
        { status: 403 },
      )
    }

    // Delete all related transactions first
    await prisma.stockTransaction.deleteMany({
      where: { stockItemId: id },
    })

    // Delete the stock item
    await prisma.stockItem.delete({
      where: { id },
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Stock item deleted successfully",
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting stock item:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to delete stock item",
        error: (error as Error).message,
      }),
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser()

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
        }),
        { status: 401 },
      )
    }

    const { id } = params
    const data = await request.json()

    // Check if the stock item exists
    const stockItem = await prisma.stockItem.findUnique({
      where: { id },
    })

    if (!stockItem) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Stock item not found",
        }),
        { status: 404 },
      )
    }

    // If user is not admin or sales_person, check if they created the item
    if (session.role !== "admin" && session.role !== "sales_person" && stockItem.createdById !== session.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Unauthorized to update this stock item",
        }),
        { status: 403 },
      )
    }

    // Update the stock item
    const updatedStockItem = await prisma.stockItem.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: updatedStockItem,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating stock item:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to update stock item",
        error: (error as Error).message,
      }),
      { status: 500 },
    )
  }
}
