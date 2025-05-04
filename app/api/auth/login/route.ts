import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json()

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password and role are required" }, { status: 400 })
    }

    // Find the user with the provided email and role
    const user = await prisma.oUR_USER.findFirst({
      where: {
        email,
        role,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last visit
    await prisma.oUR_USER.update({
      where: { id: user.id },
      data: {
        lastVisit: new Date(),
        visits: { increment: 1 },
      },
    })

    // Create session data (exclude sensitive information)
    const session = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth",
      value: JSON.stringify(session),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
