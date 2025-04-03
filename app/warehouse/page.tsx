"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SyncManager } from "@/components/sync-manager"
import {
  Package,
  Truck,
  AlertTriangle,
  Loader2,
  MapPin,
  Tag,
  ArrowUp,
  ArrowDown,
  BarChart,
  Activity,
  Info,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Boxes,
} from "lucide-react"
import { getProducts } from "@/lib/product-service"
import { getSuppliers } from "@/lib/supplier-service"
import { getStockItems } from "@/lib/stock-service"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Type definitions
interface StockItem {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  type: "in" | "out"
  date: string
  location: string
  reference: string
  notes: string
}

interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  price: number
  location: string
}

interface Supplier {
  id: string
  name: string
  status: string
}

interface StockMovementByDate {
  date: string
  in: number
  out: number
}

export default function WarehouseDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTimeRange, setActiveTimeRange] = useState<"week" | "month" | "quarter">("week")
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalSuppliers: 0,
    activeSuppliers: 0,
    stockValue: 0,
    recentActivity: [] as StockItem[],
    locationBreakdown: {} as Record<string, number>,
    categoryBreakdown: {} as Record<string, number>,
    topProducts: [] as (Product & { value: number })[],
    stockMovement: {
      in: 0,
      out: 0,
      byDate: [] as StockMovementByDate[],
    },
    turnoverRate: 0,
    stockUtilization: 0,
  })

  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load products
        const products = (await getProducts()) as Product[]

        // Ensure location property is properly set for display
        const processedProducts = products.map((product) => ({
          ...product,
          location: product.location || "Not assigned", // Ensure location is never undefined
        }))

        // Load suppliers
        const suppliers = (await getSuppliers()) as Supplier[]

        // Load stock items
        const stockItems = (await getStockItems()) as StockItem[]

        // Calculate stats
        const lowStockItems = processedProducts.filter((p) => p.quantity > 0 && p.quantity <= 5).length
        const outOfStockItems = processedProducts.filter((p) => p.quantity === 0).length
        const activeSuppliers = suppliers.filter((s) => s.status === "Active").length

        // Calculate total stock value
        const stockValue = processedProducts.reduce((total, product) => {
          return total + (product.price || 0) * product.quantity
        }, 0)

        // Calculate location breakdown
        const locationBreakdown: Record<string, number> = {}
        processedProducts.forEach((product) => {
          const location = product.location || "Not assigned"
          if (!locationBreakdown[location]) {
            locationBreakdown[location] = 0
          }
          locationBreakdown[location] += product.quantity
        })

        // Calculate category breakdown
        const categoryBreakdown: Record<string, number> = {}
        processedProducts.forEach((product) => {
          const category = product.category || "Uncategorized"
          if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = 0
          }
          categoryBreakdown[category] += product.quantity
        })

        // Get top products by value
        const topProducts = [...processedProducts]
          .sort((a, b) => (b.price || 0) * b.quantity - (a.price || 0) * a.quantity)
          .slice(0, 5)
          .map((p) => ({
            ...p,
            value: (p.price || 0) * p.quantity,
          }))

        // Get stock movement
        const stockIn = stockItems.filter((item) => item.type === "in").reduce((sum, item) => sum + item.quantity, 0)
        const stockOut = stockItems.filter((item) => item.type === "out").reduce((sum, item) => sum + item.quantity, 0)

        // Calculate stock movement by date (last 7 days)
        const today = new Date()
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        }).reverse()

        const stockMovementByDate = last7Days.map((date) => {
          const dayItems = stockItems.filter((item) => item.date.startsWith(date))
          const inQty = dayItems.filter((item) => item.type === "in").reduce((sum, item) => sum + item.quantity, 0)
          const outQty = dayItems.filter((item) => item.type === "out").reduce((sum, item) => sum + item.quantity, 0)

          return {
            date,
            in: inQty,
            out: outQty,
          }
        })

        // Calculate inventory turnover rate (simplified)
        const totalStockOut = stockItems
          .filter((item) => item.type === "out")
          .reduce((sum, item) => sum + item.quantity, 0)
        const averageInventory =
          processedProducts.reduce((sum, product) => sum + product.quantity, 0) / processedProducts.length
        const turnoverRate = averageInventory > 0 ? totalStockOut / averageInventory : 0

        // Calculate stock utilization (simplified)
        const totalCapacity = 1000 // This would ideally come from the database
        const totalStock = processedProducts.reduce((sum, product) => sum + product.quantity, 0)
        const stockUtilization = (totalStock / totalCapacity) * 100

        // Get recent activity from stock items with location information
        const recentActivity = stockItems
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          // Ensure location is preserved in activity records
          .map((item) => ({
            ...item,
            location: item.location || "Not assigned",
          }))

        setStats({
          totalProducts: processedProducts.length,
          lowStockItems,
          outOfStockItems,
          totalSuppliers: suppliers.length,
          activeSuppliers,
          stockValue,
          recentActivity,
          locationBreakdown,
          categoryBreakdown,
          topProducts,
          stockMovement: {
            in: stockIn,
            out: stockOut,
            byDate: stockMovementByDate,
          },
          turnoverRate,
          stockUtilization,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Function to format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Add this function after the formatDate function
  const refreshDashboard = async () => {
    await loadData()
  }

  // Add this useEffect to refresh data when component becomes visible
  useEffect(() => {
    // This will run when the component mounts or becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshDashboard()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up the event listener
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Find the maximum value for the stock movement chart
  const maxStockMovement = Math.max(...stats.stockMovement.byDate.map((day) => Math.max(day.in, day.out)))

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading warehouse data...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of warehouse operations and inventory</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <SyncManager />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1" onClick={refreshDashboard}>
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh Data</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh warehouse data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-transparent">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <div className="flex items-center mt-1">
                <Badge variant="destructive" className="mr-1">
                  {stats.outOfStockItems}
                </Badge>
                <p className="text-xs text-muted-foreground">out of stock</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-transparent">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-amber-500 border-amber-200 bg-amber-50">
                  {((stats.lowStockItems / stats.totalProducts) * 100).toFixed(1)}%
                </Badge>
                <p className="text-xs text-muted-foreground">of total inventory</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-transparent">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Truck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-green-500 border-green-200 bg-green-50">
                  {((stats.activeSuppliers / stats.totalSuppliers) * 100).toFixed(0)}%
                </Badge>
                <p className="text-xs text-muted-foreground">of {stats.totalSuppliers} total suppliers</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-transparent">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">${stats.stockValue.toFixed(2)}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-purple-500 border-purple-200 bg-purple-50">
                  ${(stats.stockValue / Math.max(stats.totalProducts, 1)).toFixed(2)}
                </Badge>
                <p className="text-xs text-muted-foreground">avg. value per product</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stock Movement Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stock Movement Trends</CardTitle>
                <CardDescription>Daily stock in/out activity over the past week</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      This chart shows the daily stock movement patterns. Green bars represent stock coming in, while
                      red bars show stock going out.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]" ref={chartRef}>
              <div className="flex h-full">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground">
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div key={percent}>{Math.round((maxStockMovement * percent) / 100)}</div>
                  ))}
                </div>

                {/* Chart bars */}
                <div className="flex-1 flex items-end justify-between">
                  {stats.stockMovement.byDate.map((day, index) => (
                    <div key={day.date} className="flex flex-col items-center w-full max-w-[50px]">
                      <div className="w-full h-[250px] flex flex-col justify-end items-center gap-1 relative">
                        {/* Stock In Bar */}
                        <motion.div
                          className="w-4 bg-green-500 rounded-t-sm z-10"
                          initial={{ height: 0 }}
                          animate={{
                            height: `${(day.in / maxStockMovement) * 100}%`,
                            transition: { delay: 0.1 * index, duration: 0.5 },
                          }}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="w-full h-full" />
                              <TooltipContent>
                                <p className="font-medium">Stock In: {day.in} units</p>
                                <p className="text-xs">{formatDate(day.date)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>

                        {/* Stock Out Bar */}
                        <motion.div
                          className="w-4 bg-red-500 rounded-t-sm absolute bottom-0 left-[calc(50%+6px)]"
                          initial={{ height: 0 }}
                          animate={{
                            height: `${(day.out / maxStockMovement) * 100}%`,
                            transition: { delay: 0.1 * index + 0.2, duration: 0.5 },
                          }}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="w-full h-full" />
                              <TooltipContent>
                                <p className="font-medium">Stock Out: {day.out} units</p>
                                <p className="text-xs">{formatDate(day.date)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{formatDate(day.date)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                <span className="text-sm">Stock In</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                <span className="text-sm">Stock Out</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics and Top Products */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Warehouse Performance</CardTitle>
                  <CardDescription>Key operational metrics and efficiency indicators</CardDescription>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Inventory Turnover */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Inventory Turnover Rate</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>How many times inventory is sold and replaced over a period</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rate</span>
                      <span className="font-medium">{stats.turnoverRate.toFixed(2)}x</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(stats.turnoverRate * 20, 100)}%`,
                          transition: { delay: 0.7, duration: 0.7 },
                        }}
                      ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Optimal</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                {/* Stock Utilization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">Warehouse Utilization</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of warehouse capacity currently in use</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Capacity Used</span>
                      <span className="font-medium">{stats.stockUtilization.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className={cn(
                          "h-full",
                          stats.stockUtilization < 50
                            ? "bg-green-500"
                            : stats.stockUtilization < 80
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(stats.stockUtilization, 100)}%`,
                          transition: { delay: 0.8, duration: 0.7 },
                        }}
                      ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Stock Movement Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Stock Movement Summary</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="flex flex-col items-center justify-center p-4 border rounded-md bg-green-50"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        transition: { delay: 0.9 },
                      }}
                    >
                      <ArrowDown className="h-6 w-6 text-green-500 mb-2" />
                      <div className="text-xl font-bold text-green-600">{stats.stockMovement.in}</div>
                      <p className="text-sm text-green-600">Stock In</p>
                    </motion.div>
                    <motion.div
                      className="flex flex-col items-center justify-center p-4 border rounded-md bg-red-50"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        transition: { delay: 1.0 },
                      }}
                    >
                      <ArrowUp className="h-6 w-6 text-red-500 mb-2" />
                      <div className="text-xl font-bold text-red-600">{stats.stockMovement.out}</div>
                      <p className="text-sm text-red-600">Stock Out</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Products by Value</CardTitle>
                  <CardDescription>Highest value inventory items in your warehouse</CardDescription>
                </div>
                <BarChart className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {stats.topProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="relative"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      transition: { delay: 0.8 + index * 0.1 },
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-6 h-6 flex items-center justify-center p-0",
                            index === 0
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : index === 1
                                ? "border-gray-300 bg-gray-50 text-gray-700"
                                : index === 2
                                  ? "border-orange-300 bg-orange-50 text-orange-700"
                                  : "border-blue-300 bg-blue-50 text-blue-700",
                          )}
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${product.value.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} units</p>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className={cn(
                          "h-full",
                          index === 0
                            ? "bg-amber-500"
                            : index === 1
                              ? "bg-gray-500"
                              : index === 2
                                ? "bg-orange-500"
                                : "bg-blue-500",
                        )}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(product.value / stats.topProducts[0].value) * 100}%`,
                          transition: { delay: 0.9 + index * 0.1, duration: 0.7 },
                        }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <span className="text-sm text-muted-foreground">Total value of top 5 products:</span>
              <span className="font-medium">${stats.topProducts.reduce((sum, p) => sum + p.value, 0).toFixed(2)}</span>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="inventory" className="mt-2">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Inventory Status</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Warehouse Locations</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Product Categories</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Recent Activity</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="inventory" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inventory Status</CardTitle>
                      <CardDescription>Overview of current inventory levels and status</CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This visualization shows the distribution of your inventory across different stock levels.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <motion.div
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="text-sm font-medium">
                          In Stock: {stats.totalProducts - stats.lowStockItems - stats.outOfStockItems}
                          <span className="ml-1 text-xs text-muted-foreground">
                            (
                            {(
                              ((stats.totalProducts - stats.lowStockItems - stats.outOfStockItems) /
                                stats.totalProducts) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <div className="text-sm font-medium">
                          Low Stock: {stats.lowStockItems}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({((stats.lowStockItems / stats.totalProducts) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="text-sm font-medium">
                          Out of Stock: {stats.outOfStockItems}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({((stats.outOfStockItems / stats.totalProducts) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-200">
                        {/* In stock */}
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-green-500 flex items-center justify-center"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${stats.totalProducts ? ((stats.totalProducts - stats.lowStockItems - stats.outOfStockItems) / stats.totalProducts) * 100 : 0}%`,
                            transition: { delay: 0.5, duration: 0.8 },
                          }}
                        >
                          {((stats.totalProducts - stats.lowStockItems - stats.outOfStockItems) / stats.totalProducts) *
                            100 >
                            15 && (
                            <span className="text-xs font-medium text-white">
                              {(
                                ((stats.totalProducts - stats.lowStockItems - stats.outOfStockItems) /
                                  stats.totalProducts) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          )}
                        </motion.div>
                        {/* Low stock */}
                        <motion.div
                          className="absolute inset-y-0 bg-amber-500 flex items-center justify-center"
                          initial={{ width: 0, left: 0 }}
                          animate={{
                            width: `${stats.totalProducts ? (stats.lowStockItems / stats.totalProducts) * 100 : 0}%`,
                            left: `${stats.totalProducts ? ((stats.totalProducts - stats.lowStockItems - stats.outOfStockItems) / stats.totalProducts) * 100 : 0}%`,
                            transition: { delay: 0.6, duration: 0.8 },
                          }}
                        >
                          {(stats.lowStockItems / stats.totalProducts) * 100 > 15 && (
                            <span className="text-xs font-medium text-white">
                              {((stats.lowStockItems / stats.totalProducts) * 100).toFixed(0)}%
                            </span>
                          )}
                        </motion.div>
                        {/* Out of stock */}
                        <motion.div
                          className="absolute inset-y-0 bg-red-500 flex items-center justify-center"
                          initial={{ width: 0, left: 0 }}
                          animate={{
                            width: `${stats.totalProducts ? (stats.outOfStockItems / stats.totalProducts) * 100 : 0}%`,
                            left: `${stats.totalProducts ? ((stats.totalProducts - stats.outOfStockItems) / stats.totalProducts) * 100 : 0}%`,
                            transition: { delay: 0.7, duration: 0.8 },
                          }}
                        >
                          {(stats.outOfStockItems / stats.totalProducts) * 100 > 15 && (
                            <span className="text-xs font-medium text-white">
                              {((stats.outOfStockItems / stats.totalProducts) * 100).toFixed(0)}%
                            </span>
                          )}
                        </motion.div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-700 mb-1">Inventory Health Analysis</h4>
                          <p className="text-sm text-blue-600">
                            {stats.outOfStockItems > stats.lowStockItems
                              ? "Your warehouse has a significant number of out-of-stock items. Consider reviewing your reordering process."
                              : stats.lowStockItems > stats.totalProducts * 0.2
                                ? "A large portion of your inventory is running low. Plan for restocking soon to avoid stockouts."
                                : "Your inventory levels are generally healthy. Continue monitoring low stock items for timely reordering."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Stock by Location</CardTitle>
                      <CardDescription>Distribution of inventory across warehouse locations</CardDescription>
                    </div>
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(stats.locationBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([location, quantity], index) => (
                        <motion.div
                          key={location}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 },
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{quantity} units</span>
                              <Badge variant="outline" className="ml-2">
                                {(
                                  (quantity / Object.values(stats.locationBreakdown).reduce((sum, q) => sum + q, 0)) *
                                  100
                                ).toFixed(1)}
                                %
                              </Badge>
                            </div>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(quantity / Object.values(stats.locationBreakdown).reduce((sum, q) => sum + q, 0)) * 100}%`,
                                transition: { delay: 0.1 * index + 0.2, duration: 0.5 },
                              }}
                            ></motion.div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Stock by Category</CardTitle>
                      <CardDescription>Distribution of inventory across product categories</CardDescription>
                    </div>
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(stats.categoryBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, quantity], index) => (
                        <motion.div
                          key={category}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 },
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{quantity} units</span>
                              <Badge variant="outline" className="ml-2">
                                {(
                                  (quantity / Object.values(stats.categoryBreakdown).reduce((sum, q) => sum + q, 0)) *
                                  100
                                ).toFixed(1)}
                                %
                              </Badge>
                            </div>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(quantity / Object.values(stats.categoryBreakdown).reduce((sum, q) => sum + q, 0)) * 100}%`,
                                transition: { delay: 0.1 * index + 0.2, duration: 0.5 },
                              }}
                            ></motion.div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest warehouse operations and inventory changes</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentActivity.map((activity, index) => (
                          <motion.tr
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              transition: { delay: 0.1 * index, duration: 0.3 },
                            }}
                            className="[&>td]:py-3 [&>td]:px-4"
                          >
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">
                                  {new Date(activity.date).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.date).toLocaleTimeString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">{activity.productName}</span>
                                <span className="text-xs text-muted-foreground">{activity.productSku}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={activity.type === "in" ? "outline" : "destructive"}
                                className={activity.type === "in" ? "bg-green-50 text-green-700 border-green-200" : ""}
                              >
                                {activity.type === "in" ? "Stock In" : "Stock Out"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{activity.quantity}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{activity.location || "Not assigned"}</span>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Activity className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                        <p className="text-muted-foreground">No recent activity to display</p>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}

