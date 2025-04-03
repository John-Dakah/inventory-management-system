"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BellIcon, CheckIcon, TrashIcon, Loader2Icon, AlertTriangleIcon, InfoIcon, CheckCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
    useNotifications()
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) {
      clearAllNotifications()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">View and manage your notifications</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
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
          <p className="text-muted-foreground">View and manage your notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleMarkAllRead} disabled={!notifications.some((n) => !n.read)}>
            <CheckIcon className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button variant="outline" onClick={handleClearAll} disabled={notifications.length === 0}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Clear All
          </Button>
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
          <TabsTrigger value="critical">
            Critical
            <Badge variant="secondary" className="ml-2">
              {notifications.filter((n) => n.type === "critical").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="warning">
            Warnings
            <Badge variant="secondary" className="ml-2">
              {notifications.filter((n) => n.type === "warning").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="info">
            Info
            <Badge variant="secondary" className="ml-2">
              {notifications.filter((n) => n.type === "info").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length > 0 ? (
                <AnimatePresence>
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex items-start justify-between rounded-lg border border-border p-4 transition-colors",
                          !notification.read && "bg-muted/50",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {notification.type === "critical" ? (
                              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
                            ) : notification.type === "warning" ? (
                              <BellIcon className="h-5 w-5 text-amber-500" />
                            ) : notification.type === "success" ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <InfoIcon className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={cn("font-medium", !notification.read && "font-semibold")}>
                                {notification.title}
                              </h4>
                              <Badge
                                variant={
                                  notification.type === "critical"
                                    ? "destructive"
                                    : notification.type === "warning"
                                      ? "outline"
                                      : notification.type === "success"
                                        ? "default"
                                        : "secondary"
                                }
                                className="px-1 py-0 text-[10px]"
                              >
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <div className="mt-1 flex items-center gap-3">
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                              {notification.actionUrl && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                  <a href={notification.actionUrl}>Take Action</a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-2">
                  <BellIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">No notifications found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

