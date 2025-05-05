import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Get the current user from the session
async function getCurrentUser() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth")

  if (!authCookie) {
    return null
  }

  return JSON.parse(authCookie.value)
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Count total products
    const totalProducts = await prisma.product.count({
      where: whereClause,
    })

    // Count active suppliers
    const activeSuppliers = await prisma.supplier.count({
      where: {
        ...whereClause,
        status: "Active",
      },
    })

    // Count total users (only admins can see all users)
    const totalUsers = await prisma.oUR_USER.count({
      where: {
        createdById: session.id,
        id: { not: session.id }, // Exclude the admin themselves
      },
          })

    // Count low stock items
    const lowStockItems = await prisma.product.count({
      where: {
        ...whereClause,
        quantity: {
          lte: 10,
        },
      },
    })

    return {
      totalProducts,
      activeSuppliers,
      totalUsers,
      lowStockItems,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalProducts: 0,
      activeSuppliers: 0,
      totalUsers: 0,
      lowStockItems: 0,
    }
  }
}

// Get recent activity
export async function getRecentActivity() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Get recent stock transactions
    const stockTransactions = await prisma.stockTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        stockItem: true,
      },
    })

    // Get recent sales transactions
    const salesTransactions = await prisma.transaction.findMany({
      where: session.role !== "sales_person" ? { cashierId: session.id } : {},
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Format stock transactions
    const stockActivity = stockTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type === "in" ? "Stock In" : transaction.type === "out" ? "Stock Out" : "Adjustment",
      description: `${transaction.stockItem?.name || "Unknown item"} - ${transaction.quantity} units`,
      value: transaction.type === "in" ? `+${transaction.quantity}` : `-${transaction.quantity}`,
      timestamp: transaction.createdAt,
    }))

    // Format sales transactions
    const salesActivity = salesTransactions.map((transaction) => ({
      id: transaction.id,
      type: "Sale",
      description: `Reference: ${transaction.reference}`,
      value: `$${transaction.total.toFixed(2)}`,
      timestamp: transaction.createdAt,
    }))

    // Combine and sort by timestamp
    const allActivity = [...stockActivity, ...salesActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)

    return allActivity
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

// Get low stock items
export async function getLowStockItems() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        ...whereClause,
        quantity: {
          lte: 10,
        },
      },
      orderBy: { quantity: "asc" },
      take: 10,
    })

    // Format the data
    return lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      currentStock: product.quantity,
      threshold: 10, // Assuming threshold is 10
      status: product.quantity === 0 ? "Critical" : "Warning",
    }))
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    return []
  }
}

// Get stock overview data - Real data from database
export async function getStockOverviewData() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Get the current date
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Get stock transactions for the last 6 months
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1)

    // Get all stock transactions in the last 6 months
    const stockTransactions = await prisma.stockTransaction.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      include: {
        stockItem: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Get all stock items
    const stockItems = await prisma.stockItem.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
      },
    })

    // Create a map of stock item types
    const stockItemTypes = new Map()
    stockItems.forEach((item) => {
      if (item.type) {
        stockItemTypes.set(item.id, item.type)
      }
    })

    // Group transactions by month and type
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData = []

    // Initialize data for the last 12 months
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear

      monthlyData.push({
        month: months[monthIndex],
        year,
        monthIndex,
        "Raw Materials": 0,
        "Finished Goods": 0,
        Packaging: 0,
      })
    }

    // Sort monthly data by year and month
    monthlyData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.monthIndex - b.monthIndex
    })

    // Process transactions to calculate monthly stock levels
    stockTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt)
      const transactionMonth = transactionDate.getMonth()
      const transactionYear = transactionDate.getFullYear()

      // Find the corresponding month in our data
      const monthData = monthlyData.find(
        (m) =>
          m.monthIndex === transactionMonth &&
          (m.year === transactionYear || (m.monthIndex > currentMonth && transactionYear === currentYear - 1)),
      )

      if (monthData) {
        // Get the stock item type
        const itemType = transaction.stockItem?.type || stockItemTypes.get(transaction.stockItemId) || "Finished Goods"

        // Map the type to one of our three categories
        let category = "Finished Goods"
        if (itemType.toLowerCase().includes("raw") || itemType.toLowerCase().includes("material")) {
          category = "Raw Materials"
        } else if (itemType.toLowerCase().includes("package") || itemType.toLowerCase().includes("packaging")) {
          category = "Packaging"
        }

        // Update the quantity based on transaction type
        if (transaction.type === "in") {
          monthData[category] += transaction.quantity
        } else if (transaction.type === "out") {
          monthData[category] -= transaction.quantity
        } else if (transaction.type === "adjustment") {
          // For adjustments, we use the difference between new and previous quantity
          const difference = transaction.newQuantity - transaction.previousQuantity
          monthData[category] += difference
        }
      }
    })

    // Ensure no negative values
    monthlyData.forEach((month) => {
      month["Raw Materials"] = Math.max(0, month["Raw Materials"])
      month["Finished Goods"] = Math.max(0, month["Finished Goods"])
      month["Packaging"] = Math.max(0, month["Packaging"])
    })

    // Return only the last 6 months of data
    return monthlyData.slice(-6).map((data) => ({
      month: data.month,
      "Raw Materials": data["Raw Materials"],
      "Finished Goods": data["Finished Goods"],
      Packaging: data.Packaging,
    }))
  } catch (error) {
    console.error("Error fetching stock overview data:", error)
    // Return empty data in case of error
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month) => ({
      month,
      "Raw Materials": 0,
      "Finished Goods": 0,
      Packaging: 0,
    }))
  }
}

// Get stock distribution by location
export async function getStockDistributionByLocation() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Get stock items grouped by location
    const stockItems = await prisma.stockItem.findMany({
      where: whereClause,
      select: {
        location: true,
        quantity: true,
      },
    })

    // Group by location
    const locationMap = new Map()
    stockItems.forEach((item) => {
      const location = item.location || "Unknown"
      const currentQuantity = locationMap.get(location) || 0
      locationMap.set(location, currentQuantity + item.quantity)
    })

    // Format the data
    return Array.from(locationMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  } catch (error) {
    console.error("Error fetching stock distribution data:", error)
    return []
  }
}

// Get product growth rate - Calculate real growth rate
export async function getProductGrowthRate() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Get the current date
    const now = new Date()

    // Calculate the first day of the current month and previous month
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const firstDayOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    // Count products created in the current month
    const currentMonthProducts = await prisma.product.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: firstDayOfCurrentMonth,
        },
      },
    })

    // Count products created in the previous month
    const previousMonthProducts = await prisma.product.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: firstDayOfPreviousMonth,
          lt: firstDayOfCurrentMonth,
        },
      },
    })

    // Count products created two months ago
    const twoMonthsAgoProducts = await prisma.product.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: firstDayOfTwoMonthsAgo,
          lt: firstDayOfPreviousMonth,
        },
      },
    })

    // Calculate growth rate
    let growthRate = 0

    // If we have data for both previous months, calculate the growth rate
    if (previousMonthProducts > 0 || twoMonthsAgoProducts > 0) {
      // Calculate month-over-month growth
      const previousMonthGrowth = previousMonthProducts - twoMonthsAgoProducts
      const currentMonthGrowth = currentMonthProducts - previousMonthProducts

      // Calculate average growth
      const averageGrowth = (previousMonthGrowth + currentMonthGrowth) / 2

      // Calculate base for percentage (average of the two previous months)
      const base = (previousMonthProducts + twoMonthsAgoProducts) / 2

      // Calculate growth rate as a percentage
      growthRate = base > 0 ? (averageGrowth / base) * 100 : 0
    } else if (currentMonthProducts > 0) {
      // If we only have current month data, set a default growth rate
      growthRate = 100 // 100% growth since we started from 0
    }

    // Round to one decimal place
    return Number.parseFloat(growthRate.toFixed(1))
  } catch (error) {
    console.error("Error calculating product growth rate:", error)
    return 0
  }
}

// Get new suppliers this month
export async function getNewSuppliersThisMonth() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = session.role !== "sales_person" ? { createdById: session.id } : {}

    // Calculate the first day of the current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count suppliers created this month
    const newSuppliers = await prisma.supplier.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    return newSuppliers
  } catch (error) {
    console.error("Error fetching new suppliers count:", error)
    return 0
  }
}
