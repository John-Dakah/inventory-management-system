"use client"

import { useEffect } from "react"

import { useState } from "react"

// Sync manager for handling data synchronization with the server

import { networkMonitor } from "./network-monitor"
import { getPendingChanges, markChangeAsSynced, deletePendingChange } from "./indexed-db"

interface SyncOptions {
  forceSync?: boolean
  onProgress?: (current: number, total: number) => void
  onComplete?: (success: number, failed: number) => void
  onError?: (error: Error) => void
}

class SyncManager {
  private static instance: SyncManager
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private listeners: Array<(status: { isSyncing: boolean; pendingCount: number }) => void> = []
  private pendingCount = 0

  private constructor() {
    // Initialize sync manager
    this.checkPendingCount()

    // Set up network status listener
    networkMonitor?.addListener(this.handleNetworkChange)

    // Start periodic sync checks
    this.startPeriodicSync()
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager()
    }
    return SyncManager.instance
  }

  private handleNetworkChange = async (status: any) => {
    // If we're back online with good quality, try to sync
    if (status.online && (status.quality === "high" || status.quality === "medium")) {
      await this.checkPendingCount()
      if (this.pendingCount > 0 && !this.isSyncing) {
        this.syncData()
      }
    }
  }

  private async checkPendingCount() {
    try {
      const pendingChanges = await getPendingChanges()
      this.pendingCount = pendingChanges.length
      this.notifyListeners()
    } catch (error) {
      console.error("Error checking pending count:", error)
    }
  }

  private startPeriodicSync() {
    // Check for pending changes and sync every 5 minutes
    this.syncInterval = setInterval(
      async () => {
        await this.checkPendingCount()

        const networkStatus = networkMonitor?.getStatus()
        if (
          this.pendingCount > 0 &&
          networkStatus?.online &&
          (networkStatus.quality === "high" || networkStatus.quality === "medium")
        ) {
          this.syncData()
        }
      },
      5 * 60 * 1000,
    )
  }

  public stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  public async syncData(options: SyncOptions = {}): Promise<boolean> {
    if (this.isSyncing && !options.forceSync) {
      return false
    }

    const networkStatus = networkMonitor?.getStatus()
    if (!networkStatus?.online && !options.forceSync) {
      console.log("Cannot sync while offline")
      return false
    }

    this.isSyncing = true
    this.notifyListeners()

    try {
      const pendingChanges = await getPendingChanges()

      if (pendingChanges.length === 0) {
        this.isSyncing = false
        this.notifyListeners()
        return true
      }

      let successCount = 0
      let failedCount = 0

      for (let i = 0; i < pendingChanges.length; i++) {
        const change = pendingChanges[i]

        if (options.onProgress) {
          options.onProgress(i + 1, pendingChanges.length)
        }

        try {
          // Process based on table and action
          switch (change.table) {
            case "products":
              await this.syncProductChange(change)
              break
            case "stockItems":
              await this.syncStockItemChange(change)
              break
            case "suppliers":
              await this.syncSupplierChange(change)
              break
            case "transactions":
              await this.syncTransactionChange(change)
              break
            default:
              console.warn(`Unknown table type: ${change.table}`)
              continue
          }

          // Mark as synced and delete
          await markChangeAsSynced(change.id)
          await deletePendingChange(change.id)
          successCount++
        } catch (error) {
          console.error(`Error syncing change ${change.id}:`, error)
          failedCount++
        }
      }

      if (options.onComplete) {
        options.onComplete(successCount, failedCount)
      }

      await this.checkPendingCount()
      this.isSyncing = false
      this.notifyListeners()

      return failedCount === 0
    } catch (error) {
      console.error("Sync error:", error)
      this.isSyncing = false
      this.notifyListeners()

      if (options.onError) {
        options.onError(error as Error)
      }

      return false
    }
  }

  private async syncProductChange(change: any): Promise<void> {
    const { action, data } = change

    let endpoint = "/api/products"
    let method = "POST"

    if (action === "update") {
      endpoint = `/api/products/${data.id}`
      method = "PUT"
    } else if (action === "delete") {
      endpoint = `/api/products/${data.id}`
      method = "DELETE"
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: action === "delete" ? undefined : JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync product change: ${response.statusText}`)
    }
  }

  private async syncStockItemChange(change: any): Promise<void> {
    const { action, data } = change

    let endpoint = "/api/stock"
    let method = "POST"

    if (action === "update") {
      endpoint = `/api/stock/${data.id}`
      method = "PUT"
    } else if (action === "delete") {
      endpoint = `/api/stock/${data.id}`
      method = "DELETE"
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: action === "delete" ? undefined : JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync stock item change: ${response.statusText}`)
    }
  }

  private async syncSupplierChange(change: any): Promise<void> {
    const { action, data } = change

    let endpoint = "/api/suppliers"
    let method = "POST"

    if (action === "update") {
      endpoint = `/api/suppliers/${data.id}`
      method = "PUT"
    } else if (action === "delete") {
      endpoint = `/api/suppliers/${data.id}`
      method = "DELETE"
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: action === "delete" ? undefined : JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync supplier change: ${response.statusText}`)
    }
  }

  private async syncTransactionChange(change: any): Promise<void> {
    const { action, data } = change

    // Transactions are usually only created, not updated or deleted
    const endpoint = "/api/transactions"
    const method = "POST"

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync transaction: ${response.statusText}`)
    }
  }

  public getStatus() {
    return {
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
    }
  }

  public addListener(callback: (status: { isSyncing: boolean; pendingCount: number }) => void) {
    this.listeners.push(callback)
    // Immediately notify with current status
    callback(this.getStatus())
    return () => this.removeListener(callback)
  }

  public removeListener(callback: (status: { isSyncing: boolean; pendingCount: number }) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  private notifyListeners() {
    const status = this.getStatus()
    this.listeners.forEach((listener) => listener(status))
  }

  public cleanup() {
    this.stopPeriodicSync()
    this.listeners = []
  }
}

// Export a singleton instance
export const syncManager = typeof window !== "undefined" ? SyncManager.getInstance() : null

// React hook to use sync status
export function useSyncStatus() {
  const [status, setStatus] = useState<{ isSyncing: boolean; pendingCount: number }>({
    isSyncing: false,
    pendingCount: 0,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const removeListener = syncManager?.addListener(setStatus)

    return () => {
      removeListener?.()
    }
  }, [])

  return {
    ...status,
    sync: (options?: SyncOptions) => syncManager?.syncData(options),
  }
}
