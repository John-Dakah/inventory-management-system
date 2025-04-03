import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const items = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid sync data format" }, { status: 400 })
    }

    // Process each item in the batch
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const { id, operation, data, type, timestamp } = item

          // Handle different data types
          if (type === "product") {
            // Handle product operations
            switch (operation) {
              case "create":
              case "update":
                if (!data) {
                  return { id, success: false, error: "Missing data for create/update operation" }
                }

                // Upsert the product
                await prisma.product.upsert({
                  where: { id: data.id },
                  update: {
                    name: data.name,
                    description: data.description || "",
                    sku: data.sku,
                    price: data.price,
                    quantity: data.quantity,
                    category: data.category || "",
                    vendor: data.vendor || "",
                    imageUrl: data.imageUrl || "",
                    updatedAt: new Date(data.updatedAt),
                  },
                  create: {
                    id: data.id,
                    name: data.name,
                    description: data.description || "",
                    sku: data.sku,
                    price: data.price,
                    quantity: data.quantity,
                    category: data.category || "",
                    vendor: data.vendor || "",
                    imageUrl: data.imageUrl || "",
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                  },
                })

                return { id, success: true }

              case "delete":
                // Delete the product
                await prisma.product.delete({
                  where: { id },
                })

                return { id, success: true }

              default:
                return { id, success: false, error: `Unknown operation: ${operation}` }
            }
          } else if (type === "supplier") {
            // Handle supplier operations
            switch (operation) {
              case "create":
              case "update":
                if (!data) {
                  return { id, success: false, error: "Missing data for create/update operation" }
                }

                // Upsert the supplier
                await prisma.supplier.upsert({
                  where: { id: data.id },
                  update: {
                    name: data.name,
                    contactPerson: data.contactPerson,
                    email: data.email,
                    phone: data.phone,
                    products: data.products,
                    status: data.status,
                    updatedAt: new Date(data.updatedAt),
                  },
                  create: {
                    id: data.id,
                    name: data.name,
                    contactPerson: data.contactPerson,
                    email: data.email,
                    phone: data.phone,
                    products: data.products,
                    status: data.status,
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                  },
                })

                return { id, success: true }

              case "delete":
                // Delete the supplier
                await prisma.supplier.delete({
                  where: { id },
                })

                return { id, success: true }

              default:
                return { id, success: false, error: `Unknown operation: ${operation}` }
            }
          } else {
            // Inside the POST function, update the switch statement to handle stock items and transactions
            switch (type) {
              case "stockItem":
                // Handle stock item operations
                switch (operation) {
                  case "create":
                  case "update":
                    if (!data) {
                      return { id, success: false, error: "Missing data for create/update operation" }
                    }

                    // Upsert the stock item
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
                        lastUpdated: new Date(data.lastUpdated),
                        updatedAt: new Date(data.updatedAt),
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
                        lastUpdated: new Date(data.lastUpdated),
                        createdAt: new Date(data.createdAt),
                        updatedAt: new Date(data.updatedAt),
                      },
                    })

                    return { id, success: true }

                  case "delete":
                    // Delete the stock item
                    await prisma.stockItem.delete({
                      where: { id },
                    })

                    return { id, success: true }

                  default:
                    return { id, success: false, error: `Unknown operation: ${operation}` }
                }
              case "stockTransaction":
                // Handle stock transaction operations
                switch (operation) {
                  case "create":
                    if (!data) {
                      return { id, success: false, error: "Missing data for create operation" }
                    }

                    // Create the stock transaction
                    await prisma.stockTransaction.create({
                      data: {
                        id: data.id,
                        stockItemId: data.stockItemId,
                        type: data.type,
                        quantity: data.quantity,
                        previousQuantity: data.previousQuantity,
                        newQuantity: data.newQuantity,
                        location: data.location,
                        reference: data.reference,
                        reason: data.reason,
                        notes: data.notes,
                        createdAt: new Date(data.createdAt),
                      },
                    })

                    return { id, success: true }

                  default:
                    return { id, success: false, error: `Unknown operation: ${operation}` }
                }
              default:
                return { id, success: false, error: `Unknown data type: ${type}` }
            }
          }
        } catch (error: any) {
          console.error(`Error processing sync item ${item.id}:`, error)
          return {
            id: item.id,
            success: false,
            error: error.message || "Unknown error",
          }
        }
      }),
    )

    return NextResponse.json({ items: results })
  } catch (error: any) {
    console.error("Error processing sync batch:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

