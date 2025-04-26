import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Assuming you're using Prisma as your ORM
import { cookies } from "next/headers" // For accessing cookies in Next.js

export async function GET() {
  try {
    // Retrieve the authentication cookie
    const authCookie = cookies().get("auth")

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the cookie to get user data (email, role, etc.)
    const { email, role } = JSON.parse(authCookie.value)

    // Fetch user data from the database based on email and role
    const user = await prisma.oUR_USER.findFirst({
      where: {
        email,
        role,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Respond with the user data
    return NextResponse.json(
      {
        message: "User data fetched successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Error fetching user data" },
      { status: 500 }
    )
  }
}
