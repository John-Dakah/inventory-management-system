import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"


export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(authCookie.value);

    // Build the query based on the user's role
    const whereClause =
      session.role !== "sales_person"
        ? { createdById: session.id }
        : {};

    // Fetch stock transactions from the database
    const transactions = await prisma.stockTransaction.findMany({
      where: whereClause,
      include: {
        stockItem: true, // Include related stock item data if needed
      },
      orderBy: {
        createdAt: "desc", // Sort by creation date
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching stock transactions:", error);
    return NextResponse.json({ error: "Failed to fetch stock transactions" }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)
    const data = await request.json()

    // First, check if the user has permission to modify this stock item
    const stockItem = await prisma.stockItem.findUnique({
      where: { id: data.stockItemId },
    })

    if (!stockItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    // Check if user has permission to modify this stock item
    if (session.role !== "sales_person" && stockItem.createdById !== session.id) {
      return NextResponse.json({ error: "Unauthorized to modify this stock item" }, { status: 403 })
    }

    // Create the transaction with the current user as creator
    const transaction = await prisma.stockTransaction.create({
      data: {
        ...data,
        createdById: session.id,
      },
    })

    // Update the stock item quantity
    await prisma.stockItem.update({
      where: { id: data.stockItemId },
      data: {
        quantity: data.newQuantity,
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error recording stock transaction:", error)
    return NextResponse.json({ error: "Failed to record stock transaction" }, { status: 500 })
  }
}
