import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface ProductDBSchema extends DBSchema {
  products: {
    key: string
    value: Product
    indexes: {
      "by-modified": number
      "by-sync-status": string
    }
  }
  suppliers: {
    key: string
    value: Supplier
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-status": string
    }
  }
  stockItems: {
    key: string
    value: StockItem
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-category": string
      "by-location": string
      "by-status": string
      "by-type": string
    }
  }
  stockTransactions: {
    key: string
    value: StockTransaction
    indexes: {
      "by-stockItemId": string
      "by-type": string
      "by-modified": number
      "by-sync-status": string
      "by-createdAt": string
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      operation: "create" | "update" | "delete"
      data?: Product | Supplier | StockItem | StockTransaction | User
      type: "product" | "supplier" | "stockItem" | "stockTransaction" | "user"
      timestamp: number
    }
  }
  users: {
    key: string
    value: User
    indexes: {
      "by-modified": number
      "by-sync-status": string
      "by-role": string
      "by-status": string
      "by-email": string
    }
  }
  categories: {
    key: string
    value: {
      name: string
      createdAt: string
    }
  }
  transactions: {
    key: string
    value: any
  }
}

// Update the Product interface to include weight
export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  price: number
  quantity: number
  category?: string
  vendor?: string
  weight?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

// Supplier interface
export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  products: string
  status: "Active" | "Inactive" | "On Hold"
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

// Stock item interface
export interface StockItem {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  location: string
  status: "In Stock" | "Low Stock" | "Out of Stock"
  lastUpdated: string
  type: "Finished Good" | "Raw Material"
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

// Stock transaction interface
export interface StockTransaction {
  id: string
  stockItemId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  previousQuantity: number
  newQuantity: number
  location: string
  reference?: string
  reason?: string
  notes?: string
  createdAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

// User interface
export interface User {
  id: string
  email: string
  password: string
  fullName: string
  department?: string
  status: "ACTIVE" | "INACTIVE"
  role: "admin" | "warehouse_manager" | "sales_person"
  createdAt: string
  updatedAt: string
  syncStatus?: "pending" | "synced" | "error"
  modified?: number
}

let dbPromise: Promise<IDBPDatabase<ProductDBSchema>> | null = null

// Change the database version from 1 to 2 to trigger the upgrade

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ProductDBSchema>("inventory-db", 3, { // Increment version to 3
      upgrade(db, oldVersion, newVersion) {
        // Products store
        if (!db.objectStoreNames.contains("products")) {
          const productStore = db.createObjectStore("products", { keyPath: "id" })
          productStore.createIndex("by-modified", "modified")
          productStore.createIndex("by-sync-status", "syncStatus")
        }

        // Suppliers store
        if (!db.objectStoreNames.contains("suppliers")) {
          const supplierStore = db.createObjectStore("suppliers", { keyPath: "id" })
          supplierStore.createIndex("by-modified", "modified")
          supplierStore.createIndex("by-sync-status", "syncStatus")
          supplierStore.createIndex("by-status", "status")
        }

        // Stock items store
        if (!db.objectStoreNames.contains("stockItems")) {
          const stockItemStore = db.createObjectStore("stockItems", { keyPath: "id" })
          stockItemStore.createIndex("by-modified", "modified")
          stockItemStore.createIndex("by-sync-status", "syncStatus")
          stockItemStore.createIndex("by-category", "category")
          stockItemStore.createIndex("by-location", "location")
          stockItemStore.createIndex("by-status", "status")
          stockItemStore.createIndex("by-type", "type")
        }

        // Stock transactions store
        if (!db.objectStoreNames.contains("stockTransactions")) {
          const stockTransactionStore = db.createObjectStore("stockTransactions", { keyPath: "id" })
          stockTransactionStore.createIndex("by-stockItemId", "stockItemId")
          stockTransactionStore.createIndex("by-type", "type")
          stockTransactionStore.createIndex("by-modified", "modified")
          stockTransactionStore.createIndex("by-sync-status", "syncStatus")
          stockTransactionStore.createIndex("by-createdAt", "createdAt")
        }

        // Sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id" })
        }

        // Users store
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" })
          userStore.createIndex("by-modified", "modified")
          userStore.createIndex("by-sync-status", "syncStatus")
          userStore.createIndex("by-role", "role")
          userStore.createIndex("by-status", "status")
          userStore.createIndex("by-email", "email", { unique: true })
        }

        // Categories store
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "name" })
        }

        // Transactions store
        if (!db.objectStoreNames.contains("transactions")) {
          db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true })
        }
      },
    })
  }
  return dbPromise
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB()

  // Delete from IndexedDB
  await db.delete("products", id)

  // Add to sync queue
  await db.put("syncQueue", {
    id,
    operation: "delete",
    type: "product",
    timestamp: Date.now(),
  })
}

// Supplier CRUD operations
export async function getSuppliers(filter?: { search?: string; status?: string }): Promise<Supplier[]> {
  const db = await getDB()
  const suppliers = await db.getAll("suppliers")

  if (!filter) return suppliers

  return suppliers.filter((supplier) => {
    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm) ||
        supplier.email.toLowerCase().includes(searchTerm) ||
        supplier.phone.toLowerCase().includes(searchTerm) ||
        supplier.products.toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
    }

    // Filter by status
    if (filter.status && filter.status !== "All") {
      if (supplier.status !== filter.status) return false
    }

    return true
  })
}

export async function getSupplier(id: string): Promise<Supplier | undefined> {
  const db = await getDB()
  return db.get("suppliers", id)
}

export async function saveSupplier(supplier: Supplier): Promise<string> {
  const db = await getDB()

  // Set modified timestamp and sync status
  const now = Date.now()
  supplier.modified = now
  supplier.syncStatus = "pending"

  // Save to IndexedDB
  await db.put("suppliers", supplier)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `supplier-${supplier.id}-${now}`,
    operation: supplier.id ? "update" : "create",
    data: supplier,
    type: "supplier",
    timestamp: now,
  })

  return supplier.id
}

export async function deleteSupplier(id: string): Promise<void> {
  const db = await getDB()

  // Delete from IndexedDB
  await db.delete("suppliers", id)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `supplier-${id}-${Date.now()}`,
    operation: "delete",
    type: "supplier",
    timestamp: Date.now(),
  })
}

// Add getSupplierStats function to lib/db.ts
export async function getSupplierStats() {
  try {
    const suppliers = await getSuppliers()

    // Calculate stats
    const total = suppliers.length
    const active = suppliers.filter((s) => s.status === "Active").length
    const onHold = suppliers.filter((s) => s.status === "On Hold").length
    const inactive = suppliers.filter((s) => s.status === "Inactive").length

    // Calculate new this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = suppliers.filter((s) => {
      const createdAt = new Date(s.createdAt)
      return createdAt >= firstDayOfMonth
    }).length

    return {
      total,
      active,
      onHold,
      inactive,
      newThisMonth,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    }
  } catch (error) {
    console.error("Error calculating supplier stats:", error)
    return {
      total: 0,
      active: 0,
      onHold: 0,
      inactive: 0,
      newThisMonth: 0,
      activePercentage: 0,
    }
  }
}

// Update the getSuppliers function to return an array of supplier names for the product form
// Add this function to lib/db.ts:

export async function getSupplierNames(): Promise<string[]> {
  try {
    const suppliers = await getSuppliers()
    // Extract unique supplier names
    const supplierNames = suppliers.map((supplier) => supplier.name)
    return [...new Set(supplierNames)] // Remove duplicates
  } catch (error) {
    console.error("Error getting supplier names:", error)
    return []
  }
}

// Stock CRUD operations
export async function getStockItems(filter?: {
  search?: string
  categories?: string[]
  locations?: string[]
  types?: string[]
  statuses?: string[]
  dateRange?: { from: string; to: string }
}): Promise<StockItem[]> {
  const db = await getDB()
  const stockItems = await db.getAll("stockItems")

  if (!filter) return stockItems

  return stockItems.filter((item) => {
    // Filter by search term
    if (filter.search) {
      const term = filter.search.toLowerCase()
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)

      if (!matchesSearch) return false
    }

    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(item.category)) return false
    }

    // Filter by locations
    if (filter.locations && filter.locations.length > 0) {
      if (!filter.locations.includes(item.location)) return false
    }

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      if (!filter.types.includes(item.type)) return false
    }

    // Filter by statuses
    if (filter.statuses && filter.statuses.length > 0) {
      if (!filter.statuses.includes(item.status)) return false
    }

    // Filter by date range
    if (filter.dateRange && filter.dateRange.from && filter.dateRange.to) {
      const itemDate = new Date(item.lastUpdated)
      const fromDate = new Date(filter.dateRange.from)
      const toDate = new Date(filter.dateRange.to)

      if (itemDate < fromDate || itemDate > toDate) return false
    }

    return true
  })
}

export async function getStockItem(id: string): Promise<StockItem | undefined> {
  const db = await getDB()
  return db.get("stockItems", id)
}

export async function saveStockItem(stockItem: StockItem): Promise<string> {
  const db = await getDB()

  // Set modified timestamp and sync status
  const now = Date.now()
  stockItem.modified = now
  stockItem.syncStatus = "pending"

  // Save to IndexedDB
  await db.put("stockItems", stockItem)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `stockItem-${stockItem.id}-${now}`,
    operation: stockItem.id ? "update" : "create",
    data: stockItem,
    type: "stockItem",
    timestamp: now,
  })

  return stockItem.id
}

export async function deleteStockItem(id: string): Promise<void> {
  const db = await getDB()

  // Delete from IndexedDB
  await db.delete("stockItems", id)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `stockItem-${id}-${Date.now()}`,
    operation: "delete",
    type: "stockItem",
    timestamp: Date.now(),
  })
}

export async function recordStockTransaction(transaction: StockTransaction): Promise<string> {
  const db = await getDB()

  // Set modified timestamp and sync status
  const now = Date.now()
  transaction.modified = now
  transaction.syncStatus = "pending"

  // Save transaction to IndexedDB
  await db.put("stockTransactions", transaction)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `stockTransaction-${transaction.id}-${now}`,
    operation: "create",
    data: transaction,
    type: "stockTransaction",
    timestamp: now,
  })

  // Update stock item quantity
  const stockItem = await db.get("stockItems", transaction.stockItemId)
  if (stockItem) {
    stockItem.quantity = transaction.newQuantity
    stockItem.lastUpdated = transaction.createdAt

    // Update status based on quantity
    if (stockItem.quantity === 0) {
      stockItem.status = "Out of Stock"
    } else if (stockItem.quantity <= 10) {
      stockItem.status = "Low Stock"
    } else {
      stockItem.status = "In Stock"
    }

    await saveStockItem(stockItem)
  }

  return transaction.id
}

export async function getStockTransactions(stockItemId?: string): Promise<StockTransaction[]> {
  const db = await getDB()

  if (stockItemId) {
    const index = db.transaction("stockTransactions").store.index("by-stockItemId")
    return index.getAll(stockItemId)
  }

  return db.getAll("stockTransactions")
}

export async function getStockStats() {
  const db = await getDB()
  const stockItems = await db.getAll("stockItems")

  const totalItems = stockItems.length
  const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = stockItems.filter((item) => item.status === "Low Stock").length
  const outOfStockItems = stockItems.filter((item) => item.status === "Out of Stock").length

  // Get unique categories and locations
  const categories = Array.from(new Set(stockItems.map((item) => item.category)))
  const locations = Array.from(new Set(stockItems.map((item) => item.location)))
  const types = Array.from(new Set(stockItems.map((item) => item.type)))

  return {
    totalItems,
    totalUnits,
    lowStockItems,
    outOfStockItems,
    categories,
    locations,
    types,
  }
}

// Sync operations
export async function getPendingSyncItems() {
  const db = await getDB()
  return db.getAll("syncQueue")
}

export async function markAsSynced(id: string) {
  const db = await getDB()

  // Update product sync status
  const product = await db.get("products", id)
  if (product) {
    product.syncStatus = "synced"
    await db.put("products", product)
  }

  // Remove from sync queue
  await db.delete("syncQueue", id)
}

export async function markSyncError(id: string) {
  const db = await getDB()

  // Update product sync status
  const product = await db.get("products", id)
  if (product) {
    product.syncStatus = "error"
    await db.put("products", product)
  }
}

// Storage quota monitoring
export async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    const percentUsed = (estimate.usage! / estimate.quota!) * 100
    const remaining = estimate.quota! - estimate.usage!

    return {
      total: formatBytes(estimate.quota!),
      used: formatBytes(estimate.usage!),
      percentUsed: Math.round(percentUsed),
      remaining: formatBytes(remaining),
    }
  }

  return null
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
export async function getProducts(): Promise<Product[]> {
  const db = await getDB()
  return db.getAll("products")
}
export async function saveProduct(product: Product): Promise<string> {
  const db = await getDB()

  // Set modified timestamp and sync status
  const now = Date.now()
  product.modified = now
  product.syncStatus = "pending"

  // Save to IndexedDB
  await db.put("products", product)

  // Add to sync queue
  await db.put("syncQueue", {
    id: product.id,
    operation: product.id ? "update" : "create",
    data: product,
    type: "product",
    timestamp: now,
  })

  return product.id
}
// Add getProductStats function to lib/db.ts
export async function getProductStats() {
  try {
    const products = await getProducts()

    // Calculate stats
    const total = products.length
    const inStock = products.filter((p) => p.quantity > 10).length
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length
    const outOfStock = products.filter((p) => p.quantity === 0).length

    // Get unique categories and vendors
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]
    const vendors = Array.from(new Set(products.map((p) => p.vendor).filter(Boolean))) as string[]

    // Sort categories by number of products
    const categoryCounts = categories
      .map((category) => {
        const count = products.filter((p) => p.category === category).length
        return { category, count }
      })
      .sort((a, b) => b.count - a.count)

    const sortedCategories = categoryCounts.map((item) => item.category)

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
      categories: sortedCategories,
      vendors,
    }
  } catch (error) {
    console.error("Error calculating product stats:", error)
    return {
      total: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      categories: [],
      vendors: [],
    }
  }
}

// User CRUD operations
export async function getUsers(filter?: { search?: string; role?: string; status?: string }): Promise<User[]> {
  const db = await getDB()
  const users = await db.getAll("users")

  if (!filter) return users

  return users.filter((user) => {
    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.department?.toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
    }

    // Filter by role
    if (filter.role && filter.role !== "All") {
      if (user.role !== filter.role) return false
    }

    // Filter by status
    if (filter.status && filter.status !== "All") {
      if (user.status !== filter.status) return false
    }

    return true
  })
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = await getDB()
  return db.get("users", id)
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDB()
  const index = db.transaction("users").store.index("by-email")
  return index.get(email)
}

export async function saveUser(user: User): Promise<string> {
  const db = await getDB()

  // Check if email already exists (for new users)
  if (!user.id) {
    const existingUser = await getUserByEmail(user.email)
    if (existingUser) {
      throw new Error("Email already exists")
    }
  }

  // Set modified timestamp and sync status
  const now = Date.now()
  user.modified = now
  user.syncStatus = "pending"

  // Save to IndexedDB
  await db.put("users", user)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `user-${user.id}-${now}`,
    operation: user.id ? "update" : "create",
    data: user,
    type: "user",
    timestamp: now,
  })

  return user.id
}

export async function deleteUser(id: string): Promise<void> {
  const db = await getDB()

  // Delete from IndexedDB
  await db.delete("users", id)

  // Add to sync queue
  await db.put("syncQueue", {
    id: `user-${id}-${Date.now()}`,
    operation: "delete",
    type: "user",
    timestamp: Date.now(),
  })
}

// Add getUserStats function
export async function getUserStats() {
  try {
    const users = await getUsers()

    // Calculate stats
    const total = users.length
    const active = users.filter((u) => u.status === "ACTIVE").length
    const inactive = users.filter((u) => u.status === "INACTIVE").length
    const admins = users.filter((u) => u.role === "admin").length
    const warehouseManagers = users.filter((u) => u.role === "warehouse_manager").length
    const salesPersons = users.filter((u) => u.role === "sales_person").length

    // Get unique departments
    const departments = Array.from(new Set(users.filter((u) => u.department).map((u) => u.department))) as string[]

    return {
      total,
      active,
      inactive,
      admins,
      warehouseManagers,
      salesPersons,
      departments,
    }
  } catch (error) {
    console.error("Error calculating user stats:", error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      admins: 0,
      warehouseManagers: 0,
      salesPersons: 0,
      departments: [],
    }
  }
}
export async function getProduct(productId: string): Promise<Product | undefined> {
  const db = await getDB();
  return db.get("products", productId); // Use the `get` method directly
}

// Add these functions to the existing db.ts file

export async function getCategories(): Promise<string[]> {
  try {
    // Get categories from IndexedDB
    const db = await getDB()
    const categories = await db.getAll("categories")

    // If no categories exist yet, return default ones
    if (!categories || categories.length === 0) {
      const defaultCategories = ["Electronics", "Clothing", "Food", "Furniture", "Office Supplies"]

      // Save default categories
      for (const category of defaultCategories) {
        // await db.add('categories', { name: category, createdAt: new Date().toISOString() })
        await db.put("categories", { name: category, createdAt: new Date().toISOString() })
      }

      return defaultCategories.map((cat) => cat.name)
    }

    return categories.map((cat) => cat.name)
  } catch (error) {
    console.error("Error getting categories:", error)
    return []
  }
}

export async function saveCategory(name: string): Promise<void> {
  try {
    const db = await getDB()

    // Check if category already exists
    const existingCategories = await getCategories()
    if (existingCategories.includes(name)) {
      return // Category already exists
    }

    // Add new category
    await db.put("categories", {
      name,
      createdAt: new Date().toISOString(),
    })

    // Queue for sync
    await queueForSync("categories", { name })
  } catch (error) {
    console.error("Error saving category:", error)
    throw error
  }
}
export async function saveTransaction(transaction: any): Promise<void> {
  try {
    const db = await getDB()
    // await db.add('transactions', transaction)
    await db.put("transactions", transaction)

    // Queue for sync
    await queueForSync("transactions", transaction)
  } catch (error) {
    console.error("Error saving transaction:", error)
    throw error
  }
}

export async function getUserInfo(): Promise<{ name: string; role: string }> {
  // This would normally come from an authentication system
  // For now, return mock data
  return {
    name: "Sales Representative",
    role: "salesman",
  }
}

export async function getSalesStats(): Promise<any> {
  // This would normally come from the database
  // For now, return mock data
  return {
    dailySales: 1250.75,
    weeklySales: 8750.5,
    monthlySales: 32450.25,
    totalCustomers: 48,
    totalProducts: 156,
    salesGrowth: 12.5,
    topProducts: [
      { name: "Product A", sales: 1200 },
      { name: "Product B", sales: 950 },
      { name: "Product C", sales: 750 },
    ],
    salesByDay: [
      { name: "Mon", value: 1200 },
      { name: "Tue", value: 1500 },
      { name: "Wed", value: 1100 },
      { name: "Thu", value: 1400 },
      { name: "Fri", value: 1800 },
      { name: "Sat", value: 1600 },
      { name: "Sun", value: 1200 },
    ],
    salesByCategory: [
      { name: "Electronics", value: 12500 },
      { name: "Clothing", value: 8500 },
      { name: "Food", value: 6500 },
      { name: "Furniture", value: 4500 },
      { name: "Office Supplies", value: 3500 },
    ],
  }
}

async function queueForSync(type: string, data: any) {
  const db = await getDB()
  const now = Date.now()
  const id = `${type}-${now}`

  await db.put("syncQueue", {
    id,
    operation: "create",
    data,
    type,
    timestamp: now,
  })
}

