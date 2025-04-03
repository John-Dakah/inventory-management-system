"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  CheckCircle,
  ChevronDown,
  ShoppingCart,
  Tag,
  Trash2,
  Users,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"

// Sample notification data
const sampleNotifications = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-001 has been placed by John Smith.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
  },
  {
    id: "2",
    type: "customer",
    title: "New Customer Registered",
    message: "Emily Johnson has created a new account.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
  },
  {
    id: "3",
    type: "inventory",
    title: "Low Stock Alert",
    message: "Premium Widget is running low (only 3 units left).",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: false,
  },
  {
    id: "4",
    type: "order",
    title: "Order Status Update",
    message: "Order #ORD-002 has been shipped.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
  },
  {
    id: "5",
    type: "promotion",
    title: "Promotion Created",
    message: "Summer Sale promotion has been created and is now active.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: true,
  },
  {
    id: "6",
    type: "inventory",
    title: "Product Out of Stock",
    message: "Basic Doodad is now out of stock.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: true,
  },
  {
    id: "7",
    type: "order",
    title: "Order Cancelled",
    message: "Order #ORD-005 has been cancelled by the customer.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "8",
    type: "system",
    title: "System Update",
    message: "The sales system will undergo maintenance tonight at 2:00 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
    read: true,
  },
  {
    id: "9",
    type: "promotion",
    title: "Promotion Ending Soon",
    message: "The Spring Clearance promotion will end in 24 hours.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
  {
    id: "10",
    type: "customer",
    title: "Customer Feedback",
    message: "Michael Brown has left a 5-star review.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState(sampleNotifications)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Apply filtering based on active tab
  useEffect(() => {
    let filtered = notifications

    switch (activeTab) {
      case "unread":
        filtered = notifications.filter((notification) => !notification.read)
        break
      case "orders":
        filtered = notifications.filter((notification) => notification.type === "order")
        break
      case "customers":
        filtered = notifications.filter((notification) => notification.type === "customer")
        break
      case "inventory":
        filtered = notifications.filter((notification) => notification.type === "inventory")
        break
      case "promotions":
        filtered = notifications.filter((notification) => notification.type === "promotion")
        break
      case "system":
        filtered = notifications.filter((notification) => notification.type === "system")
        break
    }

    setFilteredNotifications(filtered)
  }, [activeTab, notifications])

  // Get the icon for a notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "customer":
        return <Users className="h-4 w-4" />
      case "inventory":
        return <AlertCircle className="h-4 w-4" />
      case "promotion":
        return <Tag className="h-4 w-4" />
      case "system":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Handle marking a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    toast({
      title: "Notification marked as read",
      duration: 3000,
    })
  }

  // Handle marking all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All notifications marked as read",
      duration: 3000,
    })
  }

  // Handle delete notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    toast({
      title: "Notification deleted",
      duration: 3000,
    })
  }

  // Handle delete all notifications
  const deleteAllNotifications = () => {
    setNotifications([])
    toast({
      title: "All notifications deleted",
      duration: 3000,
    })
  }

  // Handle refresh notifications
  const refreshNotifications = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Notifications refreshed",
        duration: 3000,
      })
    }, 1000)
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      if (days === 1) {
        return "yesterday"
      } else if (days < 7) {
        return `${days} days ago`
      } else {
        return date.toLocaleDateString()
      }
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with the latest events</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with the latest events</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />

          <Button variant="outline" onClick={refreshNotifications} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={markAllAsRead}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={deleteAllNotifications} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            <Badge variant="secondary" className="ml-2">
              {notifications.filter((n) => !n.read).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-4 rounded-lg border p-4 ${!notification.read ? "bg-muted" : ""}`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      !notification.read ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-500 hover:text-red-600"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTitle>No notifications</AlertTitle>
              <AlertDescription>
                You don't have any notifications in this category. Check back later or try a different filter.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <SyncManager />
    </div>
  )
}

