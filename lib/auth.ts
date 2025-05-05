
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: UserRole;

    };
  }
}

export type UserRole = "admin" | "warehouse_manager" | "sales_person";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  status: string;
}

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ""; 
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;

      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
};


export const checkAccess = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  if (userRole === "admin") return true;
  return requiredRoles.includes(userRole);
};

export const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "warehouse_manager": return "/warehouse/dashboard";
    case "sales_person": return "/pos";
    default: return "/login";
  }
};

export const verifySession = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error("Invalid JWT session:", error);
    return null;
  }
};

export const createSession = (userId: string): string => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "7d" });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const cookieStore = cookies();
  const sessionToken = (await cookieStore).get("user_session")?.value;

  if (!sessionToken) return null;

  const userId = verifySession(sessionToken);
  if (!userId) return null;

  try {
    const user = await prisma.oUR_USER.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Exclude sensitive data
    const { password, ...safeUser } = user as any;
    return safeUser as User;
  } catch (error) {
    console.error("Failed to retrieve current user:", error);
    return null;
  }
};

// ✅ Auth helper for API routes (Request context)
export async function auth(_request?: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// ✅ Permission-based access checker
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissionMap: Record<string, UserRole[]> = {
    open_register: ["admin", "sales_person"],
    close_register: ["admin", "sales_person"],
    perform_payouts: ["admin"],
    view_reports: ["admin", "warehouse_manager"],
  };

  const allowedRoles = permissionMap[permission] || [];
  return checkAccess(userRole, allowedRoles);
}

