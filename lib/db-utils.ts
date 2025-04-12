import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "suppliers_db"
const DB_VERSION = 1
const SUPPLIERS_STORE = "suppliers"

let dbPromise: Promise<IDBPDatabase> | null = null

export async function initializeDatabase() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create suppliers store if it doesn't exist
        if (!db.objectStoreNames.contains(SUPPLIERS_STORE)) {
          const store = db.createObjectStore(SUPPLIERS_STORE, { keyPath: "id" })

          // Create indexes for faster queries
          store.createIndex("syncStatus", "syncStatus", { unique: false })
          store.createIndex("status", "status", { unique: false })
          store.createIndex("createdAt", "createdAt", { unique: false })
        }
      },
    })
  }

  return dbPromise
}

export async function getDatabase() {
  if (!dbPromise) {
    return initializeDatabase()
  }
  return dbPromise
}

export async function clearDatabase() {
  const db = await getDatabase()
  const tx = db.transaction(SUPPLIERS_STORE, "readwrite")
  await tx.objectStore(SUPPLIERS_STORE).clear()
  await tx.done
}

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDatabase()
  return db.getAll(storeName)
}

export async function getFromStore<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await getDatabase()
  return db.get(storeName, id)
}

export async function addToStore<T>(storeName: string, item: T): Promise<string> {
  const db = await getDatabase()
  return db.add(storeName, item)
}

export async function putToStore<T>(storeName: string, item: T): Promise<string> {
  const db = await getDatabase()
  return db.put(storeName, item)
}

export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await getDatabase()
  return db.delete(storeName, id)
}

export async function getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
  const db = await getDatabase()
  const tx = db.transaction(storeName, "readonly")
  const index = tx.store.index(indexName)
  const items = await index.getAll(value)
  await tx.done
  return items
}

export async function countByIndex(storeName: string, indexName: string, value: any): Promise<number> {
  const db = await getDatabase()
  const tx = db.transaction(storeName, "readonly")
  const index = tx.store.index(indexName)
  const count = await index.count(value)
  await tx.done
  return count
}

export const SUPPLIERS_DB = {
  name: DB_NAME,
  version: DB_VERSION,
  stores: {
    suppliers: SUPPLIERS_STORE,
  },
}
export const db = {
  suppliers: {
    filter: (callback: (supplier: any) => boolean) => ({
      count: async () => {
        // Mock implementation for counting unsynced suppliers
        return 0; // Replace with actual logic
      },
    }),
  },
};

