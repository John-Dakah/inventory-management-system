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

    const inventoryValue = products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);

    return NextResponse.json({ inventoryValue });
  } catch (error) {
    console.error("Error fetching inventory value:", error);
    return NextResponse.json({ error: "Failed to fetch inventory value" }, { status: 500 });
  }
}