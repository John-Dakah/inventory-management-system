"use client"

import { useState, useEffect } from "react"
import {
  CheckCircleIcon,
  DatabaseIcon,
  HardDriveIcon,
  Loader2Icon,
  RefreshCwIcon,
  SaveIcon,
  ServerIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import { checkStorageQuota } from "@/lib/db"

export default function WarehouseSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [storageQuota, setStorageQuota] = useState<{
    total: string
    used: string
    percentUsed: number
    remaining: string
  } | null>(null)

  // Settings state
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState("15")
  const [notifyLowStock, setNotifyLowStock] = useState(true)
  const [lowStockThreshold, setLowStockThreshold] = useState("10")
  const [defaultLocation, setDefaultLocation] = useState("Main Warehouse")
  const [darkMode, setDarkMode] = useState(false)

  // Load settings and storage quota
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)

        // Load storage quota
        const quota = await checkStorageQuota()
        setStorageQuota(quota)

        // Load settings from localStorage
        const savedSettings = localStorage.getItem("warehouseSettings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setAutoSync(settings.autoSync ?? true)
          setSyncInterval(settings.syncInterval ?? "15")
          setNotifyLowStock(settings.notifyLowStock ?? true)
          setLowStockThreshold(settings.lowStockThreshold ?? "10")
          setDefaultLocation(settings.defaultLocation ?? "Main Warehouse")
          setDarkMode(settings.darkMode ?? false)

          // Apply dark mode
          if (settings.darkMode) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const settings = {
        autoSync,
        syncInterval,
        notifyLowStock,
        lowStockThreshold,
        defaultLocation,
        darkMode,
      }

      localStorage.setItem("warehouseSettings", JSON.stringify(settings))

      // Apply dark mode
      if (darkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Trigger manual sync
  const triggerSync = async () => {
    setIsSyncing(true)
    try {
      // In a real app, this would trigger the sync process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Sync Complete",
        description: "Your data has been synchronized with the server.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error syncing data:", error)
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Failed to synchronize data. Please try again.",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Clear local data
  const clearLocalData = async () => {
    if (confirm("Are you sure you want to clear all local data? This action cannot be undone.")) {
      try {
        // In a real app, this would clear the IndexedDB
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Data Cleared",
          description: "All local data has been cleared successfully.",
          duration: 3000,
        })
      } catch (error) {
        console.error("Error clearing data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to clear local data. Please try again.",
        })
      }
    }
  }

  // Toggle dark mode
  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked)
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure your warehouse management system</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your warehouse management system</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general settings for the warehouse system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLocation">Default Warehouse Location</Label>
                <Input
                  id="defaultLocation"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  placeholder="Enter default location"
                />
                <p className="text-xs text-muted-foreground">
                  This location will be used as the default for new stock items
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyLowStock">Low Stock Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications when items are running low</p>
                </div>
                <Switch id="notifyLowStock" checked={notifyLowStock} onCheckedChange={setNotifyLowStock} />
              </div>

              {notifyLowStock && (
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Items with quantity below this threshold will be marked as low stock
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Enable dark mode for the interface</p>
                </div>
                <Switch id="darkMode" checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>Configure how data is synchronized with the server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSync">Automatic Synchronization</Label>
                  <p className="text-xs text-muted-foreground">Automatically sync data with the server</p>
                </div>
                <Switch id="autoSync" checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              {autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                  <Select value={syncInterval} onValueChange={setSyncInterval}>
                    <SelectTrigger id="syncInterval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Manual Synchronization</Label>
                <div className="flex items-center gap-2">
                  <Button onClick={triggerSync} disabled={isSyncing} className="w-full">
                    {isSyncing ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon className="mr-2 h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Manually sync all pending changes with the server</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Connection Status</Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Connected to Server</p>
                    <p className="text-xs text-muted-foreground">Last synced: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>Manage local storage and database settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Storage Usage</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {storageQuota?.used || "Unknown"}</span>
                    <span>Available: {storageQuota?.remaining || "Unknown"}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${storageQuota?.percentUsed || 0}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {storageQuota?.percentUsed || 0}% of {storageQuota?.total || "Unknown"} used
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Database Management</Label>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={clearLocalData}>
                    <HardDriveIcon className="mr-2 h-4 w-4" />
                    Clear Local Data
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Warning: This will delete all locally stored data. Make sure to sync first.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Database Information</Label>
                <div className="rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">IndexedDB</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Local database for offline storage</p>

                  <div className="mt-4 flex items-center gap-2">
                    <ServerIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">PostgreSQL (Neon)</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Remote database for synchronized data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SyncManager />
    </div>
  )
}

