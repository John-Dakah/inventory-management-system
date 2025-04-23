// lib/sync-utils.ts
export function addToSyncQueue(payload: {
    id: string
    operation: "create" | "update" | "delete"
    data: any
    type: string
    timestamp: number
  }) {
    const queueKey = `sync-queue-${payload.type}`
    const currentQueue = JSON.parse(localStorage.getItem(queueKey) || "[]")
    currentQueue.push(payload)
    localStorage.setItem(queueKey, JSON.stringify(currentQueue))
  }
  