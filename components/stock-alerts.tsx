"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangleIcon, BellIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStockItems, type StockItem } from "@/lib/db"

interface StockAlert {
  id: string
  title: string
  message: string
  type: "warning" | "critical"
  item?: StockItem
}

export function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStockLevels = async () => {
      try {
        setIsLoading(true)

        // Get all stock items
        const stockItems = await getStockItems()

        // Generate alerts
        const newAlerts: StockAlert[] = []

        // Check for out of stock items
        const outOfStockItems = stockItems.filter((item) => item.status === "Out of Stock")
        if (outOfStockItems.length > 0) {
          // Add a summary alert
          newAlerts.push({
            id: "out-of-stock-summary",
            title: "Out of Stock Alert",
            message: `${outOfStockItems.length} items are completely out of stock and need immediate attention.`,
            type: "critical",
          })

          // Add individual alerts for each out of stock item
          outOfStockItems.forEach((item) => {
            newAlerts.push({
              id: `out-of-stock-${item.id}`,
              title: "Product Out of Stock",
              message: `${item.name} is completely out of stock.`,
              type: "critical",
              item,
            })
          })
        }

        // Check for low stock items
        const lowStockItems = stockItems.filter((item) => item.status === "Low Stock")
        if (lowStockItems.length > 0) {
          // Add a summary alert
          newAlerts.push({
            id: "low-stock-summary",
            title: "Low Stock Warning",
            message: `${lowStockItems.length} items are running low and should be restocked soon.`,
            type: "warning",
          })

          // Add individual alerts for the first 5 low stock items
          lowStockItems.slice(0, 5).forEach((item) => {
            newAlerts.push({
              id: `low-stock-${item.id}`,
              title: "Low Stock Warning",
              message: `${item.name} is running low (${item.quantity} remaining).`,
              type: "warning",
              item,
            })
          })
        }

        setAlerts(newAlerts)
      } catch (error) {
        console.error("Error checking stock levels:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStockLevels()

    // Set up interval to check stock levels periodically
    const intervalId = setInterval(checkStockLevels, 300000) // Check every 5 minutes

    return () => clearInterval(intervalId)
  }, [])

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  if (isLoading || alerts.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4 space-y-2"
      >
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between rounded-lg p-4 ${
              alert.type === "critical"
                ? "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center">
              {alert.type === "critical" ? (
                <AlertTriangleIcon className="mr-3 h-5 w-5" />
              ) : (
                <BellIcon className="mr-3 h-5 w-5" />
              )}
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm">{alert.message}</p>
                {alert.item && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium underline" asChild>
                    <a href={`/warehouse/stock?product=${alert.item.id}`}>Restock Now</a>
                  </Button>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="h-8 w-8 rounded-full p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

