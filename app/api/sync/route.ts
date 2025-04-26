import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Define validation schemas for each entity type
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  sku: z.string(),
  price: z.number(),
  quantity: z.number(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactPerson: z.string(),
  email: z.string(),
  phone: z.string(),
  products: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const stockItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  category: z.string().optional(),
  quantity: z.number(),
  location: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  lastUpdated: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const stockTransactionSchema = z.object({
  id: z.string(),
  stockItemId: z.string(),
  type: z.string(),
  quantity: z.number(),
  previousQuantity: z.number(),
  newQuantity: z.number(),
  location: z.string().optional(),
  reference: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
})

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  fullName: z.string(),
  department: z.string().optional(),
  status: z.string(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Define the sync item schema
const syncItemSchema = z.object({
  id: z.string(),
  operation: z.enum(["create", "update", "delete"]),
  type: z.enum(["product", "supplier", "stockItem", "stockTransaction", "user"]),
  data: z.any().optional(),
  timestamp: z.number(),
})

// Define the sync request schema
const syncRequestSchema = z.array(syncItemSchema)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const syncItems = syncRequestSchema.parse(body)

    // Process each sync item
    const results = await Promise.allSettled(
      syncItems.map(async (item) => {
        try {
          switch (item.type) {
            case "product":
              return await syncProduct(item)
            case "supplier":
              return await syncSupplier(item)
            case "stockItem":
              return await syncStockItem(item)
            case "stockTransaction":
              return await syncStockTransaction(item)
            case "user":
              return await syncUser(item)
            default:
              throw new Error(`Unknown entity type: ${item.type}`)
          }
        } catch (error) {
          console.error(`Error syncing ${item.type} ${item.id}:`, error)
          throw error
        }
      }),
    )

    // Prepare response with success/failure status for each item
    const response = results.map((result, index) => {
      const item = syncItems[index]
      return {
        id: item.id,
        type: item.type,
        entityId: item.data?.id || item.id.split("-")[1],
        status: result.status,
        error: result.status === "rejected" ? (result as PromiseRejectedResult).reason.message : undefined,
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Failed to process sync request" }, { status: 400 })
  }
}

// Helper functions to sync each entity type
async function syncProduct(item: z.infer<typeof syncItemSchema>) {
  if (item.operation === "delete") {
    const entityId = item.id.split("-")[1]
    await prisma.product.delete({
      where: { id: entityId },
    })
    return { success: true, id: entityId }
  }

  // Validate the data
  const data = productSchema.parse(item.data)

  if (item.operation === "create" || item.operation === "update") {
    // Convert string dates to Date objects
    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date(data.updatedAt)

    await prisma.product.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price,
        quantity: data.quantity,
        category: data.category,
        vendor: data.vendor,
        imageUrl: data.imageUrl,
        updatedAt,
      },
      create: {
        id: data.id,
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price,
        quantity: data.quantity,
        category: data.category,
        vendor: data.vendor,
        imageUrl: data.imageUrl,
        createdAt,
        updatedAt,
      },
    })

    return { success: true, id: data.id }
  }

  throw new Error(`Unknown operation: ${item.operation}`)
}

async function syncSupplier(item: z.infer<typeof syncItemSchema>) {
  if (item.operation === "delete") {
    const entityId = item.id.split("-")[1]
    await prisma.supplier.delete({
      where: { id: entityId },
    })
    return { success: true, id: entityId }
  }

  // Validate the data
  const data = supplierSchema.parse(item.data)

  if (item.operation === "create" || item.operation === "update") {
    // Convert string dates to Date objects
    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date(data.updatedAt)

    await prisma.supplier.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products,
        status: data.status,
        updatedAt,
      },
      create: {
        id: data.id,
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        products: data.products,
        status: data.status,
        createdAt,
        updatedAt,
      },
    })

    return { success: true, id: data.id }
  }

  throw new Error(`Unknown operation: ${item.operation}`)
}

async function syncStockItem(item: z.infer<typeof syncItemSchema>) {
  if (item.operation === "delete") {
    const entityId = item.id.split("-")[1]
    await prisma.stockItem.delete({
      where: { id: entityId },
    })
    return { success: true, id: entityId }
  }

  // Validate the data
  const data = stockItemSchema.parse(item.data)

  if (item.operation === "create" || item.operation === "update") {
    // Convert string dates to Date objects
    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date(data.updatedAt)
    const lastUpdated = new Date(data.lastUpdated)

    await prisma.stockItem.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        status: data.status,
        type: data.type,
        lastUpdated,
        updatedAt,
      },
      create: {
        id: data.id,
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        status: data.status,
        type: data.type,
        lastUpdated,
        createdAt,
        updatedAt,
      },
    })

    return { success: true, id: data.id }
  }

  throw new Error(`Unknown operation: ${item.operation}`)
}

async function syncStockTransaction(item: z.infer<typeof syncItemSchema>) {
  if (item.operation === "delete") {
    const entityId = item.id.split("-")[1]
    await prisma.stockTransaction.delete({
      where: { id: entityId },
    })
    return { success: true, id: entityId }
  }

  // Validate the data
  const data = stockTransactionSchema.parse(item.data)

  if (item.operation === "create" || item.operation === "update") {
    // Convert string dates to Date objects
    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date() // Use current time for updatedAt

    // Create metadata object
    const metadata = {
      syncedFromClient: true,
      syncTimestamp: new Date().toISOString(),
    }

    await prisma.stockTransaction.upsert({
      where: { id: data.id },
      update: {
        type: data.type,
        quantity: data.quantity,
        previousQuantity: data.previousQuantity,
        newQuantity: data.newQuantity,
        location: data.location,
        reference: data.reference,
        reason: data.reason,
        notes: data.notes,
        updatedAt,
        metadata,
      },
      create: {
        id: data.id,
        type: data.type,
        quantity: data.quantity,
        previousQuantity: data.previousQuantity,
        newQuantity: data.newQuantity,
        location: data.location,
        reference: data.reference,
        reason: data.reason,
        notes: data.notes,
        stockItemId: data.stockItemId,
        createdAt,
        updatedAt,
        metadata,
      },
    })

    return { success: true, id: data.id }
  }

  throw new Error(`Unknown operation: ${item.operation}`)
}

async function syncUser(item: z.infer<typeof syncItemSchema>) {
  if (item.operation === "delete") {
    const entityId = item.id.split("-")[1]
    await prisma.oUR_USER.delete({
      where: { id: entityId },
    })
    return { success: true, id: entityId }
  }

  // Validate the data
  const data = userSchema.parse(item.data)

  if (item.operation === "create" || item.operation === "update") {
    // Convert string dates to Date objects
    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date(data.updatedAt)

    // Convert role string to UserRole enum
    const role = data.role as "admin" | "warehouse_manager" | "sales_person"

    await prisma.oUR_USER.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        department: data.department,
        status: data.status,
        role,
        updatedAt,
      },
      create: {
        id: data.id,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        department: data.department,
        status: data.status,
        role,
        createdAt,
        updatedAt,
        // Set default values for required fields
        phone: null,
        address: null,
        joinDate: createdAt,
        lastVisit: createdAt,
        totalSpent: 0,
        visits: 0,
        type: "New",
        notes: null,
      },
    })

    return { success: true, id: data.id }
  }

  throw new Error(`Unknown operation: ${item.operation}`)
}
