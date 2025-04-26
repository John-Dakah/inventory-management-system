import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

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

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    const user = await prisma.oUR_USER.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.oUR_USER.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update password" },
      { status: 500 },
    )
  }
}
