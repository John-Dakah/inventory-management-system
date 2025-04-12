export type SyncStatus = "synced" | "pending" | "error" | "new"

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

