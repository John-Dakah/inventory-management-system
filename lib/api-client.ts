/**
 * Client-side API utilities for interacting with the backend API
 * This provides type-safe wrappers around fetch for each API endpoint
 */

type ApiResponse<T> = {
  data: T
  error?: never
  status: number
}

type ApiError = {
  data?: never
  error: {
    message: string
    details?: any
  }
  status: number
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// Generic fetch function with error handling
async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    // Parse response data
    const data = await response.json().catch(() => null)

    // Handle success
    if (response.ok) {
      return {
        data: data as T,
        status: response.status,
      }
    }

    // Handle errors
    return {
      error: {
        message: data?.error || data?.message || "An unknown error occurred",
        details: data?.details || undefined,
      },
      status: response.status,
    }
  } catch (err) {
    // Handle network errors
    return {
      error: {
        message: "Network error. Please check your connection.",
        details: err instanceof Error ? err.message : String(err),
      },
      status: 0, // 0 indicates network error
    }
  }
}

// API Client for Stock Items
export const StockApi = {
  // Get all stock items with optional filtering
  async getItems(params?: {
    search?: string
    category?: string
    location?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()

    if (params?.search) searchParams.append("search", params.search)
    if (params?.category) searchParams.append("category", params.category)
    if (params?.location) searchParams.append("location", params.location)
    if (params?.status) searchParams.append("status", params.status)
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    const queryString = searchParams.toString()
    const url = `/api/stock${queryString ? `?${queryString}` : ""}`

    return apiFetch(url)
  },

  // Get a stock item by ID
  async getItem(id: string) {
    return apiFetch(`/api/stock/${id}`)
  },

  // Create a new stock item
  async createItem(item: any) {
    return apiFetch("/api/stock", {
      method: "POST",
      body: JSON.stringify(item),
    })
  },

  // Update a stock item
  async updateItem(id: string, item: any) {
    return apiFetch(`/api/stock/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    })
  },

  // Delete a stock item
  async deleteItem(id: string) {
    return apiFetch(`/api/stock/${id}`, {
      method: "DELETE",
    })
  },

  // Get transactions
  async getTransactions(params?: {
    stockItemId?: string
    type?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()

    if (params?.stockItemId) searchParams.append("stockItemId", params.stockItemId)
    if (params?.type) searchParams.append("type", params.type)
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    const queryString = searchParams.toString()
    const url = `/api/stock/transactions${queryString ? `?${queryString}` : ""}`

    return apiFetch(url)
  },

  // Create a new transaction
  async createTransaction(transaction: any) {
    return apiFetch("/api/stock/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    })
  },
}

// API Client for Products
export const ProductApi = {
  // Get all products with optional filtering
  async getProducts(params?: {
    search?: string
    category?: string
    vendor?: string
    inStock?: boolean
    outOfStock?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()

    if (params?.search) searchParams.append("search", params.search)
    if (params?.category) searchParams.append("category", params.category)
    if (params?.vendor) searchParams.append("vendor", params.vendor)
    if (params?.inStock !== undefined) searchParams.append("inStock", params.inStock.toString())
    if (params?.outOfStock !== undefined) searchParams.append("outOfStock", params.outOfStock.toString())
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    const queryString = searchParams.toString()
    const url = `/api/products${queryString ? `?${queryString}` : ""}`

    return apiFetch(url)
  },

  // Get a product by ID
  async getProduct(id: string) {
    return apiFetch(`/api/products/${id}`)
  },

  // Create a new product
  async createProduct(product: any) {
    return apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  },

  // Update a product
  async updateProduct(id: string, product: any) {
    return apiFetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  },

  // Delete a product
  async deleteProduct(id: string) {
    return apiFetch(`/api/products/${id}`, {
      method: "DELETE",
    })
  },
}

// API Client for Stats
export const StatsApi = {
  // Get system statistics
  async getStats() {
    return apiFetch("/api/stats")
  },
}
