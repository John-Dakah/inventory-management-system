import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Retrieve the authentication cookie
    const authCookies = await cookies();
    const authCookie = authCookies.get("auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the cookie to get user data
    const { id } = JSON.parse(authCookie.value)

    // Fetch user data from the database
    const user = await prisma.oUR_USER.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        department: true,
        status: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Respond with the user data
    return NextResponse.json(
      {
        message: "User data fetched successfully",
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Error fetching user data" }, { status: 500 })
  }
}
