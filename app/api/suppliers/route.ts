import { NextResponse } from "next/server";
<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all suppliers (only those created by the current user)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const suppliers = await prisma.supplier.findMany({
      where: {
        createdById: session.user.id, 
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
=======
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// GET: Fetch suppliers based on the user's role
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(authCookie.value);

    // Fetch suppliers based on user role
    let suppliers = [];

    if (session.role === "sales_person") {
      suppliers = await prisma.supplier.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      suppliers = await prisma.supplier.findMany({
        where: {
          createdById: session.id,
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
        },
        orderBy: { createdAt: "desc" },
      });
    }

<<<<<<< HEAD
    const totalSuppliers = await prisma.supplier.count({
      where: {
        createdById: session.user.id,
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
=======
    // Return the suppliers array directly
    return NextResponse.json(suppliers);
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}
<<<<<<< HEAD

// POST new supplier (automatically sets createdBy to current user)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    const supplier = await prisma.supplier.create({
      data: {
        ...data,
        createdById: session.user.id, // Set the creator automatically
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
=======
// POST: Create a new supplier
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(authCookie.value);
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.contactPerson || !data.email || !data.phone) {
      return NextResponse.json(
        { error: "Name, contact person, email, and phone are required" },
        { status: 400 }
      );
    }

    // Create the supplier with the current user as creator
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products || "",
        status: data.status || "Active",
        createdById: session.id, // Associate the supplier with the current user
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

<<<<<<< HEAD
// PUT update supplier (only if user is the creator)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...supplierData } = data;

    // First verify the supplier exists and belongs to this user
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
      select: {
        createdById: true,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    if (existingSupplier.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: supplierData,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
=======
// PUT: Update an existing supplier
export async function PUT(request: Request) {
  try {
    const cookieStore =await  cookies();
    const authCookie = cookieStore.get("auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(authCookie.value);
    const data = await request.json();

    // Validate required fields
    if (!data.id || !data.name || !data.contactPerson || !data.email || !data.phone) {
      return NextResponse.json(
        { error: "ID, name, contact person, email, and phone are required" },
        { status: 400 }
      );
    }

    // Update the supplier
    const updatedSupplier = await prisma.supplier.update({
      where: { id: data.id },
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products || "",
        status: data.status || "Active",
        updatedAt: new Date(), // Update the timestamp
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

<<<<<<< HEAD
// DELETE supplier (only if user is the creator)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
=======
// DELETE: Delete a supplier
export async function DELETE(request: Request) {
  try {
    const cookieStore =await cookies();
    const authCookie = cookieStore.get("auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(authCookie.value);
    const { id } = await request.json();
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c

    if (!id) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

<<<<<<< HEAD
    // First verify the supplier exists and belongs to this user
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    if (existingSupplier.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

=======
    // Delete the supplier
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
    await prisma.supplier.delete({
      where: { id },
    });

<<<<<<< HEAD
    return NextResponse.json({ success: true });
=======
    return NextResponse.json({ message: "Supplier deleted successfully" });
>>>>>>> 5bfc89bf736b174372854b4a6872bb8e0da51f2c
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}