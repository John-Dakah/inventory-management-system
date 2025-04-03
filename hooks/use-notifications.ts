"use client"

import { useState, useEffect } from "react"
import { getStockItems } from "@/lib/db"

export interface Notification {
  id: string
  title: string
  message: string
  type: "warning" | "critical" | "info" | "success"
  read: boolean
  timestamp: string
  itemId?: string
  actionUrl?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true)

        // Get stored notifications from localStorage
        const storedNotifications = localStorage.getItem("warehouseNotifications")
        const existingNotifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []

        // Get stock items to generate new notifications
        const stockItems = await getStockItems()

        // Generate new notifications
        const newNotifications: Notification[] = []

        // Check for out of stock items
        const outOfStockItems = stockItems.filter((item) => item.quantity === 0)
        outOfStockItems.forEach((item) => {
          // Check if notification already exists
          const existingNotification = existingNotifications.find(
            (n) => n.itemId === item.id && n.type === "critical" && n.title.includes("Out of Stock"),
          )

          if (!existingNotification) {
            newNotifications.push({
              id: `out-of-stock-${item.id}-${Date.now()}`,
              title: "Product Out of Stock",
              message: `${item.name} is completely out of stock.`,
              type: "critical",
              read: false,
              timestamp: new Date().toISOString(),
              itemId: item.id,
              actionUrl: `/warehouse/stock?product=${item.id}`,
            })
          }
        })

        // Check for low stock items
        const lowStockItems = stockItems.filter((item) => item.quantity > 0 && item.quantity <= 10)
        lowStockItems.forEach((item) => {
          // Check if notification already exists
          const existingNotification = existingNotifications.find(
            (n) => n.itemId === item.id && n.type === "warning" && n.title.includes("Low Stock"),
          )

          if (!existingNotification) {
            newNotifications.push({
              id: `low-stock-${item.id}-${Date.now()}`,
              title: "Low Stock Warning",
              message: `${item.name} is running low (${item.quantity} remaining).`,
              type: "warning",
              read: false,
              timestamp: new Date().toISOString(),
              itemId: item.id,
              actionUrl: `/warehouse/stock?product=${item.id}`,
            })
          }
        })

        // Combine existing and new notifications
        const allNotifications = [...newNotifications, ...existingNotifications]

        // Sort by timestamp (newest first)
        allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        // Update state and localStorage
        setNotifications(allNotifications)
        localStorage.setItem("warehouseNotifications", JSON.stringify(allNotifications))
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()

    // Set up interval to check for new notifications
    const intervalId = setInterval(loadNotifications, 300000) // Check every 5 minutes

    return () => clearInterval(intervalId)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      )
      localStorage.setItem("warehouseNotifications", JSON.stringify(updated))
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((notification) => ({ ...notification, read: true }))
      localStorage.setItem("warehouseNotifications", JSON.stringify(updated))
      return updated
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((notification) => notification.id !== id)
      localStorage.setItem("warehouseNotifications", JSON.stringify(updated))
      return updated
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    localStorage.removeItem("warehouseNotifications")
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  }
}

