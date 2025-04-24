import prisma from "@/lib/prisma"

async function main() {
  try {
    // Check if CASH_DRAWER stock item exists
    const cashDrawer = await prisma.stockItem.findUnique({
      where: {
        sku: "CASH_DRAWER",
      },
    })

    // Create CASH_DRAWER if it doesn't exist
    if (!cashDrawer) {
      console.log("Creating CASH_DRAWER stock item...")
      const drawer = await prisma.stockItem.create({
        data: {
          id: "cash_drawer_main",
          name: "Cash Drawer",
          sku: "CASH_DRAWER",
          category: "System",
          quantity: 0,
          location: "Main Register",
          status: "Closed",
          lastUpdated: new Date(),
          type: "Cash",
        },
      })
      console.log("CASH_DRAWER stock item created:", drawer)
    } else {
      console.log("CASH_DRAWER stock item already exists")
    }

    console.log("Database setup complete!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

