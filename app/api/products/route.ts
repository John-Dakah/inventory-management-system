import { NextResponse } from "next/server"
import { Pool } from "pg"

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// GET all products
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM products 
      ORDER BY "updatedAt" DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST new product
export async function POST(request: Request) {
  try {
    const product = await request.json()

    // Validate required fields
    if (!product.name || !product.sku) {
      return NextResponse.json({ error: "Name and SKU are required" }, { status: 400 })
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        id, name, sku, price, quantity, category, vendor, 
        weight, description, "imageUrl", "createdAt", "updatedAt"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
      [
        product.id,
        product.name,
        product.sku,
        product.price,
        product.quantity,
        product.category || null,
        product.vendor || null,
        product.weight || null,
        product.description || null,
        product.imageUrl || null,
        product.createdAt,
        product.updatedAt,
      ],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
