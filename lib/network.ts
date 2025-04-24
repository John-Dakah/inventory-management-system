// Network status utility

// Check if online
export function isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true
  }
  
  // Register service worker
  export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registered with scope:", registration.scope)
        return registration
      } catch (error) {
        console.error("Service Worker registration failed:", error)
        return null
      }
    }
    return null
  }
  
  // Trigger sync
  export async function triggerSync(): Promise<void> {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready
      try {
        await registration.sync.register("sync-transactions")
      } catch (error) {
        console.error("Background sync could not be registered:", error)
      }
    }
  }
  
  