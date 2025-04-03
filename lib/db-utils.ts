// Enhanced IndexedDB utility functions

// Define the database structure
const DB_NAME = "inventory-management";
const DB_VERSION = 2; // Incremented version
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
] as const;

type StoreName = typeof STORES[number];

// Create a wrapper for IndexedDB operations
export async function getDB(): Promise<EnhancedIDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("Error opening database:", event);
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      const db = request.result;
      enhanceDatabase(db);
      resolve(db as EnhancedIDBDatabase);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const transaction = event.target?.transaction;

      // Create stores if they don't exist
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: "id" });
          
          // Add indexes based on store type
          switch (storeName) {
            case "products":
              store.createIndex("by-category", "category");
              store.createIndex("by-price", "price");
              break;
            case "suppliers":
              store.createIndex("by-name", "name");
              store.createIndex("by-status", "status");
              break;
            case "users":
              store.createIndex("by-email", "email", { unique: true });
              store.createIndex("by-role", "role");
              break;
          }
          
          console.log(`Created store: ${storeName}`);
        }
      });

      if (transaction) {
        transaction.oncomplete = () => {
          console.log("Database upgrade completed");
        };
      }
    };

    request.onblocked = () => {
      console.warn("Database upgrade blocked by other connections");
    };
  });
}

// Enhanced database interface
interface EnhancedIDBDatabase extends IDBDatabase {
  getAll: <T>(storeName: StoreName) => Promise<T[]>;
  get: <T>(storeName: StoreName, key: string) => Promise<T | undefined>;
  put: <T>(storeName: StoreName, value: T) => Promise<void>;
  delete: (storeName: StoreName, key: string) => Promise<void>;
  clear: (storeName: StoreName) => Promise<void>;
  query: <T>(storeName: StoreName, filterFn: (item: T) => boolean) => Promise<T[]>;
}

// Enhance the database with custom methods
function enhanceDatabase(db: IDBDatabase): void {
  const enhancedDB = db as EnhancedIDBDatabase;

  enhancedDB.getAll = async <T>(storeName: StoreName): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = (event) => {
          console.error(`Error getting all from ${storeName}:`, event);
          resolve([]); // Return empty array instead of rejecting
        };
      } catch (error) {
        console.error(`Error in getAll for ${storeName}:`, error);
        resolve([]);
      }
    });
  };

  enhancedDB.get = async <T>(storeName: StoreName, key: string): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = (event) => {
          console.error(`Error getting ${key} from ${storeName}:`, event);
          resolve(undefined);
        };
      } catch (error) {
        console.error(`Error in get for ${storeName}:`, error);
        resolve(undefined);
      }
    });
  };

  enhancedDB.put = async <T>(storeName: StoreName, value: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(value);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error putting to ${storeName}:`, event);
          reject(`Error putting to ${storeName}`);
        };
      } catch (error) {
        console.error(`Error in put for ${storeName}:`, error);
        reject(error);
      }
    });
  };

  enhancedDB.delete = async (storeName: StoreName, key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error deleting ${key} from ${storeName}:`, event);
          reject(`Error deleting ${key} from ${storeName}`);
        };
      } catch (error) {
        console.error(`Error in delete for ${storeName}:`, error);
        reject(error);
      }
    });
  };

  enhancedDB.clear = async (storeName: StoreName): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error clearing ${storeName}:`, event);
          reject(`Error clearing ${storeName}`);
        };
      } catch (error) {
        console.error(`Error in clear for ${storeName}:`, error);
        reject(error);
      }
    });
  };

  enhancedDB.query = async <T>(storeName: StoreName, filterFn: (item: T) => boolean): Promise<T[]> => {
    try {
      const allItems = await enhancedDB.getAll<T>(storeName);
      return allItems.filter(filterFn);
    } catch (error) {
      console.error(`Error in query for ${storeName}:`, error);
      return [];
    }
  };
}

// Check if a store exists
export async function storeExists(db: IDBDatabase, storeName: string): Promise<boolean> {
  return Array.from(db.objectStoreNames).includes(storeName);
}

// Initialize the database with sample data if needed
export async function initializeDatabase(): Promise<void> {
  const db = await getDB();

  // Check if customers store is empty
  const customers = await db.getAll("customers");
  if (customers.length === 0) {
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
    };
    await db.put("customers", walkInCustomer);
    console.log("Added default walk-in customer");
  }

  // Initialize settings if needed
  const settings = await db.get("settings", "sales-settings");
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
    };
    await db.put("settings", defaultSettings);
    console.log("Added default settings");
  }
}

// Add an item to the sync queue
export async function addToSyncQueue(item: any): Promise<void> {
  try {
    const db = await getDB();
    await db.put("syncQueue", {
      ...item,
      timestamp: Date.now(),
      syncStatus: "pending",
    });
  } catch (error) {
    console.error("Error adding to sync queue:", error);
    throw error;
  }
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Enhanced supplier functions
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  products: string[];
  status: "Active" | "Inactive" | "On Hold";
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "error";
  modified?: number;
}

export async function addSupplier(supplier: Supplier): Promise<void> {
  const db = await getDB();
  
  // Validate required fields
  if (!supplier.name || !supplier.contactPerson || !supplier.email) {
    throw new Error("Missing required supplier fields");
  }

  // Set timestamps
  const now = new Date().toISOString();
  supplier.createdAt = supplier.createdAt || now;
  supplier.updatedAt = now;
  supplier.modified = Date.now();
  supplier.syncStatus = "pending";

  try {
    await db.put("suppliers", supplier);
    await addToSyncQueue({
      type: "supplier",
      operation: supplier.id ? "update" : "create",
      data: supplier,
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw error;
  }
}

export async function getSupplier(id: string): Promise<Supplier | undefined> {
  const db = await getDB();
  return db.get("suppliers", id);
}

export async function getAllSuppliers(): Promise<Supplier[]> {
  const db = await getDB();
  return db.getAll("suppliers");
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<void> {
  const db = await getDB();
  const supplier = await db.get("suppliers", id);
  
  if (!supplier) {
    throw new Error("Supplier not found");
  }

  const updatedSupplier = {
    ...supplier,
    ...updates,
    updatedAt: new Date().toISOString(),
    modified: Date.now(),
    syncStatus: "pending",
  };

  await db.put("suppliers", updatedSupplier);
  await addToSyncQueue({
    type: "supplier",
    operation: "update",
    data: updatedSupplier,
  });
}

export async function deleteSupplier(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("suppliers", id);
  await addToSyncQueue({
    type: "supplier",
    operation: "delete",
    data: { id },
  });
}

// Additional utility functions
export async function getSuppliersByStatus(status: Supplier["status"]): Promise<Supplier[]> {
  const db = await getDB();
  const transaction = db.transaction("suppliers", "readonly");
  const store = transaction.objectStore("suppliers");
  const index = store.index("by-status");
  const request = index.getAll(status);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function searchSuppliers(query: string): Promise<Supplier[]> {
  const db = await getDB();
  const allSuppliers = await db.getAll("suppliers");
  
  return allSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(query.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(query.toLowerCase()) ||
    supplier.email.toLowerCase().includes(query.toLowerCase())
  );
}

// Database maintenance functions
export async function clearDatabase(): Promise<void> {
  const db = await getDB();
  await Promise.all(
    STORES.map(storeName => db.clear(storeName))
  );
  console.log("Database cleared");
}

export async function rebuildDatabase(): Promise<void> {
  await clearDatabase();
  await initializeDatabase();
  console.log("Database rebuilt");
}