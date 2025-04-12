"use client"

import { useEffect } from "react"

import { useState } from "react"

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : false)
  const [isReallyOnline, setIsReallyOnline] = useState(false)

  // Check if we can actually reach the server
  const checkServerConnection = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch("/api/health-check", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
        headers: { pragma: "no-cache" },
      })

      clearTimeout(timeoutId)
      setIsReallyOnline(response.ok)
    } catch (error) {
      setIsReallyOnline(false)
    }
  }

  useEffect(() => {
    // Initial check
    checkServerConnection()

    const handleOnline = () => {
      setIsOnline(true)
      checkServerConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsReallyOnline(false)
    }

    // Re-check connection status periodically when navigator says we're online
    let intervalId: NodeJS.Timeout | null = null
    if (navigator.onLine) {
      intervalId = setInterval(checkServerConnection, 30000) // Check every 30 seconds
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  // Only return true if both navigator.onLine is true AND we can reach the server
  return isOnline && isReallyOnline
}

