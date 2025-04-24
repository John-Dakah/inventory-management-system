import { openDB, type DBSchema, type IDBPDatabase } from "idb";
export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDB(); // Ensure `getDB` initializes IndexedDB
  const user = await db.get("users", userId);
  return user || null; // Return the user or null if not found
}
interface ProductDBSchema extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: {
      "by-modified": number;
      "by-sync-status": string;
    };
  };
  suppliers: {
    key: string;
    value: Supplier;
    indexes: {
      "by-modified": number;
      "by-sync-status": string;
      "by-status": string;
    };
  };
  stockItems: {
    key: string;
    value: StockItem;
    indexes: {
      "by-modified": number;
      "by-sync-status": string;
      "by-category": string;
      "by-location": string;
      "by-status": string;
      "by-type": string;
    };
  };
  stockTransactions: {
    key: string;
    value: StockTransaction;
    indexes: {
      "by-stockItemId": string;
      "by-type": string;
      "by-modified": number;
      "by-sync-status": string;
      "by-createdAt": string;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      operation: "create" | "update" | "delete";
      data?: Product | Supplier | StockItem | StockTransaction | User;
      type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user";
      timestamp: number;
    };
  };
  users: {
    key: string;
    value: User;
    indexes: {
      "by-modified": number;
      "by-sync-status": string;
      "by-role": string;
      "by-status": string;
      "by-email": string;
    };
  };
  categories: {
    key: string;
    value: {
      name: string;
      createdAt: string;
    };
  };
  transactions: {
    key: string;
    value: any;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  quantity: number;
  category?: string;
  vendor?: string;
  weight?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "error";
  modified?: number;
}
export async function checkStorageQuota(): Promise<{ used: number; total: number; percentUsed: number }> {
  // Example implementation
  const quota = await navigator.storage.estimate();
  const used = quota.usage || 0;
  const total = quota.quota || 0;
  const percentUsed = (used / total) * 100;

  return { used, total, percentUsed };
}
export async function getStockStats(): Promise<{
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}> {
  const db = await getDB();
  const products = await db.getAll("products");

  const totalItems = products.length;
  const lowStockItems = products.filter((product) => product.quantity > 0 && product.quantity <= 10).length;
  const outOfStockItems = products.filter((product) => product.quantity === 0).length;

  return { totalItems, lowStockItems, outOfStockItems };
}
export async function getSuppliers(): Promise<Supplier[]> {
  const db = await getDB(); // Assuming `getDB` initializes IndexedDB
  const suppliers = await db.getAll("suppliers"); // Replace "suppliers" with your actual store name
  return suppliers;
}
export async function getSupplierStats(): Promise<{
  total: number;
  active: number;
  newThisMonth: number;
  activePercentage: number;
  onHold: number;
  inactive: number;
}> {
  const suppliers = await getSuppliers();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === "Active").length,
    onHold: suppliers.filter((s) => s.status === "On Hold").length,
    inactive: suppliers.filter((s) => s.status === "Inactive").length,
    newThisMonth: suppliers.filter((s) => new Date(s.createdAt) >= firstDayOfMonth).length,
  };

  stats.activePercentage = Math.round((stats.active / stats.total) * 100);

  return stats;
}
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
  const db = await getDB();
  const user = await db.get("users", userId);

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
  await db.put("users", updatedUser);
  return updatedUser;
}
export async function getSupplierNames(): Promise<string[]> {
  const db = await getDB();
  const suppliers = await db.getAll("suppliers");

  return suppliers.map((supplier) => supplier.name);
}
export async function getStockItems(filters?: { statuses?: string[] }): Promise<StockItem[]> {
  const db = await getDB();
  const stockItems = await db.getAll("stockItems");

  // Apply filters if provided
  if (filters?.statuses && filters.statuses.length > 0) {
    return stockItems.filter((item) => filters.statuses!.includes(item.status));
  }

  return stockItems;
}
export async function saveStockItem(stockItem: StockItem): Promise<void> {
  const db = await getDB();
  const transaction = db.transaction("stockItems", "readwrite");
  const store = transaction.objectStore("stockItems");
  store.put(stockItem);
  await transaction.done;
}
export async function recordStockTransaction(transaction: StockTransaction): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["stockItems", "stockTransactions"], "readwrite");

  // Update the stock item
  const stockItemStore = tx.objectStore("stockItems");
  const stockItem = await stockItemStore.get(transaction.stockItemId);
  if (!stockItem) {
    throw new Error("Stock item not found");
  }
  stockItem.quantity = transaction.newQuantity;
  stockItem.lastUpdated = new Date().toISOString();
  stockItemStore.put(stockItem);

  // Record the transaction
  const transactionStore = tx.objectStore("stockTransactions");
  transactionStore.put(transaction);

  await tx.done;
}
export async function getStockTransactions(): Promise<StockTransaction[]> {
  const db = await getDB();
  return db.getAll("stockTransactions");
}
export async function getProductStats(): Promise<{
  total: number;
  categories: string[];
}> {
  const db = await getDB();
  const products = await db.getAll("products");

  const total = products.length;
  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));

  return { total, categories };
}
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  products: string;
  status: "Active" | "Inactive" | "On Hold";
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "error";
  modified?: number;
}

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
  type: "Finished Good" | "Raw Material";
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "error";
  modified?: number;
}

export interface StockTransaction {
  id: string;
  stockItemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  location: string;
  reference?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  syncStatus?: "pending" | "synced" | "error";
  modified?: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  department?: string;
  status: "ACTIVE" | "INACTIVE";
  role: "admin" | "warehouse_manager" | "sales_person";
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "error";
  modified?: number;
}

let dbPromise: Promise<IDBPDatabase<ProductDBSchema>> | null = null;

// Current database version - increment this when making schema changes
const CURRENT_DB_VERSION = 4;

export async function getDB(): Promise<IDBPDatabase<ProductDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ProductDBSchema>("inventory-db", CURRENT_DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        // Handle incremental upgrades based on oldVersion
        for (let version = oldVersion + 1; version <= newVersion; version++) {
          await applySchemaChanges(db, version, transaction);
        }
      },
    });
  }
  return dbPromise;
}

async function applySchemaChanges(
  db: IDBPDatabase<ProductDBSchema>,
  version: number,
  transaction: any
): Promise<void> {
  switch (version) {
    case 1:
      // Initial schema setup
      const productStore = db.createObjectStore("products", { keyPath: "id" });
      productStore.createIndex("by-modified", "modified");
      productStore.createIndex("by-sync-status", "syncStatus");

      const supplierStore = db.createObjectStore("suppliers", { keyPath: "id" });
      supplierStore.createIndex("by-modified", "modified");
      supplierStore.createIndex("by-sync-status", "syncStatus");
      supplierStore.createIndex("by-status", "status");

      const stockItemStore = db.createObjectStore("stockItems", { keyPath: "id" });
      stockItemStore.createIndex("by-modified", "modified");
      stockItemStore.createIndex("by-sync-status", "syncStatus");
      stockItemStore.createIndex("by-category", "category");
      stockItemStore.createIndex("by-location", "location");
      stockItemStore.createIndex("by-status", "status");
      stockItemStore.createIndex("by-type", "type");

      const stockTransactionStore = db.createObjectStore("stockTransactions", { keyPath: "id" });
      stockTransactionStore.createIndex("by-stockItemId", "stockItemId");
      stockTransactionStore.createIndex("by-type", "type");
      stockTransactionStore.createIndex("by-modified", "modified");
      stockTransactionStore.createIndex("by-sync-status", "syncStatus");
      stockTransactionStore.createIndex("by-createdAt", "createdAt");

      db.createObjectStore("syncQueue", { keyPath: "id" });

      const userStore = db.createObjectStore("users", { keyPath: "id" });
      userStore.createIndex("by-modified", "modified");
      userStore.createIndex("by-sync-status", "syncStatus");
      userStore.createIndex("by-role", "role");
      userStore.createIndex("by-status", "status");
      userStore.createIndex("by-email", "email", { unique: true });

      db.createObjectStore("categories", { keyPath: "name" });
      db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
      break;

    case 2:
      // Version 2 schema changes
      // Example: Add new index to products
      const products = transaction.objectStore("products");
      if (!products.indexNames.contains("by-category")) {
        products.createIndex("by-category", "category");
      }
      break;

    case 3:
      // Version 3 schema changes
      // Example: Add new object store
      if (!db.objectStoreNames.contains("auditLog")) {
        db.createObjectStore("auditLog", { keyPath: "id", autoIncrement: true });
      }
      break;

    case 4:
      // Version 4 schema changes
      // Example: Modify existing store
      const stockItems = transaction.objectStore("stockItems");
      if (!stockItems.indexNames.contains("by-vendor")) {
        stockItems.createIndex("by-vendor", "vendor");
      }
      break;

    // Add more cases for future versions
    default:
      console.warn(`Unknown database version: ${version}`);
  }
}

// Helper function to get current database version
async function getCurrentDBVersion(): Promise<number> {
  try {
    const databases = await indexedDB.databases();
    const dbInfo = databases.find(db => db.name === "inventory-db");
    return dbInfo ? dbInfo.version : 1;
  } catch (error) {
    console.error("Error getting current DB version:", error);
    return 1;
  }
}

// CRUD Operations (simplified examples - include all your existing operations)

export async function saveProduct(product: Product): Promise<string> {
  const db = await getDB();
  
  // Set modified timestamp and sync status
  const now = Date.now();
  product.modified = now;
  product.syncStatus = "pending";

  await db.put("products", product);
  
  // Add to sync queue
  await db.put("syncQueue", {
    id: `product-${product.id}-${now}`,
    operation: product.id ? "update" : "create",
    data: product,
    type: "product",
    timestamp: now,
  });

  return product.id;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await getDB();
  return db.get("products", id);
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll("products");
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("products", id);
  
  // Add to sync queue
  await db.put("syncQueue", {
    id: `product-delete-${id}-${Date.now()}`,
    operation: "delete",
    type: "product",
    timestamp: Date.now(),
  });
}

// Similar CRUD operations for other entities (suppliers, stockItems, users, etc.)
// Include all your existing operations here...

// Sync Operations
export async function getPendingSyncItems() {
  const db = await getDB();
  return db.getAll("syncQueue");
}

export async function markAsSynced(id: string, type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user") {
  const db = await getDB();
  
  // Update the entity's sync status
  await db.put(type + "s", {
    ...(await db.get(type + "s", id)),
    syncStatus: "synced"
  });
  
  // Remove from sync queue
  await db.delete("syncQueue", id);
}

// Initialize database on module load
(async () => {
  try {
    await getDB();
    console.log("IndexedDB initialized successfully");
  } catch (error) {
    console.error("Error initializing IndexedDB:", error);
  }
})();
