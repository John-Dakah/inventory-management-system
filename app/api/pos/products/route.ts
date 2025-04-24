import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || undefined

    // Get all products from database
    const products = await prisma.product.findMany({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }],
        ...(category && category !== "All" ? { category } : {}),
      },
      orderBy: {
        name: "asc",
      },
    })

    // Get all unique categories
    const categories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      where: {
        category: {
          not: null,
        },
      },
    })

    const uniqueCategories: string[] = ["All", ...categories.map((c: { category: string | null }) => c.category || "").filter(Boolean)]

    return NextResponse.json({
      products,
      categories: uniqueCategories,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

