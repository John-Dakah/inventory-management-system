import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get the last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    // Fetch transactions from Prisma
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group transactions by month and type
    const monthlyData: Record<string, { stockIn: number; stockOut: number }> = {};

    // Initialize with all months in the period
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`;
      monthlyData[monthYear] = { stockIn: 0, stockOut: 0 };
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Process transactions
    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

      if (transaction.type === "in") {
        monthlyData[monthYear].stockIn += transaction.quantity;
      } else if (transaction.type === "out") {
        monthlyData[monthYear].stockOut += transaction.quantity;
      }
    });

    // Convert to array format for the response
    const result = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      stockIn: data.stockIn,
      stockOut: data.stockOut,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stock movement trends:", error);
    return NextResponse.json({ error: "Failed to fetch stock movement trends" }, { status: 500 });
  }
}