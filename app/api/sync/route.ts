import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import type { Supplier } from "@/types"

export async function POST(request: Request) {
  try {
    const supplier: Supplier = await request.json()

    // Check if supplier already exists
    const { rows: existingSuppliers } = await sql`
      SELECT id FROM suppliers WHERE id = ${supplier.id}
    `

    if (existingSuppliers.length > 0) {
      // Update existing supplier
      await sql`
        UPDATE suppliers
        SET 
          name = ${supplier.name},
          contactPerson = ${supplier.contactPerson},
          email = ${supplier.email},
          phone = ${supplier.phone},
          address = ${supplier.address},
          products = ${supplier.products},
          status = ${supplier.status},
          notes = ${supplier.notes},
          updatedAt = ${new Date().toISOString()}
        WHERE id = ${supplier.id}
      `
    } else {
      // Insert new supplier
      await sql`
        INSERT INTO suppliers (
          id, name, contactPerson, email, phone, address, products, 
          status, notes, createdAt, updatedAt
        )
        VALUES (
          ${supplier.id},
          ${supplier.name},
          ${supplier.contactPerson},
          ${supplier.email},
          ${supplier.phone},
          ${supplier.address},
          ${supplier.products},
          ${supplier.status},
          ${supplier.notes},
          ${supplier.createdAt || new Date().toISOString()},
          ${new Date().toISOString()}
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error syncing supplier:", error)
    return NextResponse.json({ error: "Failed to sync supplier", details: error.message }, { status: 500 })
  }
}

