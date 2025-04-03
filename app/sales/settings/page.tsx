"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Settings, CreditCard, Bell, Server, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      businessName: "Your Business Name",
      address: "123 Main Street, City, Country",
      phone: "+1 (555) 123-4567",
      email: "info@yourbusiness.com",
      website: "https://yourbusiness.com",
      currency: "USD",
      timezone: "UTC-5",
      logo: "/placeholder.svg?height=100&width=100",
    },
    sales: {
      defaultTax: "7.5",
      allowPartialPayments: true,
      requireCustomerInfo: true,
      allowDiscounts: true,
      defaultDiscountType: "percentage",
      receiptFooter: "Thank you for your business!",
      invoicePrefix: "INV-",
      orderPrefix: "ORD-",
    },
    notifications: {
      lowStockAlerts: true,
      lowStockThreshold: "10",
      orderNotifications: true,
      newCustomerNotifications: true,
      systemUpdates: true,
      emailNotifications: true,
      pushNotifications: false,
    },
    integration: {
      syncInterval: "15",
      autoSync: true,
      connectToWarehouse: true,
      shareCustomerData: true,
      shareInventory: true,
    },
  })

  useEffect(() => {
    // Simulate loading data from API
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle settings change
  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your sales system settings</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your sales system settings</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="sales">
            <CreditCard className="mr-2 h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Server className="mr-2 h-4 w-4" />
            Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your basic business information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={settings.general.businessName}
                      onChange={(e) => handleSettingChange("general", "businessName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.general.phone}
                      onChange={(e) => handleSettingChange("general", "phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    value={settings.general.address}
                    onChange={(e) => handleSettingChange("general", "address", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.general.email}
                      onChange={(e) => handleSettingChange("general", "email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.general.website}
                      onChange={(e) => handleSettingChange("general", "website", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.general.currency}
                      onValueChange={(value) => handleSettingChange("general", "currency", value)}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.general.timezone}
                      onValueChange={(value) => handleSettingChange("general", "timezone", value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-12">UTC-12:00</SelectItem>
                        <SelectItem value="UTC-11">UTC-11:00</SelectItem>
                        <SelectItem value="UTC-10">UTC-10:00</SelectItem>
                        <SelectItem value="UTC-9">UTC-09:00</SelectItem>
                        <SelectItem value="UTC-8">UTC-08:00</SelectItem>
                        <SelectItem value="UTC-7">UTC-07:00</SelectItem>
                        <SelectItem value="UTC-6">UTC-06:00</SelectItem>
                        <SelectItem value="UTC-5">UTC-05:00</SelectItem>
                        <SelectItem value="UTC-4">UTC-04:00</SelectItem>
                        <SelectItem value="UTC-3">UTC-03:00</SelectItem>
                        <SelectItem value="UTC-2">UTC-02:00</SelectItem>
                        <SelectItem value="UTC-1">UTC-01:00</SelectItem>
                        <SelectItem value="UTC">UTC+00:00</SelectItem>
                        <SelectItem value="UTC+1">UTC+01:00</SelectItem>
                        <SelectItem value="UTC+2">UTC+02:00</SelectItem>
                        <SelectItem value="UTC+3">UTC+03:00</SelectItem>
                        <SelectItem value="UTC+4">UTC+04:00</SelectItem>
                        <SelectItem value="UTC+5">UTC+05:00</SelectItem>
                        <SelectItem value="UTC+6">UTC+06:00</SelectItem>
                        <SelectItem value="UTC+7">UTC+07:00</SelectItem>
                        <SelectItem value="UTC+8">UTC+08:00</SelectItem>
                        <SelectItem value="UTC+9">UTC+09:00</SelectItem>
                        <SelectItem value="UTC+10">UTC+10:00</SelectItem>
                        <SelectItem value="UTC+11">UTC+11:00</SelectItem>
                        <SelectItem value="UTC+12">UTC+12:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={settings.general.logo}
                    onChange={(e) => handleSettingChange("general", "logo", e.target.value)}
                  />
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Settings</CardTitle>
              <CardDescription>Configure how your sales system operates</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTax">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTax"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.sales.defaultTax}
                      onChange={(e) => handleSettingChange("sales", "defaultTax", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDiscountType">Default Discount Type</Label>
                    <Select
                      value={settings.sales.defaultDiscountType}
                      onValueChange={(value) => handleSettingChange("sales", "defaultDiscountType", value)}
                    >
                      <SelectTrigger id="defaultDiscountType">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      value={settings.sales.invoicePrefix}
                      onChange={(e) => handleSettingChange("sales", "invoicePrefix", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderPrefix">Order Prefix</Label>
                    <Input
                      id="orderPrefix"
                      value={settings.sales.orderPrefix}
                      onChange={(e) => handleSettingChange("sales", "orderPrefix", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Receipt Footer Text</Label>
                  <Textarea
                    id="receiptFooter"
                    value={settings.sales.receiptFooter}
                    onChange={(e) => handleSettingChange("sales", "receiptFooter", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowPartialPayments" className="flex flex-col">
                      <span>Allow Partial Payments</span>
                      <span className="text-sm text-muted-foreground">
                        Allow customers to make partial payments on their orders
                      </span>
                    </Label>
                    <Switch
                      id="allowPartialPayments"
                      checked={settings.sales.allowPartialPayments}
                      onCheckedChange={(checked) => handleSettingChange("sales", "allowPartialPayments", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireCustomerInfo" className="flex flex-col">
                      <span>Require Customer Information</span>
                      <span className="text-sm text-muted-foreground">Require customer details for all sales</span>
                    </Label>
                    <Switch
                      id="requireCustomerInfo"
                      checked={settings.sales.requireCustomerInfo}
                      onCheckedChange={(checked) => handleSettingChange("sales", "requireCustomerInfo", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowDiscounts" className="flex flex-col">
                      <span>Allow Discounts</span>
                      <span className="text-sm text-muted-foreground">
                        Enable applying discounts to products and orders
                      </span>
                    </Label>
                    <Switch
                      id="allowDiscounts"
                      checked={settings.sales.allowDiscounts}
                      onCheckedChange={(checked) => handleSettingChange("sales", "allowDiscounts", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system alerts and notifications</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      value={settings.notifications.lowStockThreshold}
                      onChange={(e) => handleSettingChange("notifications", "lowStockThreshold", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get notified when product quantity falls below this threshold
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowStockAlerts" className="flex flex-col">
                      <span>Low Stock Alerts</span>
                      <span className="text-sm text-muted-foreground">Get notified when products are running low</span>
                    </Label>
                    <Switch
                      id="lowStockAlerts"
                      checked={settings.notifications.lowStockAlerts}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "lowStockAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderNotifications" className="flex flex-col">
                      <span>Order Notifications</span>
                      <span className="text-sm text-muted-foreground">Get notified when new orders are placed</span>
                    </Label>
                    <Switch
                      id="orderNotifications"
                      checked={settings.notifications.orderNotifications}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "orderNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newCustomerNotifications" className="flex flex-col">
                      <span>New Customer Notifications</span>
                      <span className="text-sm text-muted-foreground">Get notified when new customers register</span>
                    </Label>
                    <Switch
                      id="newCustomerNotifications"
                      checked={settings.notifications.newCustomerNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifications", "newCustomerNotifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemUpdates" className="flex flex-col">
                      <span>System Update Notifications</span>
                      <span className="text-sm text-muted-foreground">
                        Get notified about system updates and maintenance
                      </span>
                    </Label>
                    <Switch
                      id="systemUpdates"
                      checked={settings.notifications.systemUpdates}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "systemUpdates", checked)}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Label>Notification Channels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "emailNotifications", checked === true)
                        }
                      />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pushNotifications"
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "pushNotifications", checked === true)
                        }
                      />
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure how your sales system integrates with other systems</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.integration.syncInterval}
                      onChange={(e) => handleSettingChange("integration", "syncInterval", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">How often to sync data with the warehouse system</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSync" className="flex flex-col">
                      <span>Automatic Synchronization</span>
                      <span className="text-sm text-muted-foreground">
                        Automatically sync data with warehouse system
                      </span>
                    </Label>
                    <Switch
                      id="autoSync"
                      checked={settings.integration.autoSync}
                      onCheckedChange={(checked) => handleSettingChange("integration", "autoSync", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="connectToWarehouse" className="flex flex-col">
                      <span>Connect to Warehouse System</span>
                      <span className="text-sm text-muted-foreground">
                        Enable integration with the warehouse management system
                      </span>
                    </Label>
                    <Switch
                      id="connectToWarehouse"
                      checked={settings.integration.connectToWarehouse}
                      onCheckedChange={(checked) => handleSettingChange("integration", "connectToWarehouse", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shareInventory" className="flex flex-col">
                      <span>Share Inventory Data</span>
                      <span className="text-sm text-muted-foreground">
                        Share inventory data between sales and warehouse systems
                      </span>
                    </Label>
                    <Switch
                      id="shareInventory"
                      checked={settings.integration.shareInventory}
                      onCheckedChange={(checked) => handleSettingChange("integration", "shareInventory", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shareCustomerData" className="flex flex-col">
                      <span>Share Customer Data</span>
                      <span className="text-sm text-muted-foreground">
                        Share customer data between sales and warehouse systems
                      </span>
                    </Label>
                    <Switch
                      id="shareCustomerData"
                      checked={settings.integration.shareCustomerData}
                      onCheckedChange={(checked) => handleSettingChange("integration", "shareCustomerData", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <SyncManager />
    </div>
  )
}

