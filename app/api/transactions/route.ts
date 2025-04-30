import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function handlePOST(request: Request) {
  try {
    const data = await request.json();
    const { items, subtotal, tax, discount, total, paymentMethod, customerId, cashierId, cashierName } = data;

    const transaction = await prisma.transaction.create({
      data: {
        reference: `SALE-${Date.now()}`,
        subtotal,
        tax,
        discount: discount ?? 0,
        total,
        paymentMethod,
        status: "Completed",
        notes: `Sale via ${paymentMethod}`,
        customerId,
        cashierId,
        cashierName,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
    });

    // Decrement product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.reference,
      transaction,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
  }
}

async function handleGET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase();
    const paymentMethodFilter = searchParams.get("paymentMethod");
    const statusFilter = searchParams.get("status");
    const dateFilter = searchParams.get("date");

    const transactions = await prisma.transaction.findMany({
      include: {
        customer: true, 
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = transactions
      .map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        customer: transaction.customer ? `${transaction.customer.fullName}` : "Guest",
        items: transaction.items.length,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        cashier: transaction.cashierName ?? "Admin",
      }))
      .filter((transaction) => {
        if (search && !transaction.customer.toLowerCase().includes(search)) {
          return false;
        }
        if (paymentMethodFilter && transaction.paymentMethod !== paymentMethodFilter) {
          return false;
        }
        if (statusFilter && transaction.status !== statusFilter) {
          return false;
        }
        if (dateFilter) {
          const date = new Date(transaction.date);
          const filterDate = new Date(dateFilter);
          if (date.toDateString() !== filterDate.toDateString()) {
            return false;
          }
        }
        return true;
      });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export { handlePOST as POST, handleGET as GET };
