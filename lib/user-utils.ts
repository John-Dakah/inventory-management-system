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

// Fix the getUserStats function to properly filter by createdById
export async function getUserStats() {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Always filter by createdById unless the user is a super admin
    const whereClause = { createdById: session.id }

    // Count total users
    const totalUsers = await prisma.oUR_USER.count({
      where: whereClause,
    })

    // Count active users
    const activeUsers = await prisma.oUR_USER.count({
      where: {
        ...whereClause,
        status: "active",
      },
    })

    // Count inactive users
    const inactiveUsers = await prisma.oUR_USER.count({
      where: {
        ...whereClause,
        status: "inactive",
      },
    })

    // Count users by role
    const adminUsers = await prisma.oUR_USER.count({
      where: {
        ...whereClause,
        role: "admin",
      },
    })

    const warehouseManagers = await prisma.oUR_USER.count({
      where: {
        ...whereClause,
        role: "warehouse_manager",
      },
    })

    const salesPersons = await prisma.oUR_USER.count({
      where: {
        ...whereClause,
        role: "sales_person",
      },
    })

    // Calculate active percentage
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

    // Get new users this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const newUsersThisMonth = await prisma.oUR_USER.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      warehouseManagers,
      salesPersons,
      activePercentage,
      newUsersThisMonth,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      warehouseManagers: 0,
      salesPersons: 0,
      activePercentage: 0,
      newUsersThisMonth: 0,
    }
  }
}

// Fix the getUsers function to properly filter by createdById
export async function getUsers(page = 1, limit = 10, filter = {}) {
  try {
    const session = await getCurrentUser()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Always filter by createdById
    const whereClause = {
      createdById: session.id,
      ...filter,
    }

    // Count total users matching the filter
    const totalCount = await prisma.oUR_USER.count({
      where: whereClause,
    })

    // Get users with pagination
    const users = await prisma.oUR_USER.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit)

    return {
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      users: [],
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
      },
    }
  }
}
