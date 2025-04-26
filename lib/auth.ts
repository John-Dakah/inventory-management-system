import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string;
    };
  }
}

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
        session.user.id = token.sub || ""; // Ensure `id` is always set
      }
      return session;
    },
  },
};