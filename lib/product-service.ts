import { v4 as uuidv4 } from "uuid"
import { getDatabase } from "./db-utils"
import { createCategoryIfNotExists } from "./category-service"
import {addToSyncQueue} from "@/lib/sync-utils" // adjust the path if needed
// Get all products
export async function getProducts(filter) {
  try {
    const db = await getDatabase()
    let products = await db.getAll("products")

    // Filter out deleted products
    products = products.filter((product) => !product.deleted)

    // Apply filters if provided
    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)),
        )
      }

      if (filter.category) {
        products = products.filter((product) => product.category === filter.category)
      }

      if (filter.vendor) {
        products = products.filter((product) => product.vendor === filter.vendor)
      }

      if (filter.minPrice !== undefined) {
        products = products.filter((product) => product.price >= filter.minPrice)
      }

      if (filter.maxPrice !== undefined) {
        products = products.filter((product) => product.price <= filter.maxPrice)
      }

      if (filter.inStock !== undefined) {
        products = products.filter((product) => (filter.inStock ? product.quantity > 0 : product.quantity === 0))
      }
    }

    return products
  } catch (error) {
    console.error("Error getting products:", error)
    return []
  }
}

// Get product by ID
export async function getProduct(id) {
  try {
    const db = await getDatabase()
    const product = await db.get("products", id)
    return product && !product.deleted ? product : null
  } catch (error) {
    console.error(`Error getting product ${id}:`, error)
    return null
  }
}

// Save product
export async function saveProduct(product) {
  try {
    const db = await getDatabase()

    // Ensure product has an ID
    if (!product.id) {
      product.id = uuidv4()
      product.createdAt = new Date().toISOString()
    }

    // Create category if it doesn't exist
    if (product.category) {
      await createCategoryIfNotExists(product.category)
    }

    // Set modified timestamp and sync status
    const now = Date.now()
    product.modified = now
    product.syncStatus = "pending"
    product.updatedAt = new Date().toISOString()

    // Save to IndexedDB
    await db.put("products", product)

    // Add to sync queue
    await addToSyncQueue({
      id: `product-${product.id}-${now}`,
      operation: product.id ? "update" : "create",
      data: product,
      type: "product",
      timestamp: now,
    })

    return product.id
  } catch (error) {
    console.error("Error saving product:", error)
    throw error
  }
}

// Delete product
export async function deleteProduct(id) {
  try {
    const db = await getDB()

    // Get the product first
    const product = await db.get("products", id)

    if (product) {
      // Mark as deleted instead of actually deleting
      product.deleted = true
      product.syncStatus = "pending"
      product.modified = Date.now()

      // Update in IndexedDB
      await db.put("products", product)

      // Add to sync queue
      await addToSyncQueue({
        id: `product-${id}-${Date.now()}`,
        operation: "delete",
        data: { id },
        type: "product",
        timestamp: Date.now(),
      })
    }
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

// Get unique categories from products
export async function getProductCategories() {
  try {
    const products = await getProducts()
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
  } catch (error) {
    console.error("Error getting product categories:", error)
    return []
  }
}

// Get unique vendors from products
export async function getProductVendors() {
  try {
    const products = await getProducts()
    return [...new Set(products.map((product) => product.vendor).filter(Boolean))]
  } catch (error) {
    console.error("Error getting product vendors:", error)
    return []
  }
}

// Update product quantity
export async function updateProductQuantity(id, change) {
  try {
    const product = await getProduct(id)

    if (!product) {
      return null
    }

    const updatedProduct = {
      ...product,
      quantity: Math.max(0, product.quantity + change),
      updatedAt: new Date().toISOString(),
    }

    await saveProduct(updatedProduct)
    return updatedProduct
  } catch (error) {
    console.error(`Error updating product quantity for ${id}:`, error)
    return null
  }
}

