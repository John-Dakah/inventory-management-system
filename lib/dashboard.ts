import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

export async function getDashboardStats() {
  // Get the current admin's ID from the auth cookie
  const authCookie = cookies().get("auth")
  let adminId = null

  if (authCookie) {
    try {
      const { id, role } = JSON.parse(authCookie.value)
      if (role === "admin") {
        adminId = id
      }
    } catch (error) {
      console.error("Error parsing auth cookie:", error)
    }
  }

  // Count users created by this admin (excluding the admin)
  const totalUsers = adminId
    ? await prisma.oUR_USER.count({
        where: {
          createdById: adminId,
          id: { not: adminId }, // Exclude the admin themselves
        },
      })
    : 0

  // Get other stats (these are placeholders - implement as needed)
  const totalProducts = await prisma.product.count()
  const activeSuppliers = await prisma.supplier.count({
    where: { status: "active" },
  })
  const lowStockItems = await prisma.product.count({
    where: { quantity: { lt: 10 } },
  })

  return {
    totalUsers,
    totalProducts,
    activeSuppliers,
    lowStockItems,
  }
}

export async function getRecentActivity() {
  // Implement this function based on your data model
  return [
    {
      id: "1",
      type: "Stock Received",
      description: "Laptop shipment arrived",
      value: "+25 units",
    },
    {
      id: "2",
      type: "Stock Adjustment",
      description: "Inventory count correction",
      value: "-3 units",
    },
    {
      id: "3",
      type: "New Product",
      description: "Added wireless keyboards",
      value: "SKU: KB-001",
    },
  ]
}

export async function getLowStockItems() {
  // Implement this function based on your data model
  const products = await prisma.product.findMany({
    where: { quantity: { lt: 10 } },
    take: 5,
    orderBy: { quantity: "asc" },
  })

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    currentStock: product.quantity,
    threshold: 5, // This could be a field in your product model
    status: product.quantity <= 2 ? "Critical" : "Warning",
  }))
}

export async function getStockOverviewData() {
  // Placeholder data - implement based on your data model
  return [
    { name: "Jan", value: 2400 },
    { name: "Feb", value: 1398 },
    { name: "Mar", value: 9800 },
    { name: "Apr", value: 3908 },
    { name: "May", value: 4800 },
    { name: "Jun", value: 3800 },
    { name: "Jul", value: 4300 },
  ]
}

export async function getStockDistributionByLocation() {
  // Placeholder data - implement based on your data model
  return [
    { name: "North", value: 4000 },
    { name: "South", value: 3000 },
    { name: "East", value: 2000 },
    { name: "West", value: 2780 },
    { name: "Central", value: 1890 },
  ]
}

export async function getProductGrowthRate() {
  // Placeholder - implement based on your data model
  return 12.5
}

export async function getNewSuppliersThisMonth() {
  // Placeholder - implement based on your data model
  return 3
}
