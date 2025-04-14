import { NextResponse } from "next/server"
import { Pool } from "pg"

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// GET product by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await pool.query(
      `
      SELECT * FROM products 
      WHERE id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT update product
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const product = await request.json()

    // Validate required fields
    if (!product.name || !product.sku) {
      return NextResponse.json({ error: "Name and SKU are required" }, { status: 400 })
    }

    const result = await pool.query(
      `
      UPDATE products 
      SET 
        name = $1, 
        sku = $2, 
        price = $3, 
        quantity = $4, 
        category = $5, 
        vendor = $6, 
        weight = $7, 
        description = $8, 
        "imageUrl" = $9, 
        "updatedAt" = $10
      WHERE id = $11
      RETURNING *
    `,
      [
        product.name,
        product.sku,
        product.price,
        product.quantity,
        product.category || null,
        product.vendor || null,
        product.weight || null,
        product.description || null,
        product.imageUrl || null,
        product.updatedAt,
        id,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await pool.query(
      `
      DELETE FROM products 
      WHERE id = $1
      RETURNING id
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ id: result.rows[0].id, deleted: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
