// Enhanced IndexedDB utility functions

// Define the database structure
const DB_NAME = "inventory-management"
const DB_VERSION = 3
const STORES = [
  "customers",
  "products",
  "transactions",
  "orders",
  "settings",
  "syncQueue",
  "suppliers",
  "stockItems",
  "stockTransactions",
  "users",
]

// Create a wrapper for IndexedDB operations
export async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("Error opening database:", event)
      reject("Error opening database")
    }

    request.onsuccess = (event) => {
      const db = request.result

      // Add custom methods to the database object
      enhanceDatabase(db)

      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create stores if they don't exist
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" })
          console.log(`Created store: ${storeName}`)
        }
      })
    }
  })
}

// Enhance the database with custom methods
function enhanceDatabase(db: IDBDatabase): void {
  // Add getAll method to the database
  ;(db as any).getAll = async (storeName: string): Promise<any[]> =>
    new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = (event) => {
          console.error(`Error getting all from ${storeName}:`, event)
          reject(`Error getting all from ${storeName}`)
        }
      } catch (error) {
        console.error(`Error in getAll for ${storeName}:`, error)
        // Return empty array instead of rejecting to prevent cascading errors
        resolve([])
      }
    })

  // Add get method to the database
  ;(db as any).get = async (storeName: string, key: string): Promise<any> =>
    new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.get(key)

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = (event) => {
          console.error(`Error getting ${key} from ${storeName}:`, event)
          reject(`Error getting ${key} from ${storeName}`)
        }
      } catch (error) {
        console.error(`Error in get for ${storeName}:`, error)
        resolve(undefined)
      }
    })

  // Add put method to the database
  ;(db as any).put = async (storeName: string, value: any): Promise<void> =>
    new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.put(value)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = (event) => {
          console.error(`Error putting to ${storeName}:`, event)
          reject(`Error putting to ${storeName}`)
        }
      } catch (error) {
        console.error(`Error in put for ${storeName}:`, error)
        reject(error)
      }
    })

  // Add delete method to the database
  ;(db as any).delete = async (storeName: string, key: string): Promise<void> =>
    new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.delete(key)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = (event) => {
          console.error(`Error deleting ${key} from ${storeName}:`, event)
          reject(`Error deleting ${key} from ${storeName}`)
        }
      } catch (error) {
        console.error(`Error in delete for ${storeName}:`, error)
        reject(error)
      }
    })

  // Add clear method to the database
  ;(db as any).clear = async (storeName: string): Promise<void> =>
    new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = (event) => {
          console.error(`Error clearing ${storeName}:`, event)
          reject(`Error clearing ${storeName}`)
        }
      } catch (error) {
        console.error(`Error in clear for ${storeName}:`, error)
        reject(error)
      }
    })

  // Add query method to the database for filtering
  ;(db as any).query = async (storeName: string, filterFn: (item: any) => boolean): Promise<any[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const allItems = await (db as any).getAll(storeName)
        const filteredItems = allItems.filter(filterFn)
        resolve(filteredItems)
      } catch (error) {
        console.error(`Error in query for ${storeName}:`, error)
        reject(error)
      }
    })
}

// Check if a store exists
export async function storeExists(db: IDBDatabase, storeName: string): Promise<boolean> {
  return Array.from(db.objectStoreNames).includes(storeName)
}

// Initialize the database with sample data if needed
export async function initializeDatabase(): Promise<void> {
  const db = await getDB()

  // Check if customers store is empty
  const customers = await (db as any).getAll("customers")

  if (customers.length === 0) {
    // Add a default walk-in customer
    const walkInCustomer = {
      id: "1",
      name: "Walk-in Customer",
      email: "",
      phone: "",
      address: "",
      totalSpent: 0,
      lastPurchase: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "synced",
      modified: Date.now(),
    }

    await (db as any).put("customers", walkInCustomer)
    console.log("Added default walk-in customer")
  }

  // Initialize settings if needed
  const settings = await (db as any).get("settings", "sales-settings")

  if (!settings) {
    const defaultSettings = {
      id: "sales-settings",
      general: {
        businessName: "Your Business",
        address: "123 Main St, City, Country",
        phone: "(555) 123-4567",
      },
      sales: {
        defaultTax: "7.5",
        allowDiscounts: true,
        receiptFooter: "Thank you for your business!",
      },
      syncStatus: "synced",
    }

    await (db as any).put("settings", defaultSettings)
    console.log("Added default settings")
  }
}

// Add an item to the sync queue
export async function addToSyncQueue(item: any): Promise<void> {
  try {
    const db = await getDB()
    await (db as any).put("syncQueue", item)
  } catch (error) {
    console.error("Error adding to sync queue:", error)
  }
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine
}

