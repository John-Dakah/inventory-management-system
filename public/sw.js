
const CACHE_NAME = "pos-cache-v1"
const API_CACHE_NAME = "pos-api-cache-v1"
const STATIC_ASSETS = ["/", "/pos", "/offline", "/placeholder.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME).map((name) => caches.delete(name)),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const url = new URL(event.request.url)

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(event.request))
  } else {
    event.respondWith(handleStaticRequest(event.request))
  }
})

async function handleApiRequest(request) {
  const url = new URL(request.url)

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok && request.method === "GET") {
      const responseToCache = networkResponse.clone()
      caches.open(API_CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache)
      })
    }

    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

   
    if (request.method === "POST") {
    
      return new Response(
        JSON.stringify({
          error: "offline",
          offlineStored: true,
          message: "You are offline. This transaction will be processed when you reconnect.",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 503,
        },
      )
    }

    return new Response(
      JSON.stringify({
        error: "offline",
        message: "You are offline. Please check your connection.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 503,
      },
    )
  }
}


async function handleStaticRequest(request) {
 
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone()
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache)
      })
    }

    return networkResponse
  } catch (error) {
    if (request.headers.get("Accept")?.includes("text/html")) {
      return caches.match("/offline")
    }
    return new Response("Offline. Resource unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_NEEDED",
      })
    })
  })
}

