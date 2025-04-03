"use client"

import { useEffect } from "react"

export function registerServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope)
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
      })

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SYNC_COMPLETED") {
          console.log("Background sync completed at:", event.data.timestamp)
          // You could trigger a UI update or notification here
        } else if (event.data.type === "SYNC_FAILED") {
          console.error("Background sync failed:", event.data.error)
          // You could show an error notification here
        }
      })
    }
  }, [])

  return null
}

