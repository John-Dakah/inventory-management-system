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

