"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  FileIcon,
  FileTextIcon,
  Loader2Icon,
  PrinterIcon,
  DownloadIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

export default function SalesReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("sales")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Mock data for sales reports
  const [salesData, setSalesData] = useState({
    dailySales: [] as { date: string; sales: number; orders: number }[],
    topProducts: [] as { name: string; sales: number }[],
    salesByCategory: [] as { name: string; value: number }[],
    paymentMethods: [] as { name: string; value: number }[],
    performance: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      comparisonToLastPeriod: 0,
    },
  })

  const [customerData, setCustomerData] = useState({
    newCustomers: [] as { date: string; count: number }[],
    customerRetention: { retained: 0, lost: 0 },
    topCustomers: [] as { name: string; purchases: number; value: number }[],
    purchaseFrequency: { "1-time": 0, "2-3 times": 0, "4+ times": 0 },
  })

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true)

        // In a real app, this would load data from an API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Generate mock sales data
        const days = 30
        const dailySales = Array.from({ length: days }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (days - 1) + i)
          return {
            date: date.toISOString().split("T")[0],
            sales: Math.floor(Math.random() * 5000) + 1000,
            orders: Math.floor(Math.random() * 50) + 10,
          }
        })

        const totalSales = dailySales.reduce((sum, day) => sum + day.sales, 0)
        const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0)

        // Generate top products
        const topProducts = [
          { name: "Premium Widget", sales: 4500 },
          { name: "Standard Gadget", sales: 3800 },
          { name: "Deluxe Thingamajig", sales: 2900 },
          { name: "Basic Doodad", sales: 2400 },
          { name: "Advanced Whatsit", sales: 1950 },
        ]

        // Generate sales by category
        const salesByCategory = [
          { name: "Electronics", value: 35 },
          { name: "Clothing", value: 25 },
          { name: "Home & Kitchen", value: 20 },
          { name: "Sports", value: 15 },
          { name: "Books", value: 5 },
        ]

        // Generate payment methods
        const paymentMethods = [
          { name: "Credit Card", value: 65 },
          { name: "PayPal", value: 20 },
          { name: "Bank Transfer", value: 10 },
          { name: "Cash on Delivery", value: 5 },
        ]

        setSalesData({
          dailySales,
          topProducts,
          salesByCategory,
          paymentMethods,
          performance: {
            totalSales,
            totalOrders,
            averageOrderValue: totalSales / totalOrders,
            comparisonToLastPeriod: 12.5, // Percentage increase/decrease
          },
        })

        // Generate customer data
        const newCustomers = Array.from({ length: days }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (days - 1) + i)
          return {
            date: date.toISOString().split("T")[0],
            count: Math.floor(Math.random() * 10) + 1,
          }
        })

        const topCustomers = [
          { name: "John Smith", purchases: 12, value: 1250 },
          { name: "Emily Johnson", purchases: 8, value: 950 },
          { name: "Michael Brown", purchases: 6, value: 870 },
          { name: "Sarah Davis", purchases: 5, value: 720 },
          { name: "David Wilson", purchases: 4, value: 680 },
        ]

        setCustomerData({
          newCustomers,
          customerRetention: { retained: 85, lost: 15 },
          topCustomers,
          purchaseFrequency: { "1-time": 60, "2-3 times": 30, "4+ times": 10 },
        })
      } catch (error) {
        console.error("Error loading report data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load report data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadReportData()
  }, [dateRange])

  // Handle export
  const handleExport = async (format: string) => {
    setIsExporting(true)
    setExportFormat(format)

    try {
      // Create export data based on the active tab
      let filename = `${activeTab}-report-${new Date().toISOString().split("T")[0]}`
      let content = ""
      let type = ""

      switch (format) {
        case "csv":
          filename += ".csv"

          // Create CSV content based on active tab
          if (activeTab === "sales") {
            const headers = ["Date", "Sales", "Orders", "Average Order Value"]
            content = [
              headers.join(","),
              ...salesData.dailySales.map((day) =>
                [day.date, day.sales.toFixed(2), day.orders, (day.sales / day.orders).toFixed(2)].join(","),
              ),
            ].join("\n")
          } else if (activeTab === "customers") {
            const headers = ["Date", "New Customers"]
            content = [
              headers.join(","),
              ...customerData.newCustomers.map((day) => [day.date, day.count].join(",")),
            ].join("\n")
          }

          type = "text/csv"
          break

        case "pdf":
          // For demo, we'll use a simple text representation
          filename += ".txt"
          content = `${activeTab.toUpperCase()} REPORT\n\n`
          content += `Date Range: ${dateRange.from?.toLocaleDateString() || ""} to ${dateRange.to?.toLocaleDateString() || ""}\n\n`

          if (activeTab === "sales") {
            content += `SALES PERFORMANCE\n`
            content += `Total Sales: $${salesData.performance.totalSales.toFixed(2)}\n`
            content += `Total Orders: ${salesData.performance.totalOrders}\n`
            content += `Average Order Value: $${salesData.performance.averageOrderValue.toFixed(2)}\n`
            content += `Comparison to Previous Period: ${salesData.performance.comparisonToLastPeriod > 0 ? "+" : ""}${salesData.performance.comparisonToLastPeriod.toFixed(2)}%\n\n`

            content += `TOP PRODUCTS\n`
            salesData.topProducts.forEach((product, index) => {
              content += `${index + 1}. ${product.name}: $${product.sales.toFixed(2)}\n`
            })
          } else if (activeTab === "customers") {
            content += `CUSTOMER RETENTION\n`
            content += `Retained Customers: ${customerData.customerRetention.retained}%\n`
            content += `Lost Customers: ${customerData.customerRetention.lost}%\n\n`

            content += `TOP CUSTOMERS\n`
            customerData.topCustomers.forEach((customer, index) => {
              content += `${index + 1}. ${customer.name}: ${customer.purchases} purchases, $${customer.value.toFixed(2)}\n`
            })
          }

          type = "text/plain"
          break

        case "excel":
          filename += ".json" // In reality would be .xlsx

          // For demo, use JSON as a stand-in for Excel
          let exportData
          if (activeTab === "sales") {
            exportData = {
              performance: salesData.performance,
              dailySales: salesData.dailySales,
              topProducts: salesData.topProducts,
              salesByCategory: salesData.salesByCategory,
              paymentMethods: salesData.paymentMethods,
            }
          } else if (activeTab === "customers") {
            exportData = {
              newCustomers: customerData.newCustomers,
              customerRetention: customerData.customerRetention,
              topCustomers: customerData.topCustomers,
              purchaseFrequency: customerData.purchaseFrequency,
            }
          }

          content = JSON.stringify(exportData, null, 2)
          type = "application/json"
          break
      }

      // Create download
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Exported",
        description: `${format.toUpperCase()} report has been generated successfully.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return "All Time"

    const fromStr = dateRange.from ? dateRange.from.toLocaleDateString() : "Any"
    const toStr = dateRange.to ? dateRange.to.toLocaleDateString() : "Any"

    return `${fromStr} to ${toStr}`
  }

  // COLORS for charts
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
  ]

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
            <p className="text-muted-foreground">Analyze your sales performance</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground">Analyze your sales performance</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handlePrint}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Exporting {exportFormat}...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="flex items-center">
                <FileTextIcon className="mr-2 h-4 w-4" />
                <span>PDF Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="flex items-center">
                <FileIcon className="mr-2 h-4 w-4" />
                <span>Excel Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")} className="flex items-center">
                <FileTextIcon className="mr-2 h-4 w-4" />
                <span>CSV Export</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {salesData.performance.totalSales.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center pt-1">
                    {salesData.performance.comparisonToLastPeriod > 0 ? (
                      <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={salesData.performance.comparisonToLastPeriod > 0 ? "text-green-500" : "text-red-500"}
                    >
                      {salesData.performance.comparisonToLastPeriod > 0 ? "+" : ""}
                      {salesData.performance.comparisonToLastPeriod.toFixed(1)}%
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">vs. last period</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.performance.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">During selected period</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {salesData.performance.averageOrderValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">Per order</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2%</div>
                  <div className="flex items-center pt-1">
                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-500">+0.5%</span>
                    <span className="ml-1 text-xs text-muted-foreground">vs. last period</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-2 lg:col-span-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily sales and orders for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="sales"
                          name="Sales ($)"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-2 lg:col-span-3"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={salesData.topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                        <Bar dataKey="sales" name="Sales ($)" fill="#8884d8">
                          {salesData.topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Distribution of sales across product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesData.salesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {salesData.salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesData.paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {salesData.paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-2 lg:col-span-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>New Customers</CardTitle>
                  <CardDescription>Acquisition rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData.newCustomers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="New Customers" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-2 lg:col-span-3"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
                  <CardDescription>Retained vs. lost customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Retained", value: customerData.customerRetention.retained },
                            { name: "Lost", value: customerData.customerRetention.lost },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#f87171" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Customers with highest purchase value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={customerData.topCustomers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => [`$${value}`, "Purchase Value"]} />
                        <Bar dataKey="value" name="Purchase Value ($)" fill="#8884d8">
                          {customerData.topCustomers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Frequency</CardTitle>
                  <CardDescription>How often customers make purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "1-time buyers", value: customerData.purchaseFrequency["1-time"] },
                            { name: "2-3 purchases", value: customerData.purchaseFrequency["2-3 times"] },
                            { name: "4+ purchases", value: customerData.purchaseFrequency["4+ times"] },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#8884d8" />
                          <Cell fill="#82ca9d" />
                          <Cell fill="#ffc658" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      <SyncManager />
    </div>
  )
}

