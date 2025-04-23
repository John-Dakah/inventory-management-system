import { openDB, type DBSchema } from "idb"
import { v4 as uuidv4 } from "uuid"

// Define the database schema
interface InventoryDB extends DBSchema {
  products: {
    key: string
    value: Product
    indexes: { "by-category": string }
  }
  categories: {
    key: string
    value: Category
  }
  transactions: {
    key: string
    value: Transaction
    indexes: { "by-date": string }
  }
  customers: {
    key: string
    value: Customer
  }
  settings: {
    key: string
    value: any
  }
}

// Define types
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  category: string
  barcode?: string
  cost?: number
  taxable: boolean
  discountable: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionItem {
  id: string
  productId: string
  name: string
  price: number
  originalPrice: number
  quantity: number
  discount: number
  discountType: string
  subtotal: number
  tax: number
  total: number
}

export interface PaymentDetail {
  method: string
  amount: number
  reference?: string
}

export interface Transaction {
  id: string
  items: TransactionItem[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  payments: PaymentDetail[]
  change: number
  status: "completed" | "voided" | "refunded" | "pending"
  customerId?: string
  customerName?: string
  cashierName: string
  notes?: string
  receiptNumber: string
  createdAt: string
  updatedAt: string
}

// Initialize the database
let dbPromise: Promise<any> | null = null

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<InventoryDB>("inventory-db", 1, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("products")) {
          const productStore = db.createObjectStore("products", { keyPath: "id" })
          productStore.createIndex("by-category", "category")
        }

        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("transactions")) {
          const transactionStore = db.createObjectStore("transactions", { keyPath: "id" })
          transactionStore.createIndex("by-date", "createdAt")
        }

        if (!db.objectStoreNames.contains("customers")) {
          db.createObjectStore("customers", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" })
        }
      },
    })
  }
  return dbPromise
}

// Product functions
export async function getProducts(): Promise<Product[]> {
  const db = await getDB()
  return db.getAll("products")
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getDB()
  return db.get("products", id)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const db = await getDB()
  return db.getAllFromIndex("products", "by-category", category)
}

export async function saveProduct(product: Product): Promise<string> {
  const db = await getDB()
  const now = new Date().toISOString()

  if (!product.id) {
    product.id = uuidv4()
    product.createdAt = now
  }

  product.updatedAt = now
  await db.put("products", product)
  return product.id
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("products", id)
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  const db = await getDB()
  return db.getAll("categories")
}

export async function saveCategory(category: Category): Promise<string> {
  const db = await getDB()
  const now = new Date().toISOString()

  if (!category.id) {
    category.id = uuidv4()
    category.createdAt = now
  }

  category.updatedAt = now
  await db.put("categories", category)
  return category.id
}

// Transaction functions
export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDB()
  return db.getAll("transactions")
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const db = await getDB()
  return db.get("transactions", id)
}

export async function saveTransaction(transaction: Transaction): Promise<string> {
  const db = await getDB()
  const now = new Date().toISOString()

  if (!transaction.id) {
    transaction.id = uuidv4()
    transaction.createdAt = now
  }

  transaction.updatedAt = now

  // Generate receipt number if not provided
  if (!transaction.receiptNumber) {
    transaction.receiptNumber = generateReceiptNumber()
  }

  await db.put("transactions", transaction)
  return transaction.id
}

// Update inventory after transaction
export async function updateInventoryFromTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB()
  const tx = db.transaction("products", "readwrite")

  for (const item of transaction.items) {
    const product = await tx.store.get(item.productId)
    if (product) {
      product.quantity = Math.max(0, product.quantity - item.quantity)
      product.updatedAt = new Date().toISOString()
      await tx.store.put(product)
    }
  }

  await tx.done
}

// Customer functions
export async function getCustomers(): Promise<Customer[]> {
  const db = await getDB()
  return db.getAll("customers")
}

export async function saveCustomer(customer: Customer): Promise<string> {
  const db = await getDB()
  const now = new Date().toISOString()

  if (!customer.id) {
    customer.id = uuidv4()
    customer.createdAt = now
  }

  customer.updatedAt = now
  await db.put("customers", customer)
  return customer.id
}

// Settings functions
export async function getSetting(key: string): Promise<any> {
  const db = await getDB()
  return db.get("settings", key)
}

export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await getDB()
  await db.put("settings", { id: key, value })
}

// Helper functions
function generateReceiptNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")

  return `R${year}${month}${day}-${random}`
}

// Seed initial data if needed
export async function seedInitialData(): Promise<void> {
  const db = await getDB()

  // Check if we already have products
  const productCount = await db.count("products")
  if (productCount > 0) return

  // Add sample categories
  const categories = [
    { id: "cat1", name: "Beverages", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "cat2", name: "Food", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "cat3", name: "Merchandise", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]

  // Add sample products
  const products = [
    {
      id: "p1",
      name: "Coffee",
      description: "Fresh brewed coffee",
      price: 2.5,
      quantity: 100,
      category: "cat1",
      barcode: "123456789",
      cost: 0.75,
      taxable: true,
      discountable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p2",
      name: "Tea",
      description: "Herbal tea",
      price: 2.0,
      quantity: 100,
      category: "cat1",
      barcode: "223456789",
      cost: 0.5,
      taxable: true,
      discountable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p3",
      name: "Sandwich",
      description: "Turkey sandwich",
      price: 5.99,
      quantity: 20,
      category: "cat2",
      barcode: "323456789",
      cost: 2.5,
      taxable: true,
      discountable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p4",
      name: "Muffin",
      description: "Blueberry muffin",
      price: 2.99,
      quantity: 30,
      category: "cat2",
      barcode: "423456789",
      cost: 1.0,
      taxable: true,
      discountable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p5",
      name: "T-Shirt",
      description: "Logo t-shirt",
      price: 15.99,
      quantity: 25,
      category: "cat3",
      barcode: "523456789",
      cost: 8.0,
      taxable: true,
      discountable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Add to database
  const tx = db.transaction(["categories", "products"], "readwrite")

  for (const category of categories) {
    await tx.objectStore("categories").add(category)
  }

  for (const product of products) {
    await tx.objectStore("products").add(product)
  }

  await tx.done
}
