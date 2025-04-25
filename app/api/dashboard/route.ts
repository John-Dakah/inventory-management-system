import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  console.log("Dashboard API called"); 

  try {
    // Debug Test 1: Basic API connectivity
    console.log("Starting dashboard data fetch..."); 
    
    // Debug Test 2: Verify Prisma connection
    console.log("Testing Prisma connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("Prisma connection successful");

    // Debug Test 3: Date handling verification
    console.log("Calculating date ranges...");
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    console.log(`Date range: ${startOfDay} to ${endOfDay}`);

    // Debug Test 4: Today's sales count
    console.log("Fetching today's sales count...");
    const todaySalesCount = await prisma.transaction.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "Completed",
      },
    });
    console.log(`Today's sales count: ${todaySalesCount}`); 

    // Debug Test 5: Today's sales total
    console.log("Fetching today's sales total...");
    const todaySalesTotal = await prisma.transaction.aggregate({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "Completed",
      },
      _sum: {
        total: true,
      },
    });
    const totalAmount = todaySalesTotal._sum.total || 0;
    console.log(`Today's sales total: ${totalAmount}`); 

    // Continue with other queries...
    console.log("Fetching recent sales...");
    const recentSales = await prisma.transaction.findMany({
      where: {
        status: "Completed",
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
      select: {
        reference: true,
        total: true,
        date: true,
      },
    });

    console.log("Fetching register status...");
    const cashDrawer = await prisma.stockItem.findUnique({
      where: {
        sku: "CASH_DRAWER",
      },
      select: {
        status: true,
        quantity: true,
      },
    });

    console.log("Fetching inventory stats...");
    const lowStockCount = await prisma.product.count({
      where: {
        quantity: {
          gt: 0,
          lte: 10,
        },
      },
    });

    const outOfStockCount = await prisma.product.count({
      where: {
        quantity: 0,
      },
    });

    console.log("Fetching customer count...");
    const customerCount = await prisma.oUR_USER.count();

    console.log("All data fetched successfully");
    return NextResponse.json({
      success: true,
      todaySalesCount,
      todaySalesTotal: totalAmount,
      recentSales,
      registerStatus: cashDrawer?.status || "closed",
      registerBalance: cashDrawer?.quantity || 0,
      lowStockCount,
      outOfStockCount,
      customerCount,
    });

  } catch (error) {
    console.error("FULL ERROR DETAILS:", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      errorRaw: error,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        internalError: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}