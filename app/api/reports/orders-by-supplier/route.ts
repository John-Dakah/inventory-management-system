import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all suppliers
    const suppliers = await prisma.supplier.findMany();

    // Generate random orders for each supplier
    const suppliersWithOrders = suppliers.map((supplier) => ({
      name: supplier.name,
      orders: Math.floor(Math.random() * 30) + 15, // Random number between 15-44
    }));

    return NextResponse.json(suppliersWithOrders);
  } catch (error) {
    console.error("Error fetching orders by supplier:", error);
    return NextResponse.json({ error: "Failed to fetch orders by supplier" }, { status: 500 });
  }
}