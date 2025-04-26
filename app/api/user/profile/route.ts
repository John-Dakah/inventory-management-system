import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const userSession = cookies().get("user_session")?.value

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = verifySession(userSession)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await prisma.oUR_USER.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data without password
    const { password, ...userData } = user
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const userSession = cookies().get("user_session")?.value

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = verifySession(userSession)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const data = await request.json()

    // Update user profile
    const updatedUser = await prisma.oUR_USER.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        department: data.department,
        role: data.role,
        // Don't update password here
      },
    })

    // Return updated user data without password
    const { password, ...userData } = updatedUser
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update user profile",
      },
      { status: 500 },
    )
  }
}
