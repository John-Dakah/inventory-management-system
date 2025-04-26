import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
// filepath: c:\Users\DIGITAL COGNOSCENTE\inventory-system--14-\lib\auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};

export type UserRole = "admin" | "warehouse_manager" | "sales_person"

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  department?: string
  status: string
}

export const checkAccess = (userRole: UserRole, requiredRole: UserRole[]): boolean => {
  if (userRole === "admin") return true
  return requiredRole.includes(userRole)
}

export const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "warehouse_manager":
      return "/warehouse/dashboard"
    case "sales_person":
      return "/pos"
    default:
      return "/login"
  }
}

const SECRET_KEY = process.env.JWT_SECRET || 23 // Use environment variable in production

export const verifySession = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string }
    return decoded.userId // Return the user ID from the token
  } catch (error) {
    console.error("Invalid session token:", error)
    return null
  }
}

export const createSession = (userId: string): string => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "7d" })
}

export const getCurrentUser = async (): Promise<User | null> => {
  const userSession = cookies().get("user_session")?.value

  if (!userSession) return null

  const userId = verifySession(userSession)
  if (!userId) return null

  try {
    const user = await prisma.oUR_USER.findUnique({
      where: { id: userId },
    })

    if (!user) return null

    // Return user without sensitive information
    const { password, ...safeUser } = user
    return safeUser as User
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}
