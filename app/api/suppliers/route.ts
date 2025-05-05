import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)

    // Fetch suppliers based on user role
    let suppliers = []

    if (session.role === "sales_person") {
      // Sales persons can see all suppliers
      suppliers = await prisma.supplier.findMany({
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Both admins and warehouse managers can only see their own suppliers
      suppliers = await prisma.supplier.findMany({
        where: {
          createdById: session.id,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
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

    // Validate required fields
    if (!data.name || !data.contactPerson || !data.email || !data.phone) {
      return NextResponse.json({ error: "Name, contact person, email, and phone are required" }, { status: 400 })
    }

    // Create the supplier with the current user as creator
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products || "",
        status: data.status || "Active",
        createdById: session.id, // Associate the supplier with the current user
      },
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
