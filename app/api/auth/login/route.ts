import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find user by email and role
    const user = await prisma.oUR_USER.findFirst({
      where: {
        email,
        role,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Create the auth cookie
    const authData = JSON.stringify({ email: user.email, role: user.role })
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
      { status: 200 }
    )

    response.cookies.set("auth", authData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json(
      { error: "Login failed, make sure you are connected to the internet" },
      { status: 500 }
    )
  }
}