import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    // Fetch customer details
    const customer = await prisma.oUR_USER.findUnique({
      where: {
        id: customerId,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Fetch customer's purchase history
    const transactions = await prisma.transaction.findMany({
      where: {
        customerId,
      },
      orderBy: {
        date: "desc",
      },
      take: 20,
    })

    // Format purchase history
    const purchaseHistory = transactions.map((transaction) => ({
      id: transaction.reference,
      date: transaction.date,
      amount: transaction.total,
      items: 0, // Placeholder since 'items' does not exist on the transaction object
      paymentMethod: transaction.paymentMethod,
    }))

    return NextResponse.json({
      ...customer,
      purchaseHistory,
    })
  } catch (error) {
    console.error("Error fetching customer details:", error)
    return NextResponse.json({ error: "Failed to fetch customer details" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id
    const data = await request.json()
    const { name, email, phone, address, type, notes } = data

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email already exists for another customer
    const existingCustomer = await prisma.oUR_USER.findFirst({
      where: {
        email,
        id: {
          not: customerId,
        },
      },
    })

    if (existingCustomer) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Update customer
    const customer = await prisma.oUR_USER.update({
      where: {
        id: customerId,
      },
      data: {
        fullName, // Replace 'fullName' with the correct property name from your Prisma schema
        email,
        phone,
        address,
        type,
        notes,
        updatedAt: new Date(),
        
      },
    })

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    // Check if customer exists
    const customer = await prisma.oUR_USER.findUnique({
      where: {
        id: customerId,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Delete customer
    await prisma.oUR_USER.delete({
      where: {
        id: customerId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}

