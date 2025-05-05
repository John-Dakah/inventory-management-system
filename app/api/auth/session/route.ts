import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get the auth cookie
    const authCookie = (await cookies()).get("auth")

    if (!authCookie || !authCookie.value) {
      return NextResponse.json({ user: null })
    }

    // Parse the session data
    const session = JSON.parse(authCookie.value)

    // Verify the user still exists in the database
    const user = await prisma.oUR_USER.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    })

    if (!user || user.status !== "ACTIVE") {
      // User no longer exists or is inactive, clear the cookie
      (await
        // User no longer exists or is inactive, clear the cookie
        cookies()).set({
        name: "auth",
        value: "",
        expires: new Date(0),
        path: "/",
      })
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null })
  }
}
