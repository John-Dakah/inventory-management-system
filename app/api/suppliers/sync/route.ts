import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// POST to sync multiple suppliers at once
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { suppliers } = data

    if (!Array.isArray(suppliers) || suppliers.length === 0) {
      return NextResponse.json({ error: "No suppliers provided for sync" }, { status: 400 })
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    // Process each supplier
    for (const supplier of suppliers) {
      try {
        const { id, syncStatus, deleted, syncError, ...supplierData } = supplier

        if (supplier.deleted) {
          // Delete supplier
          await prisma.supplier.delete({
            where: { id },
          })
          results.success.push(id)
        } else {
          // Check if supplier exists
          const exists = await prisma.supplier.findUnique({
            where: { id },
          })

          if (exists) {
            // Update supplier
            await prisma.supplier.update({
              where: { id },
              data: supplierData,
            })
          } else {
            // Create supplier
            await prisma.supplier.create({
              data: {
                id,
                ...supplierData,
              },
            })
          }

          results.success.push(id)
        }
      } catch (error: any) {
        console.error(`Error syncing supplier ${supplier.id}:`, error)
        results.failed.push({
          id: supplier.id,
          error: error.message || "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: `Synced ${results.success.length} suppliers, ${results.failed.length} failed`,
      results,
    })
  } catch (error: any) {
    console.error("Error in bulk sync:", error)
    return NextResponse.json({ error: error.message || "Failed to sync suppliers" }, { status: 500 })
  }
}

