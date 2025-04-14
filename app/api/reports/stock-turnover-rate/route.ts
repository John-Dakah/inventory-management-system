import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch stock transactions for the last 30 days
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    if (transactions.length > 0) {
      // Count outgoing transactions (sales/usage)
      const outTransactions = transactions.filter((t) => t.type === "out");

      // Get current inventory
      const stockItems = await prisma.stockItem.findMany();
      const totalInventory = stockItems.reduce((sum, item) => sum + item.quantity, 0);

      // Calculate turnover (simplified: outgoing transactions / average inventory)
      const outgoingUnits = outTransactions.reduce((sum, t) => sum + t.quantity, 0);

      // Annualize the 30-day rate (multiply by 12)
      const turnoverRate = totalInventory > 0 ? (outgoingUnits / totalInventory) * 12 : 0;

      return NextResponse.json({ turnoverRate });
    }

    return NextResponse.json({ turnoverRate: 0 });
  } catch (error) {
    console.error("Error calculating stock turnover rate:", error);
    return NextResponse.json({ error: "Failed to calculate stock turnover rate" }, { status: 500 });
  }
}