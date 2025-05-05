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
    const totalUsers =
      session.role === "admin"
        ? await prisma.oUR_USER.count()
        : await prisma.oUR_USER.count({
            where: { createdById: session.id },
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

// Get stock overview data
export async function getStockOverviewData() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // For demo purposes, generate mock data
    // In a real application, this would query the database for historical stock levels
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    // Generate data for the last 6 months
    const data = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      data.push({
        month: months[monthIndex],
        "Raw Materials": Math.floor(Math.random() * 1000) + 500,
        "Finished Goods": Math.floor(Math.random() * 2000) + 1000,
        Packaging: Math.floor(Math.random() * 500) + 200,
      })
    }

    return data
  } catch (error) {
    console.error("Error fetching stock overview data:", error)
    return []
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

// Get product growth rate
export async function getProductGrowthRate() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // For demo purposes, return a fixed growth rate
    // In a real application, this would calculate the growth rate based on historical data
    return 8.5
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
