// Get the current user from cookies (client-side)
export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/me")
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Calculate total inventory value
export async function calculateInventoryValue() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Build the query parameters based on the user's role
    const whereClause = currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {};
    const queryParams = new URLSearchParams({
      whereClause: JSON.stringify(whereClause),
    });

    // Make a GET request to the API
    const response = await fetch(`/api/reports/inventory-value?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch inventory value");
    }

    const data = await response.json();

    // Return the inventory value
    return data.inventoryValue || 0;
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    return 0;
  }
}

// Calculate stock turnover rate
export async function calculateStockTurnoverRate() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Get the current date
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Get cost of goods sold (COGS) - using transaction items
    const cogsResponse = await fetch("/api/reports/cogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
        startDate: startOfYear.toISOString(),
        endDate: now.toISOString(),
      }),
    })

    if (!cogsResponse.ok) {
      throw new Error("Failed to fetch COGS")
    }

    const cogsData = await cogsResponse.json()
    const cogs = cogsData.cogs

    // Get average inventory value
    const inventoryResponse = await fetch("/api/reports/average-inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
        startDate: startOfYear.toISOString(),
        endDate: now.toISOString(),
      }),
    })

    if (!inventoryResponse.ok) {
      throw new Error("Failed to fetch average inventory")
    }

    const inventoryData = await inventoryResponse.json()
    const averageInventory = inventoryData.averageInventory

    // Calculate turnover rate
    // If average inventory is 0, return 0 to avoid division by zero
    if (averageInventory === 0) {
      return 0
    }

    const turnoverRate = cogs / averageInventory

    // Round to one decimal place
    return Number.parseFloat(turnoverRate.toFixed(1))
  } catch (error) {
    console.error("Error calculating stock turnover rate:", error)
    return 0
  }
}

// Get inventory value trends
export async function getInventoryValueTrends(timePeriod = "6months") {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Determine the start date based on the time period
    const now = new Date()
    let startDate

    switch (timePeriod) {
      case "30days":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        break
      case "3months":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 3)
        break
      case "12months":
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case "6months":
      default:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 6)
        break
    }

    // Fetch inventory value trends
    const response = await fetch("/api/reports/inventory-trends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        timePeriod,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch inventory trends")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching inventory value trends:", error)
    return []
  }
}

// Get top products by value
export async function getTopProductsByValue() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Get products
    const response = await fetch("/api/reports/top-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch top products")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching top products by value:", error)
    return []
  }
}

// Get stock movement trends
export async function getStockMovementTrends() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Get the current date
    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(now.getMonth() - 6)

    // Fetch stock movement trends
    const response = await fetch("/api/reports/stock-movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
        startDate: sixMonthsAgo.toISOString(),
        endDate: now.toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch stock movements")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching stock movement trends:", error)
    return []
  }
}

// Get supplier performance
export async function getSupplierPerformance() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Fetch supplier performance
    const response = await fetch("/api/reports/supplier-performance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch supplier performance")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching supplier performance:", error)
    return []
  }
}

// Get orders by supplier
export async function getOrdersBySupplier() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Fetch orders by supplier
    const response = await fetch("/api/reports/orders-by-supplier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch orders by supplier")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching orders by supplier:", error)
    return []
  }
}

// Get warehouse capacity utilization - Real data from database
export async function getWarehouseCapacityUtilization() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Fetch warehouse capacity utilization
    const response = await fetch("/api/reports/warehouse-capacity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch warehouse capacity")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching warehouse capacity utilization:", error)
    return []
  }
}

// Get items by warehouse
export async function getItemsByWarehouse() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Fetch items by warehouse
    const response = await fetch("/api/reports/items-by-warehouse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch items by warehouse")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching items by warehouse:", error)
    return []
  }
}

// Generate report
export async function generateReport(format = "excel") {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Generate report
    const response = await fetch("/api/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereClause: currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {},
        format,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate report")
    }

    return await response.json()
  } catch (error) {
    console.error("Error generating report:", error)
    return {
      success: false,
      error: "Failed to generate report",
    }
  }
}
