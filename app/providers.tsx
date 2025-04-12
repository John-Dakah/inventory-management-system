"use client"

import type React from "react"

import { useEffect } from "react"
import { startAutoSync } from "@/lib/auto-sync"
import { initializeDatabase } from "@/lib/db-utils"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the database
    initializeDatabase().catch(console.error)

    // Start auto-sync service
    const cleanup = startAutoSync()

    return cleanup
  }, [])

  return <>{children}</>
}

