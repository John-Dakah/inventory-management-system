export type SyncStatus = "synced" | "pending" | "error" | "new"
// types.ts

export interface Product {
  id: string
  name: string
  sku: string
  category?: string
  quantity: number
  location: string
  status: string
  type: string
  updatedAt: string
  createdAt: string
}

export interface StockItem {
  id: string
  name: string
  sku: string
  category: string
  location: string
  status: string
  type: string
  createdAt: string
}

export interface StockTransaction {
  id: string
  stockItemId: string
  type: "RECEIVE" | "ISSUE"
  quantity: number
  previousQuantity: number
  newQuantity: number
  location: string
  reference?: string
  reason?: string
  notes?: string
  createdAt: Date
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  products: string
  status: string
  createdAt: string
  updatedAt: string
  syncStatus?: SyncStatus
  deleted?: boolean
  notes?: string
  address?: string
}



export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  price: number
  quantity: number
  category?: string
  vendor?: string
  imageUrl: string
  createdAt: string
  updatedAt: string
  syncStatus?: "synced" | "pending"
  modified?: number
  deleted?: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  syncStatus?: "synced" | "pending"
  modified?: number
  deleted?: boolean
}

