import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase()

    // Find user by email
    const user = await prisma.oUR_USER.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user has the selected role
    if (user.role !== role) {
      return NextResponse.json({ error: "Invalid role for this user" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account is inactive" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session token
    const sessionToken = createSession(user.id)

    // Set session cookie
    cookies().set({
      name: "user_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to login" }, { status: 500 })
  }
}
