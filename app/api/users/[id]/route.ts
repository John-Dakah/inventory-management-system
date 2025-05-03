import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Get a specific user by ID (only if created by the current admin)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Retrieve the authentication cookie
    const authCookie = cookies().get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the cookie to get admin data
    const { id, role } = JSON.parse(authCookie.value)

    // Check if the user is an admin
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch the user and verify they were created by this admin
    const user = await prisma.oUR_USER.findFirst({
      where: {
        id: userId,
        createdById: id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        department: true,
        joinDate: true,
        lastVisit: true,
        status: true,
        type: true,
        visits: true,
        totalSpent: true,
        createdAt: true,
        transactions: {
          select: {
            id: true,
            reference: true,
            date: true,
            total: true,
            status: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "User fetched successfully",
      user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 })
  }
}

// Update a user (only if created by the current admin)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Retrieve the authentication cookie
    const authCookie = cookies().get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the cookie to get admin data
    const { id, role } = JSON.parse(authCookie.value)

    // Check if the user is an admin
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Verify the user was created by this admin
    const existingUser = await prisma.oUR_USER.findFirst({
      where: {
        id: userId,
        createdById: id,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get update data from request body
    const updateData = await req.json()

    // Update the user
    const updatedUser = await prisma.oUR_USER.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    })

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error updating user" }, { status: 500 })
  }
}

// Delete a user (only if created by the current admin)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Retrieve the authentication cookie
    const authCookie = cookies().get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the cookie to get admin data
    const { id, role } = JSON.parse(authCookie.value)

    // Check if the user is an admin
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Verify the user was created by this admin
    const existingUser = await prisma.oUR_USER.findFirst({
      where: {
        id: userId,
        createdById: id,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete the user
    await prisma.oUR_USER.delete({
      where: {
        id: userId,
      },
    })

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 })
  }
}
