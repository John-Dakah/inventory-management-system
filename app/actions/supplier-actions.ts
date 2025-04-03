"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

export type SupplierFormData = {
  name: string
  contactPerson: string
  email: string
  phone: string
  products: string
  status: "Active" | "Inactive" | "On Hold"
}

export type SupplierFilter = {
  search?: string
  status?: string
}

export async function getSuppliers(filters?: SupplierFilter) {
  try {
    // Build the filter conditions
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { contactPerson: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { products: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters?.status && filters.status !== "All") {
      where.status = filters.status
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return { suppliers }
  } catch (error) {
    console.error("Failed to fetch suppliers:", error)
    return { error: "Failed to fetch suppliers" }
  }
}

export async function getSupplierStats() {
  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total count
    const total = await prisma.supplier.count()

    // Get active count
    const active = await prisma.supplier.count({
      where: { status: "Active" },
    })

    // Get new this month
    const newThisMonth = await prisma.supplier.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    // Get pending orders (this would be from a separate orders table in a real app)
    // For now, we'll simulate this with a random number
    const pendingOrders = Math.floor(Math.random() * 20)
    const suppliersWithOrders = Math.floor(Math.random() * 10)

    // Calculate average lead time (simulated)
    const avgLeadTime = (Math.random() * 7 + 3).toFixed(1)
    const leadTimeDiff = (Math.random() * 2 - 1).toFixed(1)

    return {
      total,
      active,
      newThisMonth,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      pendingOrders,
      suppliersWithOrders,
      avgLeadTime,
      leadTimeDiff,
    }
  } catch (error) {
    console.error("Failed to fetch supplier stats:", error)
    return { error: "Failed to fetch supplier statistics" }
  }
}

export async function addSupplier(data: SupplierFormData) {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products,
        status: data.status,
      },
    })

    revalidatePath("/suppliers")
    return { supplier }
  } catch (error) {
    console.error("Failed to add supplier:", error)
    return { error: "Failed to add supplier" }
  }
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products,
        status: data.status,
      },
    })

    revalidatePath("/suppliers")
    return { supplier }
  } catch (error) {
    console.error("Failed to update supplier:", error)
    return { error: "Failed to update supplier" }
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    })

    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete supplier:", error)
    return { error: "Failed to delete supplier" }
  }
}

