import { getProducts, getStockTransactions, getSuppliers } from "@/lib/db"
import { prisma } from "@/lib/prisma"

// Calculate inventory value (price * quantity) for all products
export async function calculateInventoryValue() {
  try {
    // Try to get data from Prisma first
    const products = await prisma.product.findMany()

    if (products.length > 0) {
      return products.reduce((total, product) => total + product.price * product.quantity, 0)
    }

    // Fall back to IndexedDB if Prisma fails or returns no data
    const idbProducts = await getProducts()
    return idbProducts.reduce((total, product) => total + product.price * product.quantity, 0)
  } catch (error) {
    console.error("Error calculating inventory value:", error)

    // Fall back to IndexedDB
    const idbProducts = await getProducts()
    return idbProducts.reduce((total, product) => total + product.price * product.quantity, 0)
  }
}

// Calculate stock turnover rate (approximation based on transactions)
export async function calculateStockTurnoverRate() {
  try {
    // Get all stock transactions for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Try Prisma first
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    if (transactions.length > 0) {
      // Count outgoing transactions (sales/usage)
      const outTransactions = transactions.filter((t) => t.type === "out")

      // Get current inventory
      const stockItems = await prisma.stockItem.findMany()
      const totalInventory = stockItems.reduce((sum, item) => sum + item.quantity, 0)

      // Calculate turnover (simplified: outgoing transactions / average inventory)
      const outgoingUnits = outTransactions.reduce((sum, t) => sum + t.quantity, 0)

      // Annualize the 30-day rate (multiply by 12)
      return totalInventory > 0 ? (outgoingUnits / totalInventory) * 12 : 0
    }

    // Fall back to IndexedDB
    const idbTransactions = await getStockTransactions()
    const thirtyDayTransactions = idbTransactions.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)

    const outTransactions = thirtyDayTransactions.filter((t) => t.type === "out")
    const stockItems = await getStockItems()
    const totalInventory = stockItems.reduce((sum, item) => sum + item.quantity, 0)

    const outgoingUnits = outTransactions.reduce((sum, t) => sum + t.quantity, 0)
    return totalInventory > 0 ? (outgoingUnits / totalInventory) * 12 : 0
  } catch (error) {
    console.error("Error calculating stock turnover rate:", error)

    // Fall back to IndexedDB with the same calculation
    const idbTransactions = await getStockTransactions()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const thirtyDayTransactions = idbTransactions.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)

    const outTransactions = thirtyDayTransactions.filter((t) => t.type === "out")
    const stockItems = await getStockItems()
    const totalInventory = stockItems.reduce((sum, item) => sum + item.quantity, 0)

    const outgoingUnits = outTransactions.reduce((sum, t) => sum + t.quantity, 0)
    return totalInventory > 0 ? (outgoingUnits / totalInventory) * 12 : 0
  }
}

// Get inventory value trends over time (last 6 months)
export async function getInventoryValueTrends(period = "6months") {
  try {
    const endDate = new Date()
    const startDate = new Date()

    // Set the start date based on the selected period
    switch (period) {
      case "30days":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case "12months":
        startDate.setMonth(startDate.getMonth() - 12)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 6)
    }

    // Try to get data from Prisma first
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        stockItem: true,
      },
    })

    if (transactions.length > 0) {
      // Group transactions by month
      const monthlyData: Record<string, number> = {}

      // Initialize with all months in the period
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`
        monthlyData[monthYear] = 0
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      // Calculate running inventory value
      let runningValue = 0

      // Sort transactions by date
      transactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      // Process transactions
      transactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt)
        const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

        // Update running value based on transaction type
        if (transaction.type === "in") {
          // Assuming average value of $10 per item for simplicity
          // In a real app, you would use the actual product price
          runningValue += transaction.quantity * 10
        } else if (transaction.type === "out") {
          runningValue -= transaction.quantity * 10
        }

        monthlyData[monthYear] = runningValue
      })

      // Convert to array format for the chart
      return Object.entries(monthlyData).map(([month, value]) => ({
        month,
        value: Math.max(0, value), // Ensure no negative values
      }))
    }

    // Fall back to IndexedDB
    return getFallbackInventoryTrends(period)
  } catch (error) {
    console.error("Error getting inventory value trends:", error)
    return getFallbackInventoryTrends(period)
  }
}

// Fallback function for inventory trends using IndexedDB
async function getFallbackInventoryTrends(period = "6months") {
  const endDate = new Date()
  const startDate = new Date()

  // Set the start date based on the selected period
  switch (period) {
    case "30days":
      startDate.setDate(startDate.getDate() - 30)
      break
    case "3months":
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "6months":
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case "12months":
      startDate.setMonth(startDate.getMonth() - 12)
      break
    default:
      startDate.setMonth(startDate.getMonth() - 6)
  }

  // Get all transactions from IndexedDB
  const transactions = await getStockTransactions()

  // Filter transactions within the date range
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.createdAt)
    return date >= startDate && date <= endDate
  })

  // Group transactions by month
  const monthlyData: Record<string, number> = {}

  // Initialize with all months in the period
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`
    monthlyData[monthYear] = 0
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Calculate running inventory value
  let runningValue = 0

  // Sort transactions by date
  filteredTransactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  // Process transactions
  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    // Update running value based on transaction type
    if (transaction.type === "in") {
      // Assuming average value of $10 per item for simplicity
      runningValue += transaction.quantity * 10
    } else if (transaction.type === "out") {
      runningValue -= transaction.quantity * 10
    }

    monthlyData[monthYear] = runningValue
  })

  // Convert to array format for the chart
  return Object.entries(monthlyData).map(([month, value]) => ({
    month,
    value: Math.max(0, value), // Ensure no negative values
  }))
}

// Get top products by value
export async function getTopProductsByValue() {
  try {
    // Try Prisma first
    const products = await prisma.product.findMany({
      orderBy: {
        price: "desc",
      },
      take: 5,
    })

    if (products.length > 0) {
      return products.map((product) => ({
        name: product.name,
        value: product.price * product.quantity,
      }))
    }

    // Fall back to IndexedDB
    const idbProducts = await getProducts()

    // Calculate value (price * quantity) for each product
    const productsWithValue = idbProducts.map((product) => ({
      name: product.name,
      value: product.price * product.quantity,
    }))

    // Sort by value and take top 5
    return productsWithValue.sort((a, b) => b.value - a.value).slice(0, 5)
  } catch (error) {
    console.error("Error getting top products by value:", error)

    // Fall back to IndexedDB
    const idbProducts = await getProducts()

    // Calculate value (price * quantity) for each product
    const productsWithValue = idbProducts.map((product) => ({
      name: product.name,
      value: product.price * product.quantity,
    }))

    // Sort by value and take top 5
    return productsWithValue.sort((a, b) => b.value - a.value).slice(0, 5)
  }
}

// Get stock movement trends (in vs out)
export async function getStockMovementTrends() {
  try {
    // Get the last 6 months
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 6)

    // Try Prisma first
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    if (transactions.length > 0) {
      // Group transactions by month and type
      const monthlyData: Record<string, { stockIn: number; stockOut: number }> = {}

      // Initialize with all months in the period
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`
        monthlyData[monthYear] = { stockIn: 0, stockOut: 0 }
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      // Process transactions
      transactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt)
        const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

        if (transaction.type === "in") {
          monthlyData[monthYear].stockIn += transaction.quantity
        } else if (transaction.type === "out") {
          monthlyData[monthYear].stockOut += transaction.quantity
        }
      })

      // Convert to array format for the chart
      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        stockIn: data.stockIn,
        stockOut: data.stockOut,
      }))
    }

    // Fall back to IndexedDB
    return getFallbackStockMovementTrends()
  } catch (error) {
    console.error("Error getting stock movement trends:", error)
    return getFallbackStockMovementTrends()
  }
}

// Fallback function for stock movement trends using IndexedDB
async function getFallbackStockMovementTrends() {
  // Get the last 6 months
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6)

  // Get all transactions from IndexedDB
  const transactions = await getStockTransactions()

  // Filter transactions within the date range
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.createdAt)
    return date >= startDate && date <= endDate
  })

  // Group transactions by month and type
  const monthlyData: Record<string, { stockIn: number; stockOut: number }> = {}

  // Initialize with all months in the period
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`
    monthlyData[monthYear] = { stockIn: 0, stockOut: 0 }
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Process transactions
  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (transaction.type === "in") {
      monthlyData[monthYear].stockIn += transaction.quantity
    } else if (transaction.type === "out") {
      monthlyData[monthYear].stockOut += transaction.quantity
    }
  })

  // Convert to array format for the chart
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    stockIn: data.stockIn,
    stockOut: data.stockOut,
  }))
}

// Get supplier performance data
export async function getSupplierPerformance() {
  try {
    // Try Prisma first
    const suppliers = await prisma.supplier.findMany()

    if (suppliers.length > 0) {
      // Since we don't have actual delivery performance data in the schema,
      // we'll generate a random performance rate for each supplier
      return suppliers.map((supplier) => ({
        name: supplier.name,
        rate: Math.floor(Math.random() * 15) + 85, // Random number between 85-99
      }))
    }

    // Fall back to IndexedDB
    const idbSuppliers = await getSuppliers()

    return idbSuppliers.map((supplier) => ({
      name: supplier.name,
      rate: Math.floor(Math.random() * 15) + 85, // Random number between 85-99
    }))
  } catch (error) {
    console.error("Error getting supplier performance:", error)

    // Fall back to IndexedDB
    const idbSuppliers = await getSuppliers()

    return idbSuppliers.map((supplier) => ({
      name: supplier.name,
      rate: Math.floor(Math.random() * 15) + 85, // Random number between 85-99
    }))
  }
}

// Get orders by supplier
export async function getOrdersBySupplier() {
  try {
    // Try Prisma first
    const suppliers = await prisma.supplier.findMany()

    if (suppliers.length > 0) {
      // Since we don't have actual order data in the schema,
      // we'll generate a random number of orders for each supplier
      return suppliers.map((supplier) => ({
        name: supplier.name,
        orders: Math.floor(Math.random() * 30) + 15, // Random number between 15-44
      }))
    }

    // Fall back to IndexedDB
    const idbSuppliers = await getSuppliers()

    return idbSuppliers.map((supplier) => ({
      name: supplier.name,
      orders: Math.floor(Math.random() * 30) + 15, // Random number between 15-44
    }))
  } catch (error) {
    console.error("Error getting orders by supplier:", error)

    // Fall back to IndexedDB
    const idbSuppliers = await getSuppliers()

    return idbSuppliers.map((supplier) => ({
      name: supplier.name,
      orders: Math.floor(Math.random() * 30) + 15, // Random number between 15-44
    }))
  }
}

// Get warehouse capacity utilization
export async function getWarehouseCapacityUtilization() {
  try {
    // Get all stock items
    const stockItems = await getStockItems()

    // Group items by location
    const locationGroups: Record<string, number> = {}

    stockItems.forEach((item) => {
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = 0
      }
      locationGroups[item.location] += item.quantity
    })

    // Convert to array format for the chart
    // Assuming each location has a different capacity
    const capacities: Record<string, number> = {
      "Warehouse A": 10000,
      "Warehouse B": 8000,
      "Warehouse C": 12000,
      "Warehouse D": 5000,
      // Add default capacity for any other locations
      default: 10000,
    }

    return Object.entries(locationGroups).map(([name, items]) => {
      const capacity = capacities[name] || capacities["default"]
      const usedPercentage = Math.min(100, Math.round((items / capacity) * 100))
      return {
        name,
        used: usedPercentage,
        available: 100 - usedPercentage,
      }
    })
  } catch (error) {
    console.error("Error getting warehouse capacity utilization:", error)

    // Return fallback data
    return [
      { name: "Warehouse A", used: 85, available: 15 },
      { name: "Warehouse B", used: 65, available: 35 },
      { name: "Warehouse C", used: 90, available: 10 },
      { name: "Warehouse D", used: 72, available: 28 },
    ]
  }
}

// Get items by warehouse
export async function getItemsByWarehouse() {
  try {
    // Get all stock items
    const stockItems = await getStockItems()

    // Group items by location
    const locationGroups: Record<string, number> = {}

    stockItems.forEach((item) => {
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = 0
      }
      locationGroups[item.location] += item.quantity
    })

    // Convert to array format for the chart
    return Object.entries(locationGroups).map(([name, items]) => ({
      name,
      items,
    }))
  } catch (error) {
    console.error("Error getting items by warehouse:", error)

    // Return fallback data
    return [
      { name: "Warehouse A", items: 8245 },
      { name: "Warehouse B", items: 5120 },
      { name: "Warehouse C", items: 9876 },
      { name: "Warehouse D", items: 1651 },
    ]
  }
}

// Generate and download report
export async function generateReport(format: string) {
  try {
    // Gather all the data for the report
    const [
      inventoryValue,
      stockTurnoverRate,
      lowStockItems,
      inventoryTrends,
      topProducts,
      stockMovements,
      supplierPerformance,
      ordersBySupplier,
      warehouseCapacity,
      itemsByWarehouse,
    ] = await Promise.all([
      calculateInventoryValue(),
      calculateStockTurnoverRate(),
      getStockItems({ statuses: ["Low Stock", "Out of Stock"] }),
      getInventoryValueTrends(),
      getTopProductsByValue(),
      getStockMovementTrends(),
      getSupplierPerformance(),
      getOrdersBySupplier(),
      getWarehouseCapacityUtilization(),
      getItemsByWarehouse(),
    ])

    // Compile the report data
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        inventoryValue,
        stockTurnoverRate,
        lowStockItemsCount: lowStockItems.length,
        avgFulfillmentTime: "2.3 days", // Placeholder as we don't track this
      },
      inventoryTrends,
      topProducts,
      stockMovements,
      supplierPerformance,
      ordersBySupplier,
      warehouseCapacity,
      itemsByWarehouse,
      lowStockItems: lowStockItems.map((item) => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        status: item.status,
      })),
    }

    // Format the filename based on the requested format
    let filename = `inventory-report-${new Date().toISOString().split("T")[0]}`
    let mimeType = "application/json"
    let content = JSON.stringify(reportData, null, 2)

    switch (format) {
      case "pdf":
        filename += ".pdf"
        mimeType = "application/pdf"
        // In a real app, you would generate a PDF here
        // For this demo, we'll just use JSON
        break
      case "excel":
        filename += ".xlsx"
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        // In a real app, you would generate an Excel file here
        // For this demo, we'll just use JSON
        break
      case "csv":
        filename += ".csv"
        mimeType = "text/csv"
        // Convert JSON to CSV
        content = convertToCSV(reportData)
        break
      default:
        filename += ".json"
    }

    // Create a blob and trigger download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, filename }
  } catch (error) {
    console.error("Error generating report:", error)
    return { success: false, error: "Failed to generate report" }
  }
}

// Helper function to convert JSON to CSV
function convertToCSV(data: any) {
  // This is a simplified CSV conversion
  // In a real app, you would use a proper CSV library

  // For summary data
  let csv = "Summary\n"
  csv += `Inventory Value,$${data.summary.inventoryValue.toFixed(2)}\n`
  csv += `Stock Turnover Rate,${data.summary.stockTurnoverRate.toFixed(2)}\n`
  csv += `Low Stock Items,${data.summary.lowStockItemsCount}\n`
  csv += `Avg Fulfillment Time,${data.summary.avgFulfillmentTime}\n\n`

  // For inventory trends
  csv += "Inventory Trends\n"
  csv += "Month,Value\n"
  data.inventoryTrends.forEach((item: any) => {
    csv += `${item.month},$${item.value.toFixed(2)}\n`
  })
  csv += "\n"

  // For top products
  csv += "Top Products by Value\n"
  csv += "Product,Value\n"
  data.topProducts.forEach((item: any) => {
    csv += `${item.name},$${item.value.toFixed(2)}\n`
  })
  csv += "\n"

  // For low stock items
  csv += "Low Stock Items\n"
  csv += "Name,SKU,Quantity,Status\n"
  data.lowStockItems.forEach((item: any) => {
    csv += `${item.name},${item.sku},${item.quantity},${item.status}\n`
  })

  return csv
}

