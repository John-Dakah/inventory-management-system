// IndexedDB utility for offline storage

// Database configuration
const DB_NAME = "pos-offline-db"
const DB_VERSION = 1
const STORES = {
  PENDING_TRANSACTIONS: "pendingTransactions",
  PRODUCTS_CACHE: "productsCache",
  CUSTOMERS_CACHE: "customersCache",
}

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject("Error opening IndexedDB")
    }

    request.onsuccess = (event) => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_TRANSACTIONS)) {
        db.createObjectStore(STORES.PENDING_TRANSACTIONS, { keyPath: "id", autoIncrement: true })
      }

      if (!db.objectStoreNames.contains(STORES.PRODUCTS_CACHE)) {
        db.createObjectStore(STORES.PRODUCTS_CACHE, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORES.CUSTOMERS_CACHE)) {
        db.createObjectStore(STORES.CUSTOMERS_CACHE, { keyPath: "id" })
      }
    }
  })
}

// Store pending transaction
export async function storePendingTransaction(transaction: any): Promise<number> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_TRANSACTIONS, "readwrite")
    const store = tx.objectStore(STORES.PENDING_TRANSACTIONS)

    const request = store.add({
      ...transaction,
      timestamp: new Date().toISOString(),
      synced: false,
    })

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject("Error storing pending transaction")
    }
  })
}

// Get all pending transactions
export async function getPendingTransactions(): Promise<any[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_TRANSACTIONS, "readonly")
    const store = tx.objectStore(STORES.PENDING_TRANSACTIONS)

    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject("Error getting pending transactions")
    }
  })
}

// Mark transaction as synced
export async function markTransactionSynced(id: number): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_TRANSACTIONS, "readwrite")
    const store = tx.objectStore(STORES.PENDING_TRANSACTIONS)

    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const transaction = getRequest.result
      transaction.synced = true

      const updateRequest = store.put(transaction)

      updateRequest.onsuccess = () => {
        resolve()
      }

      updateRequest.onerror = () => {
        reject("Error marking transaction as synced")
      }
    }

    getRequest.onerror = () => {
      reject("Error getting transaction")
    }
  })
}

// Delete synced transaction
export async function deleteTransaction(id: number): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_TRANSACTIONS, "readwrite")
    const store = tx.objectStore(STORES.PENDING_TRANSACTIONS)

    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject("Error deleting transaction")
    }
  })
}

// Cache products
export async function cacheProducts(products: any[]): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PRODUCTS_CACHE, "readwrite")
    const store = tx.objectStore(STORES.PRODUCTS_CACHE)

    // Clear existing cache
    const clearRequest = store.clear()

    clearRequest.onsuccess = () => {
      // Add all products
      let completed = 0

      products.forEach((product) => {
        const request = store.add(product)

        request.onsuccess = () => {
          completed++
          if (completed === products.length) {
            resolve()
          }
        }

        request.onerror = () => {
          reject("Error caching product")
        }
      })

      // If no products, resolve immediately
      if (products.length === 0) {
        resolve()
      }
    }

    clearRequest.onerror = () => {
      reject("Error clearing product cache")
    }
  })
}

// Get cached products
export async function getCachedProducts(): Promise<any[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PRODUCTS_CACHE, "readonly")
    const store = tx.objectStore(STORES.PRODUCTS_CACHE)

    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject("Error getting cached products")
    }
  })
}

// Cache customers
export async function cacheCustomers(customers: any[]): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CUSTOMERS_CACHE, "readwrite")
    const store = tx.objectStore(STORES.CUSTOMERS_CACHE)

    // Clear existing cache
    const clearRequest = store.clear()

    clearRequest.onsuccess = () => {
      // Add all customers
      let completed = 0

      customers.forEach((customer) => {
        const request = store.add(customer)

        request.onsuccess = () => {
          completed++
          if (completed === customers.length) {
            resolve()
          }
        }

        request.onerror = () => {
          reject("Error caching customer")
        }
      })

      // If no customers, resolve immediately
      if (customers.length === 0) {
        resolve()
      }
    }

    clearRequest.onerror = () => {
      reject("Error clearing customer cache")
    }
  })
}

// Get cached customers
export async function getCachedCustomers(): Promise<any[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CUSTOMERS_CACHE, "readonly")
    const store = tx.objectStore(STORES.CUSTOMERS_CACHE)

    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject("Error getting cached customers")
    }
  })
}

