import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6months";

    const endDate = new Date();
    const startDate = new Date();

    // Set the start date based on the selected period
    switch (period) {
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "12months":
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    // Fetch transactions from Prisma
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        stockItem: true,
      },
    });

    // Process transactions into monthly trends
    if (transactions.length > 0) {
      const monthlyData: Record<string, number> = {};
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`;
        monthlyData[monthYear] = 0;
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      let runningValue = 0;

      transactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt);
        const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

        if (transaction.type === "in") {
          runningValue += transaction.quantity * 10; // Example value
        } else if (transaction.type === "out") {
          runningValue -= transaction.quantity * 10;
        }

        monthlyData[monthYear] = runningValue;
      });

      const result = Object.entries(monthlyData).map(([month, value]) => ({
        month,
        value: Math.max(0, value),
      }));

      return NextResponse.json(result);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching inventory value trends:", error);
    return NextResponse.json({ error: "Failed to fetch inventory value trends" }, { status: 500 });
  }
}