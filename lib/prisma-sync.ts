// This file handles syncing data between IndexedDB and Prisma/Neon database
import { getPendingSyncItems } from "./sync-manager"

// Function to sync data with Prisma when online
export async function syncWithPrisma(): Promise<boolean> {
  try {
    // Get all pending sync items
    const syncItems = await getPendingSyncItems()

    if (syncItems.length === 0) {
      return true
    }

    // Group items by type and operation for batch processing
    const itemsByTypeAndOperation: Record<string, Record<string, any[]>> = {}

    syncItems.forEach((item) => {
      if (!itemsByTypeAndOperation[item.type]) {
        itemsByTypeAndOperation[item.type] = {}
      }

      if (!itemsByTypeAndOperation[item.type][item.operation]) {
        itemsByTypeAndOperation[item.type][item.operation] = []
      }

      itemsByTypeAndOperation[item.type][item.operation].push(item.data)
    })

    // Process each type and operation
    for (const type in itemsByTypeAndOperation) {
      for (const operation in itemsByTypeAndOperation[type]) {
        const items = itemsByTypeAndOperation[type][operation]

        // Here you would make API calls to your backend
        // For example:
        const endpoint = `/api/${type}s/${operation}`

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
          })

          if (!response.ok) {
            console.error(`Error syncing ${type} ${operation}:`, await response.text())
            return false
          }
        } catch (error) {
          console.error(`Error syncing ${type} ${operation}:`, error)
          return false
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error syncing with Prisma:", error)
    return false
  }
}

// Function to fetch initial data from Prisma
export async function fetchInitialData(): Promise<boolean> {
  try {
    // Fetch data for each entity type
    const entityTypes = [
      "products",
      "customers",
      "suppliers",
      "stockItems",
      "stockTransactions",
      "orders",
      "transactions",
    ]

    for (const type of entityTypes) {
      try {
        const response = await fetch(`/api/${type}`)

        if (!response.ok) {
          console.error(`Error fetching ${type}:`, await response.text())
          continue
        }

        const data = await response.json()

        // Store data in IndexedDB
        // This would be implemented in each service file
        console.log(`Fetched ${data.length} ${type}`)
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
      }
    }

    return true
  } catch (error) {
    console.error("Error fetching initial data:", error)
    return false
  }
}

