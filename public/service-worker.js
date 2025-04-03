// Service Worker for Inventory Management System

const CACHE_NAME = "inventory-cache-v1"
const OFFLINE_URL = "/offline.html"

// Install event - cache essential resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL, "/", "/inventory", "/styles.css", "/main.js", "/placeholder.svg"])
    }),
  )

  // Activate the service worker immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
      )
    }),
  )

  // Claim clients so the service worker is in control immediately
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension")) {
    return
  }

  // Handle API requests differently
  if (event.request.url.includes("/api/")) {
    // For API requests, try network first, then fall back to offline handling
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "You are offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      }),
    )
    return
  }

  // For page navigations, use a network-first approach
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL)
      }),
    )
    return
  }

  // For other requests, use a cache-first approach
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache)
              })
            }
            return fetchResponse
          })
          .catch(() => {
            // If both cache and network fail, return a fallback
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match("/placeholder.svg")
            }
            return new Response("Network error occurred", { status: 408 })
          })
      )
    }),
  )
})

// Background sync event
self.addEventListener("sync", (event) => {
  if (event.tag === "inventory-sync") {
    event.waitUntil(syncData())
  }
})

// Function to sync data with the server
async function syncData() {
  try {
    // Open the database
    const db = await openDB()

    // Get pending sync items
    const tx = db.transaction("syncQueue", "readonly")
    const store = tx.objectStore("syncQueue")
    const items = await store.getAll()
    await tx.complete

    if (items.length === 0) {
      return
    }

    // Group items into batches
    const batchSize = 10
    const batches = []

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    // Process each batch
    for (const batch of batches) {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Update local database based on sync results
      const updateTx = db.transaction(["products", "syncQueue"], "readwrite")
      const productStore = updateTx.objectStore("products")
      const syncStore = updateTx.objectStore("syncQueue")

      for (const item of result.items) {
        if (item.success) {
          // Update product sync status
          const product = await productStore.get(item.id)
          if (product) {
            product.syncStatus = "synced"
            await productStore.put(product)
          }

          // Remove from sync queue
          await syncStore.delete(item.id)
        } else {
          // Mark as error
          const product = await productStore.get(item.id)
          if (product) {
            product.syncStatus = "error"
            await productStore.put(product)
          }
        }
      }

      await updateTx.complete
    }

    // Notify clients about successful sync
    const clients = await self.clients.matchAll({ type: "window" })
    for (const client of clients) {
      client.postMessage({
        type: "SYNC_COMPLETED",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Background sync failed:", error)

    // Notify clients about sync failure
    const clients = await self.clients.matchAll({ type: "window" })
    for (const client of clients) {
      client.postMessage({
        type: "SYNC_FAILED",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    // Throw error to trigger retry
    throw error
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("inventory-db", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains("products")) {
        const productStore = db.createObjectStore("products", { keyPath: "id" })
        productStore.createIndex("by-modified", "modified")
        productStore.createIndex("by-sync-status", "syncStatus")
      }

      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id" })
      }
    }
  })
}

