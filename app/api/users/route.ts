import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Get the current user from the session
async function getCurrentUser() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth")

  if (!authCookie) {
    return null
  }

  return JSON.parse(authCookie.value)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    // Always filter by createdById - each admin can only see users they created
    const whereClause: any = {
      createdById: session.id,
    }

    // Add filters if provided
    if (status) {
      whereClause.status = status
    }

    if (role) {
      whereClause.role = role
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Count total users matching the filter
    const totalCount = await prisma.oUR_USER.count({
      where: whereClause,
    })

    // Get users with pagination
    const users = await prisma.oUR_USER.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Only admins can create users
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to create users" }, { status: 403 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.email || !data.fullName || !data.role || !data.password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user with email already exists
    const existingUser = await prisma.oUR_USER.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create the user
    const user = await prisma.oUR_USER.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        password: data.password, // In a real app, hash this password
        status: data.status || "active",
        createdById: session.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
