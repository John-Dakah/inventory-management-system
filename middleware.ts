import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This middleware ensures that the sync API is protected
export function middleware(request: NextRequest) {
  // You can add authentication checks here
  // For example, check for a valid session or API key

  // For now, we'll just check that the request has the correct content type
  if (request.nextUrl.pathname === "/api/sync" && request.method === "POST") {
    if (request.headers.get("content-type") !== "application/json") {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/sync",
}