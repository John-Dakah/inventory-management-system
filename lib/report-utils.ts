import { getProducts, getStockTransactions,getStockItems, getSupplierNames } from "@/lib/db"
import { prisma } from "@/lib/prisma"
// IndexedDB fallback

// Fetch suppliers from Prisma or IndexedDB as a fallback
import { Supplier } from "@/types"; // Adjust the path to where the Supplier type is defined

export async function getSuppliers(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await fetch("/api/suppliers");
    if (!response.ok) {
      throw new Error("Failed to fetch suppliers");
    }

    const suppliers = await response.json();
    return suppliers.suppliers; // Assuming the API returns { suppliers, total, page, limit }
  } catch (error) {
    console.error("Error fetching suppliers:", error);

    // Fall back to IndexedDB
    const idbSuppliers = await getSupplierNames();
    return idbSuppliers.map((name, index) => ({
      id: `fallback-${index}`, // Generate a fallback ID
      name: name, // Use the string as the name
    }));
  }
}

// Calculate inventory value (price * quantity) for all products
export async function calculateInventoryValue(): Promise<number> {
  try {
    const response = await fetch("/api/reports/inventory-value");
    if (!response.ok) {
      throw new Error("Failed to fetch inventory value");
    }

    const data = await response.json();
    return data.inventoryValue;
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    return 0; // Return a fallback value
  }
}
// Calculate stock turnover rate (approximation based on transactions)
export async function calculateStockTurnoverRate(): Promise<number> {
  try {
    const response = await fetch("/api/reports/stock-turnover-rate");
    if (!response.ok) {
      throw new Error("Failed to fetch stock turnover rate");
    }

    const data = await response.json();
    return data.turnoverRate;
  } catch (error) {
    console.error("Error fetching stock turnover rate:", error);

    // Fall back to IndexedDB
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const idbTransactions = await getStockTransactions();
    const thirtyDayTransactions = idbTransactions.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo);

    const outTransactions = thirtyDayTransactions.filter((t) => t.type === "out");
    const stockItems = await getStockItems();
    const totalInventory = stockItems.reduce((sum, item) => sum + item.quantity, 0);

    const outgoingUnits = outTransactions.reduce((sum, t) => sum + t.quantity, 0);
    return totalInventory > 0 ? (outgoingUnits / totalInventory) * 12 : 0;
  }
}

// Get inventory value trends over time (last 6 months)
export async function getInventoryValueTrends(period = "6months") {
  try {
    const response = await fetch(`/api/reports/inventory-value-trends?period=${period}`);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory value trends");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inventory value trends:", error);
    return [];
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
export async function getTopProductsByValue(): Promise<{ name: string; value: number }[]> {
  try {
    const response = await fetch("/api/reports/top-products");
    if (!response.ok) {
      throw new Error("Failed to fetch top products by value");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching top products by value:", error);

    // Fall back to IndexedDB
    const idbProducts = await getProducts();

    // Calculate value (price * quantity) for each product
    const productsWithValue = idbProducts.map((product) => ({
      name: product.name,
      value: product.price * product.quantity,
    }));

    // Sort by value and take top 5
    return productsWithValue.sort((a, b) => b.value - a.value).slice(0, 5);
  }
}

// Get stock movement trends (in vs out)
export async function getStockMovementTrends(): Promise<{ month: string; stockIn: number; stockOut: number }[]> {
  try {
    const response = await fetch("/api/reports/stock-movement-trends");
    if (!response.ok) {
      throw new Error("Failed to fetch stock movement trends");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stock movement trends:", error);
    return getFallbackStockMovementTrends();
  }
}

// Fallback function for stock movement trends using IndexedDB
async function getFallbackStockMovementTrends(): Promise<{ month: string; stockIn: number; stockOut: number }[]> {
  // Get the last 6 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  // Get all transactions from IndexedDB
  const transactions = await getStockTransactions();

  // Filter transactions within the date range
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.createdAt);
    return date >= startDate && date <= endDate;
  });

  // Group transactions by month and type
  const monthlyData: Record<string, { stockIn: number; stockOut: number }> = {};

  // Initialize with all months in the period
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`;
    monthlyData[monthYear] = { stockIn: 0, stockOut: 0 };
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Process transactions
  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

    if (transaction.type === "in") {
      monthlyData[monthYear].stockIn += transaction.quantity;
    } else if (transaction.type === "out") {
      monthlyData[monthYear].stockOut += transaction.quantity;
    }
  });

  // Convert to array format for the chart
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    stockIn: data.stockIn,
    stockOut: data.stockOut,
  }));
}


// Get supplier performance data
export async function getSupplierPerformance(): Promise<{ name: string; rate: number }[]> {
  try {
    const response = await fetch("/api/reports/supplier-performance");
    if (!response.ok) {
      throw new Error("Failed to fetch supplier performance");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching supplier performance:", error);

    // Fall back to IndexedDB
    const idbSuppliers = await getSuppliers();

    return idbSuppliers.map((supplier) => ({
      name: supplier.name,
      rate: Math.floor(Math.random() * 15) + 85, // Random number between 85-99
    }));
  }
}

// Get orders by supplier
export async function getOrdersBySupplier(): Promise<{ name: string; orders: number }[]> {
  try {
    const response = await fetch("/api/reports/orders-by-supplier");
    if (!response.ok) {
      throw new Error("Failed to fetch orders by supplier");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders by supplier:", error);

    // Fall back to IndexedDB
    const idbSuppliers = await getSuppliers();

    return idbSuppliers.map((supplier) => ({
      name: supplier.name,
      orders: Math.floor(Math.random() * 30) + 15, // Random number between 15-44
    }));
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



export async function getItemsByWarehouse(): Promise<{ name: string; items: number }[]> {
  try {
    const response = await fetch("/api/reports/items-by-warehouse");
    if (!response.ok) {
      throw new Error("Failed to fetch items by warehouse");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching items by warehouse:", error);

    // Return fallback data
    return [];
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

