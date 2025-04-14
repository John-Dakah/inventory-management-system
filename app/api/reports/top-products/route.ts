import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch the top 5 products by value (price * quantity)
    const products = await prisma.product.findMany({
      orderBy: {
        price: "desc",
      },
      take: 5,
    });

    const productsWithValue = products.map((product) => ({
      name: product.name,
      value: product.price * product.quantity,
    }));

    return NextResponse.json(productsWithValue);
  } catch (error) {
    console.error("Error fetching top products by value:", error);
    return NextResponse.json({ error: "Failed to fetch top products by value" }, { status: 500 });
  }
}