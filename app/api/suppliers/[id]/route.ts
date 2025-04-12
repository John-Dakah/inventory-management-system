import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET supplier by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error(`Error fetching supplier ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 })
  }
}

// DELETE supplier
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    // Delete the supplier
    await prisma.supplier.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting supplier ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}

