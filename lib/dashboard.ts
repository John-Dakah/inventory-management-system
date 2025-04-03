import prisma from "./prisma"

// Get dashboard summary stats
export async function getDashboardStats() {
  const [totalProducts, activeSuppliers, totalUsers, lowStockItems] = await Promise.all([
    prisma.product.count(),
    prisma.supplier.count({
      where: { status: "Active" },
    }),
    prisma.oUR_USER.count(),
    prisma.stockItem.count({
      where: { status: "Low Stock" },
    }),
  ])

  return {
    totalProducts,
    activeSuppliers,
    totalUsers,
    lowStockItems,
  }
}

// Get recent activity (stock transactions)
export async function getRecentActivity(limit = 3) {
  const recentTransactions = await prisma.stockTransaction.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { stockItem: true },
  })

  return recentTransactions.map((transaction) => {
    let type = "Stock Update"
    let description = ""
    let value = ""

    if (transaction.type === "in") {
      type = "Stock In"
      description = `Added ${transaction.quantity} units of ${transaction.stockItem.name}`
      value = `+${transaction.quantity}`
    } else if (transaction.type === "out") {
      type = "Stock Out"
      description = `Removed ${transaction.quantity} units of ${transaction.stockItem.name}`
      value = `-${transaction.quantity}`
    } else if (transaction.type === "adjustment") {
      type = "Stock Adjustment"
      description = `Adjusted ${transaction.stockItem.name} to ${transaction.newQuantity} units`
      value = `=${transaction.newQuantity}`
    }

    return {
      id: transaction.id,
      type,
      description,
      value,
      createdAt: transaction.createdAt,
    }
  })
}

// Get low stock items
export async function getLowStockItems(limit = 5) {
  const lowStockItems = await prisma.stockItem.findMany({
    where: { status: "Low Stock" },
    take: limit,
    orderBy: { quantity: "asc" },
  })

  // For each item, we'll calculate a threshold based on its category
  // In a real app, you might have a separate threshold field
  return lowStockItems.map((item) => {
    // Simple logic to determine threshold - in a real app this would be more sophisticated
    const threshold = item.category === "Electronics" ? 20 : 10

    let status = "Warning"
    if (item.quantity <= threshold * 0.5) {
      status = "Critical"
    }

    return {
      id: item.id,
      name: item.name,
      currentStock: item.quantity,
      threshold,
      status,
    }
  })
}

// Get stock overview data for chart (monthly data)
export async function getStockOverviewData() {
  // Get all transactions grouped by month
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const transactions = await prisma.stockTransaction.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Group by month and calculate net stock changes
  const monthlyData: Record<string, { month: string; total: number }> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        total: 0,
      }
    }

    // Calculate net change based on transaction type
    if (transaction.type === "in") {
      monthlyData[monthYear].total += transaction.quantity
    } else if (transaction.type === "out") {
      monthlyData[monthYear].total -= transaction.quantity
    }
  })

  // Convert to array and sort by date
  return Object.values(monthlyData).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}

// Get stock distribution by location
export async function getStockDistributionByLocation() {
  const stockByLocation = await prisma.stockItem.groupBy({
    by: ["location"],
    _sum: {
      quantity: true,
    },
  })

  return stockByLocation.map((location) => ({
    location: location.location,
    quantity: location._sum.quantity || 0,
  }))
}

// Get product growth rate
export async function getProductGrowthRate() {
  // Get count from last month
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  const [lastMonthCount, twoMonthsAgoCount] = await Promise.all([
    prisma.product.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    }),
    prisma.product.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: lastMonth,
        },
      },
    }),
  ])

  // Calculate growth rate
  if (twoMonthsAgoCount === 0) return 100 // If no products two months ago, growth is 100%

  const growthRate = ((lastMonthCount - twoMonthsAgoCount) / twoMonthsAgoCount) * 100
  return growthRate.toFixed(1)
}

// Get new suppliers this month
export async function getNewSuppliersThisMonth() {
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const newSuppliers = await prisma.supplier.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  return newSuppliers
}

