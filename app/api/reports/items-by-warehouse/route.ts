import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all stock items from the database
    const stockItems = await prisma.stockItem.findMany({
      select: {
        location: true,
        quantity: true,
      },
    });

    // Group items by location
    const locationGroups: Record<string, number> = {};

    stockItems.forEach((item) => {
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = 0;
      }
      locationGroups[item.location] += item.quantity;
    });

    // Convert to array format for the response
    const result = Object.entries(locationGroups).map(([name, items]) => ({
      name,
      items,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching items by warehouse:", error);
    return NextResponse.json({ error: "Failed to fetch items by warehouse" }, { status: 500 });
  }
}