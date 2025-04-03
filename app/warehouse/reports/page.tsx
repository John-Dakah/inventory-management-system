"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SyncManager } from "@/components/sync-manager"
import {
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  FileSpreadsheet,
  Filter,
  Boxes,
  Package,
  Truck,
  AlertTriangle,
  Activity,
  DollarSign,
  ShoppingCart,
} from "lucide-react"
import { getProducts } from "@/lib/product-service"
import { getSuppliers } from "@/lib/supplier-service"
import { getStockTransactions, getStockItems } from "@/lib/stock-service"
import { format, subDays, subMonths, subQuarters, differenceInDays, isSameDay, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Pie, Doughnut } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
)

// Type definitions
interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  price: number
  location: string
  lastUpdated?: string
}

interface StockTransaction {
  id: string
  stockItemId: string
  productName: string
  productSku: string
  type: "RECEIVE" | "ISSUE" | "ADJUSTMENT_ADD" | "ADJUSTMENT_REMOVE" | "in" | "out"
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string
  location?: string
  createdAt: string
  date: string
}

interface Supplier {
  id: string
  name: string
  status: string
}

interface ChartDataset {
  labels: string[]
  datasets: {
    label?: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    tension?: number
    fill?: boolean
    pointBackgroundColor?: string
    pointBorderColor?: string
    pointRadius?: number
    pointHoverRadius?: number
    hoverBackgroundColor?: string | string[]
    hoverBorderColor?: string | string[]
    hoverBorderWidth?: number
  }[]
}

interface StockTrend {
  period: string
  change: number
  percentage: number
  direction: "up" | "down" | "neutral"
}

export default function WarehouseReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timePeriod, setTimePeriod] = useState("month")
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [stockData, setStockData] = useState<{
    products: Product[]
    transactions: StockTransaction[]
    suppliers: Supplier[]
    topMovingProducts: { id: string; name: string; sku: string; movement: number }[]
    stockTrends: {
      daily: StockTrend
      weekly: StockTrend
      monthly: StockTrend
    }
    valueByCategory: { category: string; value: number }[]
    valueByLocation: { location: string; value: number }[]
    stockHealth: {
      healthScore: number
      outOfStockPercentage: number
      lowStockPercentage: number
      excessStockPercentage: number
    }
  }>({
    products: [],
    transactions: [],
    suppliers: [],
    topMovingProducts: [],
    stockTrends: {
      daily: { period: "Today", change: 0, percentage: 0, direction: "neutral" },
      weekly: { period: "This Week", change: 0, percentage: 0, direction: "neutral" },
      monthly: { period: "This Month", change: 0, percentage: 0, direction: "neutral" },
    },
    valueByCategory: [],
    valueByLocation: [],
    stockHealth: {
      healthScore: 0,
      outOfStockPercentage: 0,
      lowStockPercentage: 0,
      excessStockPercentage: 0,
    },
  })

  const [chartData, setChartData] = useState<{
    stockLevels: ChartDataset | null
    stockMovement: ChartDataset | null
    categoryDistribution: ChartDataset | null
    stockValue: ChartDataset | null
    stockTrends: ChartDataset | null
    stockByLocation: ChartDataset | null
    stockHealthRadar: ChartDataset | null
  }>({
    stockLevels: null,
    stockMovement: null,
    categoryDistribution: null,
    stockValue: null,
    stockTrends: null,
    stockByLocation: null,
    stockHealthRadar: null,
  })

  // Set time period based on selection
  useEffect(() => {
    if (timePeriod === "week") {
      setStartDate(subDays(new Date(), 7))
      setEndDate(new Date())
    } else if (timePeriod === "month") {
      setStartDate(subMonths(new Date(), 1))
      setEndDate(new Date())
    } else if (timePeriod === "quarter") {
      setStartDate(subQuarters(new Date(), 1))
      setEndDate(new Date())
    }
    // For custom, we keep the user-selected dates
  }, [timePeriod])

  // Load data when dates change
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load products
        const products = (await getProducts()) as Product[]

        // Load suppliers
        const suppliers = (await getSuppliers()) as Supplier[]

        // Load stock transactions
        const transactions = (await getStockTransactions({
          startDate,
          endDate,
        })) as StockTransaction[]

        // Get additional stock items for historical comparison
        const allStockItems = (await getStockItems()) as StockTransaction[]

        // Calculate top moving products
        const productMovements = products
          .map((product) => {
            const movement = transactions
              .filter((t) => t.stockItemId === product.id)
              .reduce((sum, t) => {
                // Count both ins and outs as movement
                return sum + t.quantity
              }, 0)

            return {
              id: product.id,
              name: product.name,
              sku: product.sku,
              movement,
            }
          })
          .sort((a, b) => b.movement - a.movement)
          .slice(0, 5)

        // Calculate stock trends
        const stockTrends = calculateStockTrends(allStockItems)

        // Calculate value by category
        const valueByCategory = calculateValueByCategory(products)

        // Calculate value by location
        const valueByLocation = calculateValueByLocation(products)

        // Calculate stock health
        const stockHealth = calculateStockHealth(products)

        setStockData({
          products,
          transactions,
          suppliers,
          topMovingProducts: productMovements,
          stockTrends,
          valueByCategory,
          valueByLocation,
          stockHealth,
        })

        // Prepare chart data
        prepareChartData(products, transactions, stockTrends, valueByCategory, valueByLocation)
      } catch (error) {
        console.error("Error loading report data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [startDate, endDate])

  const calculateStockTrends = (
    stockItems: StockTransaction[],
  ): {
    daily: StockTrend
    weekly: StockTrend
    monthly: StockTrend
  } => {
    const today = new Date()
    const yesterday = subDays(today, 1)
    const lastWeek = subDays(today, 7)
    const lastMonth = subMonths(today, 1)

    // Daily trend
    const todayItems = stockItems.filter((item) => {
      const itemDate = parseISO(item.date)
      return isSameDay(itemDate, today)
    })

    const yesterdayItems = stockItems.filter((item) => {
      const itemDate = parseISO(item.date)
      return isSameDay(itemDate, yesterday)
    })

    const todayNet = todayItems.reduce((net, item) => {
      return (
        net +
        (item.type === "in" || item.type === "RECEIVE" || item.type === "ADJUSTMENT_ADD"
          ? item.quantity
          : -item.quantity)
      )
    }, 0)

    const yesterdayNet = yesterdayItems.reduce((net, item) => {
      return (
        net +
        (item.type === "in" || item.type === "RECEIVE" || item.type === "ADJUSTMENT_ADD"
          ? item.quantity
          : -item.quantity)
      )
    }, 0)

    const dailyChange = todayNet - yesterdayNet
    const dailyPercentage = yesterdayNet !== 0 ? (dailyChange / Math.abs(yesterdayNet)) * 100 : todayNet > 0 ? 100 : 0

    // Weekly trend
    const thisWeekItems = stockItems.filter((item) => {
      const itemDate = parseISO(item.date)
      return differenceInDays(today, itemDate) <= 7
    })

    const lastWeekItems = stockItems.filter((item) => {
      const itemDate = parseISO(item.date)
      const days = differenceInDays(today, itemDate)
      return days > 7 && days <= 14
    })

    const thisWeekNet = thisWeekItems.reduce((net, item) => {
      return (
        net +
        (item.type === "in" || item.type === "RECEIVE" || item.type === "ADJUSTMENT_ADD"
          ? item.quantity
          : -item.quantity)
      )
    }, 0)

    const lastWeekNet = lastWeekItems.reduce((net, item) => {
      return (
        net +
        (item.type === "in" || item.type === "RECEIVE" || item.type === "ADJUSTMENT_ADD"
          ? item.quantity
          : -item.quantity)
      )
    }, 0)

    const weeklyChange = thisWeekNet - lastWeekNet
    const weeklyPercentage =
      lastWeekNet !== 0 ? (weeklyChange / Math.abs(lastWeekNet)) * 100 : thisWeekNet > 0 ? 100 : 0

    // Monthly trend
    const thisMonthItems = stockItems.filter((item) => {
      const itemDate = parseISO(item.date)
      return differenceInDays(today, itemDate) <= 30
    })

    const lastMonthItems = stockItems.filter((item) => {
      const itemDate = parseISO(item.date)
      const days = differenceInDays(today, itemDate)
      return days > 30 && days <= 60
    })

    const thisMonthNet = thisMonthItems.reduce((net, item) => {
      return (
        net +
        (item.type === "in" || item.type === "RECEIVE" || item.type === "ADJUSTMENT_ADD"
          ? item.quantity
          : -item.quantity)
      )
    }, 0)

    const lastMonthNet = lastMonthItems.reduce((net, item) => {
      return (
        net +
        (item.type === "in" || item.type === "RECEIVE" || item.type === "ADJUSTMENT_ADD"
          ? item.quantity
          : -item.quantity)
      )
    }, 0)

    const monthlyChange = thisMonthNet - lastMonthNet
    const monthlyPercentage =
      lastMonthNet !== 0 ? (monthlyChange / Math.abs(lastMonthNet)) * 100 : thisMonthNet > 0 ? 100 : 0

    return {
      daily: {
        period: "Today",
        change: dailyChange,
        percentage: Math.abs(dailyPercentage),
        direction: dailyChange > 0 ? "up" : dailyChange < 0 ? "down" : "neutral",
      },
      weekly: {
        period: "This Week",
        change: weeklyChange,
        percentage: Math.abs(weeklyPercentage),
        direction: weeklyChange > 0 ? "up" : weeklyChange < 0 ? "down" : "neutral",
      },
      monthly: {
        period: "This Month",
        change: monthlyChange,
        percentage: Math.abs(monthlyPercentage),
        direction: monthlyChange > 0 ? "up" : monthlyChange < 0 ? "down" : "neutral",
      },
    }
  }

  const calculateValueByCategory = (products: Product[]) => {
    const categoryValues: Record<string, number> = {}

    products.forEach((product) => {
      const category = product.category || "Uncategorized"
      const value = (product.price || 0) * product.quantity

      if (!categoryValues[category]) {
        categoryValues[category] = 0
      }

      categoryValues[category] += value
    })

    return Object.entries(categoryValues)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
  }

  const calculateValueByLocation = (products: Product[]) => {
    const locationValues: Record<string, number> = {}

    products.forEach((product) => {
      const location = product.location || "Unassigned"
      const value = (product.price || 0) * product.quantity

      if (!locationValues[location]) {
        locationValues[location] = 0
      }

      locationValues[location] += value
    })

    return Object.entries(locationValues)
      .map(([location, value]) => ({ location, value }))
      .sort((a, b) => b.value - a.value)
  }

  const calculateStockHealth = (products: Product[]) => {
    const totalProducts = products.length
    const outOfStock = products.filter((p) => p.quantity === 0).length
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 5).length
    const excessStock = products.filter((p) => p.quantity > 50).length // Arbitrary threshold

    // Calculate health score (0-100)
    // Lower scores for more out-of-stock and low-stock items
    const outOfStockImpact = (outOfStock / totalProducts) * 50
    const lowStockImpact = (lowStock / totalProducts) * 30
    const excessStockImpact = (excessStock / totalProducts) * 20

    const healthScore = Math.max(0, 100 - outOfStockImpact - lowStockImpact - excessStockImpact)

    return {
      healthScore,
      outOfStockPercentage: (outOfStock / totalProducts) * 100,
      lowStockPercentage: (lowStock / totalProducts) * 100,
      excessStockPercentage: (excessStock / totalProducts) * 100,
    }
  }

  const prepareChartData = (
    products: Product[],
    transactions: StockTransaction[],
    stockTrends: {
      daily: StockTrend
      weekly: StockTrend
      monthly: StockTrend
    },
    valueByCategory: { category: string; value: number }[],
    valueByLocation: { location: string; value: number }[],
  ) => {
    // Prepare stock levels chart data
    const stockLevelsData = {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      datasets: [
        {
          data: [
            products.filter((p) => p.quantity > 5).length,
            products.filter((p) => p.quantity > 0 && p.quantity <= 5).length,
            products.filter((p) => p.quantity === 0).length,
          ],
          backgroundColor: ["rgba(34, 197, 94, 0.7)", "rgba(234, 179, 8, 0.7)", "rgba(239, 68, 68, 0.7)"],
          borderColor: ["rgba(34, 197, 94, 1)", "rgba(234, 179, 8, 1)", "rgba(239, 68, 68, 1)"],
          borderWidth: 1,
          hoverBackgroundColor: ["rgba(34, 197, 94, 0.9)", "rgba(234, 179, 8, 0.9)", "rgba(239, 68, 68, 0.9)"],
          hoverBorderColor: ["rgba(34, 197, 94, 1)", "rgba(234, 179, 8, 1)", "rgba(239, 68, 68, 1)"],
          hoverBorderWidth: 2,
        },
      ],
    }

    // Prepare stock movement chart data
    // Group transactions by date
    const transactionsByDate: Record<string, { additions: number; removals: number }> = {}

    transactions.forEach((transaction) => {
      const date = transaction.date
        ? transaction.date.split("T")[0]
        : format(new Date(transaction.createdAt), "yyyy-MM-dd")

      if (!transactionsByDate[date]) {
        transactionsByDate[date] = {
          additions: 0,
          removals: 0,
        }
      }

      if (transaction.type === "RECEIVE" || transaction.type === "ADJUSTMENT_ADD" || transaction.type === "in") {
        transactionsByDate[date].additions += transaction.quantity
      } else {
        transactionsByDate[date].removals += transaction.quantity
      }
    })

    const dates = Object.keys(transactionsByDate).sort()

    const stockMovementData = {
      labels: dates.map((date) => format(new Date(date), "MMM dd")),
      datasets: [
        {
          label: "Stock Added",
          data: dates.map((date) => transactionsByDate[date].additions),
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(34, 197, 94, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Stock Removed",
          data: dates.map((date) => transactionsByDate[date].removals),
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(239, 68, 68, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }

    // Prepare category distribution chart data
    const categoryDistributionData = {
      labels: valueByCategory.map((item) => item.category),
      datasets: [
        {
          data: valueByCategory.map((item) => item.value),
          backgroundColor: [
            "rgba(99, 102, 241, 0.7)",
            "rgba(168, 85, 247, 0.7)",
            "rgba(236, 72, 153, 0.7)",
            "rgba(239, 68, 68, 0.7)",
            "rgba(249, 115, 22, 0.7)",
            "rgba(234, 179, 8, 0.7)",
            "rgba(34, 197, 94, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(6, 182, 212, 0.7)",
            "rgba(59, 130, 246, 0.7)",
          ],
          borderWidth: 1,
          hoverBackgroundColor: [
            "rgba(99, 102, 241, 0.9)",
            "rgba(168, 85, 247, 0.9)",
            "rgba(236, 72, 153, 0.9)",
            "rgba(239, 68, 68, 0.9)",
            "rgba(249, 115, 22, 0.9)",
            "rgba(234, 179, 8, 0.9)",
            "rgba(34, 197, 94, 0.9)",
            "rgba(16, 185, 129, 0.9)",
            "rgba(6, 182, 212, 0.9)",
            "rgba(59, 130, 246, 0.9)",
          ],
        },
      ],
    }

    // Prepare stock value chart data
    const stockValueData = {
      labels: valueByCategory.map((item) => item.category),
      datasets: [
        {
          label: "Stock Value ($)",
          data: valueByCategory.map((item) => item.value),
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1,
        },
      ],
    }

    // Prepare stock trends chart data
    const stockTrendsData = {
      labels: ["Daily", "Weekly", "Monthly"],
      datasets: [
        {
          label: "Net Stock Change",
          data: [stockTrends.daily.change, stockTrends.weekly.change, stockTrends.monthly.change],
          backgroundColor: [
            stockTrends.daily.direction === "up"
              ? "rgba(34, 197, 94, 0.7)"
              : stockTrends.daily.direction === "down"
                ? "rgba(239, 68, 68, 0.7)"
                : "rgba(156, 163, 175, 0.7)",
            stockTrends.weekly.direction === "up"
              ? "rgba(34, 197, 94, 0.7)"
              : stockTrends.weekly.direction === "down"
                ? "rgba(239, 68, 68, 0.7)"
                : "rgba(156, 163, 175, 0.7)",
            stockTrends.monthly.direction === "up"
              ? "rgba(34, 197, 94, 0.7)"
              : stockTrends.monthly.direction === "down"
                ? "rgba(239, 68, 68, 0.7)"
                : "rgba(156, 163, 175, 0.7)",
          ],
          borderColor: [
            stockTrends.daily.direction === "up"
              ? "rgba(34, 197, 94, 1)"
              : stockTrends.daily.direction === "down"
                ? "rgba(239, 68, 68, 1)"
                : "rgba(156, 163, 175, 1)",
            stockTrends.weekly.direction === "up"
              ? "rgba(34, 197, 94, 1)"
              : stockTrends.weekly.direction === "down"
                ? "rgba(239, 68, 68, 1)"
                : "rgba(156, 163, 175, 1)",
            stockTrends.monthly.direction === "up"
              ? "rgba(34, 197, 94, 1)"
              : stockTrends.monthly.direction === "down"
                ? "rgba(239, 68, 68, 1)"
                : "rgba(156, 163, 175, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }

    // Prepare stock by location chart data
    const stockByLocationData = {
      labels: valueByLocation.map((item) => item.location),
      datasets: [
        {
          label: "Stock Value ($)",
          data: valueByLocation.map((item) => item.value),
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(249, 115, 22, 0.7)",
            "rgba(168, 85, 247, 0.7)",
            "rgba(236, 72, 153, 0.7)",
            "rgba(234, 179, 8, 0.7)",
            "rgba(99, 102, 241, 0.7)",
            "rgba(6, 182, 212, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    }

    setChartData({
      stockLevels: stockLevelsData,
      stockMovement: stockMovementData,
      categoryDistribution: categoryDistributionData,
      stockValue: stockValueData,
      stockTrends: stockTrendsData,
      stockByLocation: stockByLocationData,
      stockHealthRadar: null, // Not implemented in this version
    })
  }

  const handleExportReport = async () => {
    setIsExporting(true)

    try {
      // Create CSV content
      const headers = [
        "Date",
        "Product",
        "SKU",
        "Type",
        "Quantity",
        "Previous Quantity",
        "New Quantity",
        "Location",
        "Reason",
      ]

      const rows = stockData.transactions.map((t) => [
        format(new Date(t.createdAt || t.date), "yyyy-MM-dd"),
        t.productName || "",
        t.productSku || "",
        t.type,
        t.quantity,
        t.previousQuantity,
        t.newQuantity,
        t.location || "",
        t.reason || "",
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `warehouse-report-${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Show success message
      // toast.success("Report exported successfully")
    } catch (error) {
      console.error("Error exporting report:", error)
      // toast.error("Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true)

    try {
      // Re-fetch data with current date settings
      const products = (await getProducts()) as Product[]
      const suppliers = (await getSuppliers()) as Supplier[]
      const transactions = (await getStockTransactions({
        startDate,
        endDate,
      })) as StockTransaction[]
      const allStockItems = (await getStockItems()) as StockTransaction[]

      // Recalculate all derived data
      const productMovements = products
        .map((product) => {
          const movement = transactions
            .filter((t) => t.stockItemId === product.id)
            .reduce((sum, t) => sum + t.quantity, 0)

          return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            movement,
          }
        })
        .sort((a, b) => b.movement - a.movement)
        .slice(0, 5)

      const stockTrends = calculateStockTrends(allStockItems)
      const valueByCategory = calculateValueByCategory(products)
      const valueByLocation = calculateValueByLocation(products)
      const stockHealth = calculateStockHealth(products)

      setStockData({
        products,
        transactions,
        suppliers,
        topMovingProducts: productMovements,
        stockTrends,
        valueByCategory,
        valueByLocation,
        stockHealth,
      })

      prepareChartData(products, transactions, stockTrends, valueByCategory, valueByLocation)

      // toast.success("Data refreshed successfully")
    } catch (error) {
      console.error("Error refreshing data:", error)
      // toast.error("Failed to refresh data")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading warehouse reports...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Reports</h1>
          <p className="text-muted-foreground">Analyze inventory trends and stock movements</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isRefreshing}>
                  {isRefreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Data
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh report data from database</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleExportReport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Report
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data as CSV file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </div>

      <SyncManager />

      <motion.div
        className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-lg border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Time Period
          </label>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {timePeriod === "custom" && (
          <>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
          </>
        )}

        <div className="flex-1 flex items-end">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 w-full">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Filter className="h-4 w-4 text-blue-500" />
              <span>
                Showing data from <span className="font-medium">{format(startDate || new Date(), "MMM dd, yyyy")}</span>{" "}
                to <span className="font-medium">{format(endDate || new Date(), "MMM dd, yyyy")}</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-transparent">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stockData.products.length}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-blue-500 border-blue-200 bg-blue-50">
                  {stockData.products.reduce((sum, p) => sum + p.quantity, 0)} units
                </Badge>
                <p className="text-xs text-muted-foreground">in inventory</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-transparent">
              <CardTitle className="text-sm font-medium">Stock Transactions</CardTitle>
              <Activity className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stockData.transactions.length}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-amber-500 border-amber-200 bg-amber-50">
                  {
                    stockData.transactions.filter(
                      (t) => t.type === "in" || t.type === "RECEIVE" || t.type === "ADJUSTMENT_ADD",
                    ).length
                  }{" "}
                  in
                </Badge>
                <Badge variant="outline" className="mr-1 text-red-500 border-red-200 bg-red-50">
                  {
                    stockData.transactions.filter(
                      (t) => t.type === "out" || t.type === "ISSUE" || t.type === "ADJUSTMENT_REMOVE",
                    ).length
                  }{" "}
                  out
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-transparent">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Truck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {stockData.suppliers.filter((s) => s.status === "Active").length}
              </div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-green-500 border-green-200 bg-green-50">
                  {(
                    (stockData.suppliers.filter((s) => s.status === "Active").length /
                      Math.max(stockData.suppliers.length, 1)) *
                    100
                  ).toFixed(0)}
                  %
                </Badge>
                <p className="text-xs text-muted-foreground">of total suppliers</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-transparent">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                ${stockData.products.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0).toFixed(2)}
              </div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-1 text-purple-500 border-purple-200 bg-purple-50">
                  $
                  {(
                    stockData.products.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0) /
                    Math.max(stockData.products.length, 1)
                  ).toFixed(2)}
                </Badge>
                <p className="text-xs text-muted-foreground">avg. per product</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stock Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card
          className={cn(
            "overflow-hidden",
            stockData.stockTrends.daily.direction === "up"
              ? "border-green-200"
              : stockData.stockTrends.daily.direction === "down"
                ? "border-red-200"
                : "",
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              stockData.stockTrends.daily.direction === "up"
                ? "bg-green-50"
                : stockData.stockTrends.daily.direction === "down"
                  ? "bg-red-50"
                  : "bg-gray-50",
            )}
          >
            <CardTitle className="text-sm font-medium">Daily Stock Trend</CardTitle>
            {stockData.stockTrends.daily.direction === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : stockData.stockTrends.daily.direction === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Activity className="h-4 w-4 text-gray-500" />
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {stockData.stockTrends.daily.change > 0 ? "+" : ""}
                {stockData.stockTrends.daily.change}
              </div>
              <div className="ml-2">
                {stockData.stockTrends.daily.direction === "up" ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stockData.stockTrends.daily.percentage.toFixed(1)}%
                  </Badge>
                ) : stockData.stockTrends.daily.direction === "down" ? (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stockData.stockTrends.daily.percentage.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">0%</Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Compared to yesterday</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "overflow-hidden",
            stockData.stockTrends.weekly.direction === "up"
              ? "border-green-200"
              : stockData.stockTrends.weekly.direction === "down"
                ? "border-red-200"
                : "",
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              stockData.stockTrends.weekly.direction === "up"
                ? "bg-green-50"
                : stockData.stockTrends.weekly.direction === "down"
                  ? "bg-red-50"
                  : "bg-gray-50",
            )}
          >
            <CardTitle className="text-sm font-medium">Weekly Stock Trend</CardTitle>
            {stockData.stockTrends.weekly.direction === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : stockData.stockTrends.weekly.direction === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Activity className="h-4 w-4 text-gray-500" />
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {stockData.stockTrends.weekly.change > 0 ? "+" : ""}
                {stockData.stockTrends.weekly.change}
              </div>
              <div className="ml-2">
                {stockData.stockTrends.weekly.direction === "up" ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stockData.stockTrends.weekly.percentage.toFixed(1)}%
                  </Badge>
                ) : stockData.stockTrends.weekly.direction === "down" ? (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stockData.stockTrends.weekly.percentage.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">0%</Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Compared to last week</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "overflow-hidden",
            stockData.stockTrends.monthly.direction === "up"
              ? "border-green-200"
              : stockData.stockTrends.monthly.direction === "down"
                ? "border-red-200"
                : "",
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              stockData.stockTrends.monthly.direction === "up"
                ? "bg-green-50"
                : stockData.stockTrends.monthly.direction === "down"
                  ? "bg-red-50"
                  : "bg-gray-50",
            )}
          >
            <CardTitle className="text-sm font-medium">Monthly Stock Trend</CardTitle>
            {stockData.stockTrends.monthly.direction === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : stockData.stockTrends.monthly.direction === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Activity className="h-4 w-4 text-gray-500" />
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {stockData.stockTrends.monthly.change > 0 ? "+" : ""}
                {stockData.stockTrends.monthly.change}
              </div>
              <div className="ml-2">
                {stockData.stockTrends.monthly.direction === "up" ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stockData.stockTrends.monthly.percentage.toFixed(1)}%
                  </Badge>
                ) : stockData.stockTrends.monthly.direction === "down" ? (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stockData.stockTrends.monthly.percentage.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">0%</Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Compared to last month</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="movement" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Stock Movement</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            <span>Locations</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Current Stock Levels</CardTitle>
                      <CardDescription>Distribution of products by stock status</CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Shows the distribution of your inventory across different stock levels</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {chartData.stockLevels ? (
                    <Doughnut
                      data={chartData.stockLevels}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                        animation: {
                          animateScale: true,
                          animateRotate: true,
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span>In Stock</span>
                      </div>
                      <span className="font-medium">
                        {stockData.products.filter((p) => p.quantity > 5).length} products
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <span>Low Stock</span>
                      </div>
                      <span className="font-medium">
                        {stockData.products.filter((p) => p.quantity > 0 && p.quantity <= 5).length} products
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span>Out of Stock</span>
                      </div>
                      <span className="font-medium">
                        {stockData.products.filter((p) => p.quantity === 0).length} products
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Stock Health Analysis</CardTitle>
                      <CardDescription>Overall inventory health assessment</CardDescription>
                    </div>
                    <AlertTriangle
                      className={cn(
                        "h-5 w-5",
                        stockData.stockHealth.healthScore > 70
                          ? "text-green-500"
                          : stockData.stockHealth.healthScore > 40
                            ? "text-amber-500"
                            : "text-red-500",
                      )}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Health Score</span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            stockData.stockHealth.healthScore > 70
                              ? "text-green-600"
                              : stockData.stockHealth.healthScore > 40
                                ? "text-amber-600"
                                : "text-red-600",
                          )}
                        >
                          {stockData.stockHealth.healthScore.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={stockData.stockHealth.healthScore}
                        className="h-2"
                        indicatorClassName={cn(
                          stockData.stockHealth.healthScore > 70
                            ? "bg-green-500"
                            : stockData.stockHealth.healthScore > 40
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Out of Stock Items</span>
                          <span className="font-medium">{stockData.stockHealth.outOfStockPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={stockData.stockHealth.outOfStockPercentage}
                          className="h-1.5"
                          indicatorClassName="bg-red-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Low Stock Items</span>
                          <span className="font-medium">{stockData.stockHealth.lowStockPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={stockData.stockHealth.lowStockPercentage}
                          className="h-1.5"
                          indicatorClassName="bg-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Excess Stock Items</span>
                          <span className="font-medium">{stockData.stockHealth.excessStockPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={stockData.stockHealth.excessStockPercentage}
                          className="h-1.5"
                          indicatorClassName="bg-blue-500"
                        />
                      </div>
                    </div>

                    <div
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        stockData.stockHealth.healthScore > 70
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : stockData.stockHealth.healthScore > 40
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5" />
                        <div>
                          {stockData.stockHealth.healthScore > 70
                            ? "Your inventory is in good health. Continue monitoring low stock items for timely reordering."
                            : stockData.stockHealth.healthScore > 40
                              ? "Your inventory requires attention. Consider restocking low stock items and addressing out-of-stock products."
                              : "Your inventory health is critical. Immediate action is needed to restock out-of-stock items and review your inventory management process."}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Moving Products</CardTitle>
                      <CardDescription>Products with highest transaction volume</CardDescription>
                    </div>
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockData.topMovingProducts.length > 0 ? (
                      stockData.topMovingProducts.map(
                        (product, index) =>
                          (
                            <motion.div 
                          key={product.id} 
                          className="relative"
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ 
                            x: 0, 
                            opacity: 1,
                            transition: { delay: 0.1 * index }
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "w-6 h-6 flex items-center justify-center p-0",
                                  index === 0 ? "border-amber-300 bg-amber-50 text-amber-700" :
                                  index === 1 ? "border-gray-300 bg-gray-50 text-gray-700" :
                                  index === 2 ? "border-orange-300 bg-orange-50 text-orange-700" :
                                  "border-blue-300 bg-blue-50 text-blue-700"
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
                              <p className="text-sm font-medium">{product.movement} units</p>
                              <p className="text-xs text-muted-foreground">movement</p>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <motion.div 
                              className={cn(
                                "h-full",
                                index === 0 ? "bg-amber-500" :
                                index === 1 ? "bg-gray-500" :
                                index === 2 ? "bg-orange-500" :
                                "bg-blue-500"
                              )}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(product.movement / stockData.topMovingProducts[0].movement) * 100}%`,
                                transition: { delay: 0.2 + (index * 0.1), duration: 0.7 }
                              }}
                            ></motion.div>
                          </div>
                        </motion.div>
                          ),
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                          <p className="text-muted-foreground">No transaction data available</p>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Latest stock movements and adjustments</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  {stockData.transactions.length > 0 ? (
                    <div className="max-h-[300px] overflow-auto pr-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Qty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockData.transactions
                            .sort(
                              (a, b) =>
                                new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime(),
                            )
                            .slice(0, 5)
                            .map((transaction, index) => (
                              <motion.tr
                                key={transaction.id}
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
                                      {format(new Date(transaction.date || transaction.createdAt), "MMM dd")}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(transaction.date || transaction.createdAt), "yyyy")}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">{transaction.productName}</span>
                                    <span className="text-xs text-muted-foreground">{transaction.productSku}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      transaction.type === "in" ||
                                      transaction.type === "RECEIVE" ||
                                      transaction.type === "ADJUSTMENT_ADD"
                                        ? "outline"
                                        : "destructive"
                                    }
                                    className={
                                      transaction.type === "in" ||
                                      transaction.type === "RECEIVE" ||
                                      transaction.type === "ADJUSTMENT_ADD"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : ""
                                    }
                                  >
                                    {transaction.type === "in" || transaction.type === "RECEIVE"
                                      ? "Stock In"
                                      : transaction.type === "ADJUSTMENT_ADD"
                                        ? "Adjust (+)"
                                        : transaction.type === "ADJUSTMENT_REMOVE"
                                          ? "Adjust (-)"
                                          : "Stock Out"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{transaction.quantity}</span>
                                </TableCell>
                              </motion.tr>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Activity className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                        <p className="text-muted-foreground">No transaction data available</p>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="movement" className="space-y-4 mt-0">
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
                      <CardTitle>Stock Movement Over Time</CardTitle>
                      <CardDescription>Additions and removals from inventory</CardDescription>
                    </div>
                    <LineChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {chartData.stockMovement && chartData.stockMovement.labels.length > 0 ? (
                    <Line
                      data={chartData.stockMovement}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Quantity",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Date",
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            mode: "index",
                            intersect: false,
                          },
                        },
                        interaction: {
                          mode: "nearest",
                          intersect: false,
                        },
                        animation: {
                          duration: 1000,
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No transaction data available for the selected period</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Total Stock Added:</span>
                      </div>
                      <span className="font-medium">
                        {stockData.transactions
                          .filter((t) => t.type === "in" || t.type === "RECEIVE" || t.type === "ADJUSTMENT_ADD")
                          .reduce((sum, t) => sum + t.quantity, 0)}{" "}
                        units
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Total Stock Removed:</span>
                      </div>
                      <span className="font-medium">
                        {stockData.transactions
                          .filter((t) => t.type === "out" || t.type === "ISSUE" || t.type === "ADJUSTMENT_REMOVE")
                          .reduce((sum, t) => sum + t.quantity, 0)}{" "}
                        units
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Net Stock Change:</span>
                      </div>
                      <span
                        className={cn(
                          "font-medium",
                          stockData.transactions.reduce((net, t) => {
                            return (
                              net +
                              (t.type === "in" || t.type === "RECEIVE" || t.type === "ADJUSTMENT_ADD"
                                ? t.quantity
                                : -t.quantity)
                            )
                          }, 0) > 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {stockData.transactions.reduce((net, t) => {
                          return (
                            net +
                            (t.type === "in" || t.type === "RECEIVE" || t.type === "ADJUSTMENT_ADD"
                              ? t.quantity
                              : -t.quantity)
                          )
                        }, 0)}{" "}
                        units
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Product Categories</CardTitle>
                      <CardDescription>Distribution of products by category</CardDescription>
                    </div>
                    <PieChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {chartData.categoryDistribution ? (
                    <Pie
                      data={chartData.categoryDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                        animation: {
                          animateScale: true,
                          animateRotate: true,
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Category Value Distribution</CardTitle>
                      <CardDescription>Stock value by product category</CardDescription>
                    </div>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockData.valueByCategory.map((category, index) => (
                      <motion.div
                        key={category.category}
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
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: [
                                  "rgba(99, 102, 241, 0.7)",
                                  "rgba(168, 85, 247, 0.7)",
                                  "rgba(236, 72, 153, 0.7)",
                                  "rgba(239, 68, 68, 0.7)",
                                  "rgba(249, 115, 22, 0.7)",
                                  "rgba(234, 179, 8, 0.7)",
                                  "rgba(34, 197, 94, 0.7)",
                                  "rgba(16, 185, 129, 0.7)",
                                  "rgba(6, 182, 212, 0.7)",
                                  "rgba(59, 130, 246, 0.7)",
                                ][index % 10],
                              }}
                            ></div>
                            <span className="text-sm font-medium">{category.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">${category.value.toFixed(2)}</span>
                            <Badge variant="outline" className="ml-2">
                              {(
                                (category.value / stockData.valueByCategory.reduce((sum, c) => sum + c.value, 0)) *
                                100
                              ).toFixed(1)}
                              %
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            className="h-full"
                            style={{
                              backgroundColor: [
                                "rgba(99, 102, 241, 0.7)",
                                "rgba(168, 85, 247, 0.7)",
                                "rgba(236, 72, 153, 0.7)",
                                "rgba(239, 68, 68, 0.7)",
                                "rgba(249, 115, 22, 0.7)",
                                "rgba(234, 179, 8, 0.7)",
                                "rgba(34, 197, 94, 0.7)",
                                "rgba(16, 185, 129, 0.7)",
                                "rgba(6, 182, 212, 0.7)",
                                "rgba(59, 130, 246, 0.7)",
                              ][index % 10],
                            }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(category.value / stockData.valueByCategory[0].value) * 100}%`,
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
                    <Boxes className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-[300px]">
                      {chartData.stockByLocation ? (
                        <Doughnut
                          data={chartData.stockByLocation}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            animation: {
                              animateScale: true,
                              animateRotate: true,
                            },
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No location data available</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {stockData.valueByLocation.map((location, index) => (
                        <motion.div
                          key={location.location}
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 },
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: [
                                    "rgba(59, 130, 246, 0.7)",
                                    "rgba(16, 185, 129, 0.7)",
                                    "rgba(249, 115, 22, 0.7)",
                                    "rgba(168, 85, 247, 0.7)",
                                    "rgba(236, 72, 153, 0.7)",
                                    "rgba(234, 179, 8, 0.7)",
                                    "rgba(99, 102, 241, 0.7)",
                                    "rgba(6, 182, 212, 0.7)",
                                  ][index % 8],
                                }}
                              ></div>
                              <span className="text-sm font-medium">{location.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">${location.value.toFixed(2)}</span>
                              <Badge variant="outline" className="ml-2">
                                {(
                                  (location.value / stockData.valueByLocation.reduce((sum, l) => sum + l.value, 0)) *
                                  100
                                ).toFixed(1)}
                                %
                              </Badge>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              className="h-full"
                              style={{
                                backgroundColor: [
                                  "rgba(59, 130, 246, 0.7)",
                                  "rgba(16, 185, 129, 0.7)",
                                  "rgba(249, 115, 22, 0.7)",
                                  "rgba(168, 85, 247, 0.7)",
                                  "rgba(236, 72, 153, 0.7)",
                                  "rgba(234, 179, 8, 0.7)",
                                  "rgba(99, 102, 241, 0.7)",
                                  "rgba(6, 182, 212, 0.7)",
                                ][index % 8],
                              }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(location.value / stockData.valueByLocation[0].value) * 100}%`,
                                transition: { delay: 0.1 * index + 0.2, duration: 0.5 },
                              }}
                            ></motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}

