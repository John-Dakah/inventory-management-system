import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all suppliers from the database
    const suppliers = await prisma.supplier.findMany();

    // Generate random performance rates for each supplier
    const suppliersWithPerformance = suppliers.map((supplier) => ({
      name: supplier.name,
      rate: Math.floor(Math.random() * 15) + 85, // Random number between 85-99
    }));

    return NextResponse.json(suppliersWithPerformance);
  } catch (error) {
    console.error("Error fetching supplier performance:", error);
    return NextResponse.json({ error: "Failed to fetch supplier performance" }, { status: 500 });
  }
}