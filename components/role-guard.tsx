"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { UserRole } from "@/lib/auth"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  userRole?: UserRole
}

export function RoleGuard({ children, allowedRoles, userRole }: RoleGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push("/login")
    }
  }, [userRole, allowedRoles, router])

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}

