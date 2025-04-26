import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.oUR_USER.findUnique({
      where: { email: token.email ?? "" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ id: user.id });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}