import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || undefined

    // Fetch customers with filters
    const customers = await prisma.oUR_USER.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
        ...(type && type !== "All" ? { type } : {}),
      },
      orderBy: {
        name: "asc",
      },
      take: 100,
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, phone, address, type, notes } = data

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingCustomer = await prisma.oUR_USER.findUnique({
      where: {
        email,
      },
    })

    if (existingCustomer) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Create new customer
    const customer = await prisma.oUR_USER.create({
      data: {
        name,
        email,
        phone,
        address,
        type: type || "New",
        notes,
        joinDate: new Date(),
        lastVisit: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      customer,
    })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

