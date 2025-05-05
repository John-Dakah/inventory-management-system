// app/api/reports/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    // Sales KPIs
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const [todaySales, monthSales, last7DaysSales] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { total: true },
        where: {
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { total: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.transaction.aggregate({
        _sum: { total: true },
        where: { date: { gte: weekAgo } },
      }),
    ]);

    // Low stock alerts
    const lowStock = await prisma.stockItem.findMany({
      where: { quantity: { lt: 10 } },
      select: { name: true, quantity: true },
    });

    // Sales trend
    const salesTrend = await prisma.transaction.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      select: {
        date: true,
        total: true,
      },
      orderBy: { date: 'asc' },
    });

    // Warehouse report
    const [totalItemsInStock, totalItemsOutOfStock] = await Promise.all([
      prisma.stockItem.count({
        where: { quantity: { gt: 0 } },
      }),
      prisma.stockItem.count({
        where: { quantity: 0 },
      }),
    ]);

    // Financial report
    let totalRevenue = await prisma.transaction.aggregate({
      _sum: { total: true },
    });

    const totalExpenses = { _sum: { amount: 0 } }; // Defaulting expenses to 0 as 'expense' model does not exist

    return NextResponse.json({
      todaySales: todaySales._sum.total ?? 0,
      monthSales: monthSales._sum.total ?? 0,
      last7DaysSales: last7DaysSales._sum.total ?? 0,
      lowStock,
      salesTrend,
      warehouseReport: {
        itemsInStock: totalItemsInStock,
        itemsOutOfStock: totalItemsOutOfStock,
      },
      financialReport: {
        totalRevenue: totalRevenue._sum.total ?? 0,
        expenses: totalExpenses._sum.amount ?? 0,
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
