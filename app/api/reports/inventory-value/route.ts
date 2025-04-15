import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        price: true,
        quantity: true,
      },
    });

    const totalValue = products.reduce((sum, product) => {
      const price = product.price || 0;
      const quantity = product.quantity || 0;
      return sum + price * quantity;
    }, 0);

    return NextResponse.json({ inventoryValue: totalValue });
  } catch (error) {
    console.error("Error fetching inventory value:", error);
    return NextResponse.json({ error: "Failed to fetch inventory value" }, { status: 500 });
  }
}