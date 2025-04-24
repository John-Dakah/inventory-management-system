"use client"

import { useState } from "react"
import {
  SettingsIcon,
  BuildingIcon,
  BellIcon,
  PackageIcon,
  DatabaseIcon,
  PaletteIcon,
  SaveIcon,
  Loader2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SettingsPage() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  // General Settings
  const [companyName, setCompanyName] = useState("Acme Warehouse Inc.")
  const [companyAddress, setCompanyAddress] = useState("123 Warehouse St, Storage City, SC 12345")
  const [contactEmail, setContactEmail] = useState("admin@acmewarehouse.com")
  const [contactPhone, setContactPhone] = useState("(555) 123-4567")
  const [timezone, setTimezone] = useState("UTC-5")
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY")

  // Inventory Settings
  const [lowStockThreshold, setLowStockThreshold] = useState(25)
  const [criticalStockThreshold, setCriticalStockThreshold] = useState(10)
  const [inventoryMethod, setInventoryMethod] = useState("fifo")
  const [autoReorder, setAutoReorder] = useState(true)
  const [barcodeScanning, setBarcodeScanning] = useState(true)
  const [defaultWarehouse, setDefaultWarehouse] = useState("north")

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)
  const [newShipmentAlerts, setNewShipmentAlerts] = useState(true)
  const [stockOutAlerts, setStockOutAlerts] = useState(true)
  const [dailyReports, setDailyReports] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [monthlyReports, setMonthlyReports] = useState(true)

  // System Settings
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [dataRetention, setDataRetention] = useState("1year")
  const [logLevel, setLogLevel] = useState("error")
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Appearance Settings
  const [theme, setTheme] = useState("system")
  const [denseMode, setDenseMode] = useState(false)
  const [tableRows, setTableRows] = useState(10)
  const [dashboardLayout, setDashboardLayout] = useState("standard")

  const [hasAccess, setHasAccess] = useState(hasPermission("manage_settings"))

  const handleSaveSettings = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    })

    setIsSaving(false)
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <SettingsIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
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
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save All Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4" />
            <span className="hidden md:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4" />
            <span className="hidden md:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <PaletteIcon className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your company information and general preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-address">Company Address</Label>
                    <Textarea
                      id="company-address"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input id="contact-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-12">UTC-12 (Baker Island)</SelectItem>
                        <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                        <SelectItem value="UTC-7">UTC-7 (Mountain Time)</SelectItem>
                        <SelectItem value="UTC-6">UTC-6 (Central Time)</SelectItem>
                        <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                        <SelectItem value="UTC-4">UTC-4 (Atlantic Time)</SelectItem>
                        <SelectItem value="UTC">UTC (Universal Time)</SelectItem>
                        <SelectItem value="UTC+1">UTC+1 (Central European Time)</SelectItem>
                        <SelectItem value="UTC+2">UTC+2 (Eastern European Time)</SelectItem>
                        <SelectItem value="UTC+8">UTC+8 (China Standard Time)</SelectItem>
                        <SelectItem value="UTC+9">UTC+9 (Japan Standard Time)</SelectItem>
                        <SelectItem value="UTC+10">UTC+10 (Australian Eastern Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                        <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings */}
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>Configure how inventory is managed and tracked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Stock Thresholds</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="low-stock">Low Stock Threshold (%)</Label>
                      <span className="text-sm text-muted-foreground">{lowStockThreshold}%</span>
                    </div>
                    <Slider
                      id="low-stock"
                      min={5}
                      max={50}
                      step={5}
                      value={[lowStockThreshold]}
                      onValueChange={(value) => setLowStockThreshold(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Products will be marked as "Low Stock" when they fall below this percentage of their maximum stock
                      level.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="critical-stock">Critical Stock Threshold (%)</Label>
                      <span className="text-sm text-muted-foreground">{criticalStockThreshold}%</span>
                    </div>
                    <Slider
                      id="critical-stock"
                      min={1}
                      max={20}
                      step={1}
                      value={[criticalStockThreshold]}
                      onValueChange={(value) => setCriticalStockThreshold(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Products will be marked as "Critical" when they fall below this percentage of their maximum stock
                      level.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inventory-method">Inventory Counting Method</Label>
                    <Select value={inventoryMethod} onValueChange={setInventoryMethod}>
                      <SelectTrigger id="inventory-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                        <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                        <SelectItem value="fefo">FEFO (First Expired, First Out)</SelectItem>
                        <SelectItem value="avg">Average Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-warehouse">Default Warehouse</Label>
                    <Select value={defaultWarehouse} onValueChange={setDefaultWarehouse}>
                      <SelectTrigger id="default-warehouse">
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north">Warehouse North</SelectItem>
                        <SelectItem value="south">Warehouse South</SelectItem>
                        <SelectItem value="east">Warehouse East</SelectItem>
                        <SelectItem value="west">Warehouse West</SelectItem>
                        <SelectItem value="central">Warehouse Central</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-reorder">Automatic Reordering</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create purchase orders when stock is low
                      </p>
                    </div>
                    <Switch id="auto-reorder" checked={autoReorder} onCheckedChange={setAutoReorder} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="barcode-scanning">Barcode Scanning</Label>
                      <p className="text-sm text-muted-foreground">Enable barcode scanning for inventory operations</p>
                    </div>
                    <Switch id="barcode-scanning" checked={barcodeScanning} onCheckedChange={setBarcodeScanning} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure alerts and notifications for inventory events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable email notifications for important events</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alert Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when products fall below low stock threshold
                      </p>
                    </div>
                    <Switch
                      id="low-stock-alerts"
                      checked={lowStockAlerts}
                      onCheckedChange={setLowStockAlerts}
                      disabled={!emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-shipment-alerts">New Shipment Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify when new shipments are received</p>
                    </div>
                    <Switch
                      id="new-shipment-alerts"
                      checked={newShipmentAlerts}
                      onCheckedChange={setNewShipmentAlerts}
                      disabled={!emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="stock-out-alerts">Stock Out Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify when products are completely out of stock</p>
                    </div>
                    <Switch
                      id="stock-out-alerts"
                      checked={stockOutAlerts}
                      onCheckedChange={setStockOutAlerts}
                      disabled={!emailNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Scheduled Reports</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-reports">Daily Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive daily inventory summary reports</p>
                    </div>
                    <Switch
                      id="daily-reports"
                      checked={dailyReports}
                      onCheckedChange={setDailyReports}
                      disabled={!emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly inventory summary reports</p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                      disabled={!emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="monthly-reports">Monthly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive monthly inventory summary reports</p>
                    </div>
                    <Switch
                      id="monthly-reports"
                      checked={monthlyReports}
                      onCheckedChange={setMonthlyReports}
                      disabled={!emailNotifications}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and maintenance options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Backup</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup">Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup system data</p>
                  </div>
                  <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={backupFrequency} onValueChange={setBackupFrequency} disabled={!autoBackup}>
                    <SelectTrigger id="backup-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select value={dataRetention} onValueChange={setDataRetention}>
                    <SelectTrigger id="data-retention">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Historical transaction data older than this will be archived.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-level">System Log Level</Label>
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger id="log-level">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug (Verbose)</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Maintenance</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put system in maintenance mode (only admins can access)
                    </p>
                  </div>
                  <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Run System Diagnostics
                  </Button>
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Clear System Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your warehouse management system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                    <Label
                      htmlFor="theme-light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-2 w-8 rounded-lg bg-slate-200" />
                      </div>
                      <span className="text-sm font-medium">Light</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                    <Label
                      htmlFor="theme-dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-2 rounded-md bg-slate-900 p-2 shadow-sm">
                        <div className="h-2 w-8 rounded-lg bg-slate-700" />
                      </div>
                      <span className="text-sm font-medium">Dark</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                    <Label
                      htmlFor="theme-system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-2 rounded-md bg-gradient-to-r from-white to-slate-900 p-2 shadow-sm">
                        <div className="h-2 w-8 rounded-lg bg-gradient-to-r from-slate-200 to-slate-700" />
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Display Options</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dense-mode">Dense Mode</Label>
                    <p className="text-sm text-muted-foreground">Show more content with compact spacing</p>
                  </div>
                  <Switch id="dense-mode" checked={denseMode} onCheckedChange={setDenseMode} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="table-rows">Default Table Rows</Label>
                    <span className="text-sm text-muted-foreground">{tableRows} rows</span>
                  </div>
                  <Slider
                    id="table-rows"
                    min={5}
                    max={50}
                    step={5}
                    value={[tableRows]}
                    onValueChange={(value) => setTableRows(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">Number of rows to display in tables by default.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
                  <Select value={dashboardLayout} onValueChange={setDashboardLayout}>
                    <SelectTrigger id="dashboard-layout">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" className="w-8 h-8 rounded-full bg-blue-500" />
                      <Button variant="outline" className="w-8 h-8 rounded-full bg-green-500" />
                      <Button variant="outline" className="w-8 h-8 rounded-full bg-purple-500" />
                      <Button variant="outline" className="w-8 h-8 rounded-full bg-red-500" />
                      <Button variant="outline" className="w-8 h-8 rounded-full bg-orange-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">Custom Logo</Label>
                    <Input id="logo-upload" type="file" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

