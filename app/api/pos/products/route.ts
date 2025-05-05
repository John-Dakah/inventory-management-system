import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "All"

    // Get the current user from the session
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(authCookie.value)

    // Build the query
    const whereClause: any = {
      AND: [
        {
          OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }],
        },
      ],
    }

    // Add category filter if not "All"
    if (category !== "All") {
      whereClause.AND.push({ category })
    }

    // Add user filter based on role
    if (session.role !== "sales_person") {
      whereClause.AND.push({ createdById: session.id })
    }

    // Fetch products based on filters
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    })

    // Get unique categories
    const allCategories = await prisma.product.findMany({
      where: session.role !== "sales_person" ? { createdById: session.id } : {},
      select: { category: true },
      distinct: ["category"],
    })

    const categories = allCategories.map((p) => p.category).filter((category): category is string => category !== null)

    return NextResponse.json({ products, categories })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
