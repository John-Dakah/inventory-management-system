import { NextResponse } from "next/server";
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
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Return the suppliers array directly
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}
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
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

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
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

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

    if (!id) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    // Delete the supplier
    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}