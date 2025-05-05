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
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Build the query based on user role
    const whereClause = currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {}

    // Get all products
    const products = await fetch("/api/reports/inventory-value", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whereClause }),
    }).then((res) => res.json())

    // Calculate total value
    return products.reduce((total, product) => total + product.price * product.quantity, 0)
  } catch (error) {
    console.error("Error calculating inventory value:", error)
    return 0
  }
}

// Calculate stock turnover rate
export async function calculateStockTurnoverRate() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // For demo purposes, return a fixed turnover rate
    // In a real application, this would calculate the rate based on sales and average inventory
    return 4.7
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

    // For demo purposes, generate mock data
    // In a real application, this would query the database for historical inventory values
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    let numMonths
    switch (timePeriod) {
      case "30days":
        numMonths = 1
        break
      case "3months":
        numMonths = 3
        break
      case "12months":
        numMonths = 12
        break
      case "6months":
      default:
        numMonths = 6
        break
    }

    // Generate data for the specified time period
    const data = []
    for (let i = numMonths - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      data.push({
        month: months[monthIndex],
        value: Math.floor(Math.random() * 50000) + 100000,
      })
    }

    return data
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

    // Build the query based on user role
    const whereClause = currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {}

    // Get products
    const response = await fetch("/api/reports/top-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whereClause }),
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

    // For demo purposes, generate mock data
    // In a real application, this would query the database for historical stock movements
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    // Generate data for the last 6 months
    return months.map((month) => ({
      month,
      stockIn: Math.floor(Math.random() * 500) + 200,
      stockOut: Math.floor(Math.random() * 400) + 100,
    }))
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

    // Build the query based on user role
    const whereClause = currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {}

    // Get suppliers
    const response = await fetch("/api/reports/supplier-performance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whereClause }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch supplier performance")
    }

    const suppliers = await response.json()

    // For demo purposes, add random performance rates
    return suppliers.map((supplier) => ({
      name: supplier.name,
      rate: Math.floor(Math.random() * 30) + 70, // Random rate between 70-100%
    }))
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

    // Build the query based on user role
    const whereClause = currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {}

    // Get suppliers
    const response = await fetch("/api/reports/supplier-performance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whereClause }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch suppliers")
    }

    const suppliers = await response.json()

    // For demo purposes, add random order counts
    return suppliers.map((supplier) => ({
      name: supplier.name,
      orders: Math.floor(Math.random() * 50) + 10, // Random orders between 10-60
    }))
  } catch (error) {
    console.error("Error fetching orders by supplier:", error)
    return []
  }
}

// Get warehouse capacity utilization
export async function getWarehouseCapacityUtilization() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // For demo purposes, generate mock data
    // In a real application, this would query the database for warehouse capacity
    const warehouses = ["Main Warehouse", "East Wing", "West Wing", "North Storage"]

    return warehouses.map((name) => {
      const used = Math.floor(Math.random() * 60) + 20 // Random usage between 20-80%
      return {
        name,
        used,
        available: 100 - used,
      }
    })
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

    // Build the query based on user role
    const whereClause = currentUser.role !== "sales_person" ? { createdById: currentUser.id } : {}

    // Get stock items grouped by location
    const response = await fetch("/api/reports/items-by-warehouse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whereClause }),
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

    // For demo purposes, simulate report generation
    // In a real application, this would generate an actual report file
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate processing time

    return {
      success: true,
      filename: `inventory-report-${new Date().toISOString().split("T")[0]}.${format}`,
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return {
      success: false,
      error: "Failed to generate report",
    }
  }
}
