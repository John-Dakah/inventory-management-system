// import { NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// // GET all suppliers
// export async function GET() {
//   try {
//     const suppliers = await prisma.supplier.findMany({
//       orderBy: {
//         updatedAt: "desc",
//       },
//     })

//     return NextResponse.json(suppliers)
//   } catch (error) {
//     console.error("Error fetching suppliers:", error)
//     return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
//   }
// }

// // POST new supplier
// export async function POST(request: Request) {
//   try {
//     const data = await request.json()

//     // Remove any fields that aren't in the Prisma schema
//     const { syncStatus, deleted, notes, address, ...supplierData } = data

//     const supplier = await prisma.supplier.create({
//       data: supplierData,
//     })

//     return NextResponse.json(supplier, { status: 201 })
//   } catch (error) {
//     console.error("Error creating supplier:", error)
//     return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
//   }
// }

// // PUT update supplier
// export async function PUT(request: Request) {
//   try {
//     const data = await request.json()
//     const { id, syncStatus, deleted, notes, address, ...supplierData } = data

//     const supplier = await prisma.supplier.update({
//       where: { id },
//       data: supplierData,
//     })

//     return NextResponse.json(supplier)
//   } catch (error) {
//     console.error("Error updating supplier:", error)
//     return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all suppliers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const suppliers = await prisma.supplier.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive", // Case-insensitive search
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const totalSuppliers = await prisma.supplier.count({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({
      suppliers,
      total: totalSuppliers,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

// POST new supplier
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supplier = await prisma.supplier.create({
      data,
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

// PUT update supplier
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...supplierData } = data;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: supplierData,
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}