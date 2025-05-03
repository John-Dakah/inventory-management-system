import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Get all users created by the current admin (excluding the admin)
export async function GET(req: NextRequest) {
  try {
    // Retrieve the authentication cookie
    const authCookie = cookies().get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the cookie to get user data
    const { id, role } = JSON.parse(authCookie.value)

    // Check if the user is an admin
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch users created by this admin, excluding the admin themselves
    const users = await prisma.oUR_USER.findMany({
      where: {
        createdById: id,
        id: { not: id }, // Exclude the admin themselves
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
      },
    })

    return NextResponse.json({
      message: "Users fetched successfully",
      users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
  }
}

// Create a new user by the admin
export async function POST(req: NextRequest) {
  try {
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

    // Get user data from request body
    const userData = await req.json()

    // Hash the password if provided
    if (userData.password) {
      const bcrypt = require("bcryptjs")
      userData.password = await bcrypt.hash(userData.password, 10)
    }

    // Create new user with the admin as creator
    const newUser = await prisma.oUR_USER.create({
      data: {
        ...userData,
        createdById: id,
      },
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}
