import { v4 as uuidv4 } from "uuid"
import { getDB, addToSyncQueue } from "./db-utils"

// Get all categories
export async function getCategories(filter) {
  try {
    const db = await getDB()
    let categories = await db.getAll("categories")

    // Filter out deleted categories
    categories = categories.filter((category) => !category.deleted)

    // Apply filters if provided
    if (filter && filter.search) {
      const searchTerm = filter.search.toLowerCase()
      categories = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm) ||
          (category.description && category.description.toLowerCase().includes(searchTerm)),
      )
    }

    return categories
  } catch (error) {
    console.error("Error getting categories:", error)
    return []
  }
}

// Get category by ID
export async function getCategory(id) {
  try {
    const db = await getDB()
    const category = await db.get("categories", id)
    return category && !category.deleted ? category : null
  } catch (error) {
    console.error(`Error getting category ${id}:`, error)
    return null
  }
}

// Save category
export async function saveCategory(category) {
  try {
    const db = await getDB()

    // Ensure category has an ID
    if (!category.id) {
      category.id = uuidv4()
      category.createdAt = new Date().toISOString()
    }

    // Set modified timestamp and sync status
    const now = Date.now()
    category.modified = now
    category.syncStatus = "pending"
    category.updatedAt = new Date().toISOString()

    // Save to IndexedDB
    await db.put("categories", category)

    // Add to sync queue
    await addToSyncQueue({
      id: `category-${category.id}-${now}`,
      operation: category.id ? "update" : "create",
      data: category,
      type: "category",
      timestamp: now,
    })

    return category.id
  } catch (error) {
    console.error("Error saving category:", error)
    throw error
  }
}

// Delete category
export async function deleteCategory(id) {
  try {
    const db = await getDB()

    // Get the category first
    const category = await db.get("categories", id)

    if (category) {
      // Mark as deleted instead of actually deleting
      category.deleted = true
      category.syncStatus = "pending"
      category.modified = Date.now()

      // Update in IndexedDB
      await db.put("categories", category)

      // Add to sync queue
      await addToSyncQueue({
        id: `category-${id}-${Date.now()}`,
        operation: "delete",
        data: { id },
        type: "category",
        timestamp: Date.now(),
      })
    }
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error)
    throw error
  }
}

// Get category names for product form
export async function getCategoryNames() {
  try {
    const categories = await getCategories()
    return categories.map((category) => category.name)
  } catch (error) {
    console.error("Error getting category names:", error)
    return []
  }
}

// Create category if it doesn't exist
export async function createCategoryIfNotExists(name) {
  try {
    if (!name) return ""

    const categories = await getCategories()
    const existingCategory = categories.find((c) => c.name.toLowerCase() === name.toLowerCase())

    if (existingCategory) {
      return existingCategory.id
    }

    // Create new category
    const newCategory = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
    }

    await saveCategory(newCategory)
    return newCategory.id
  } catch (error) {
    console.error("Error creating category:", error)
    return ""
  }
}

