import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Update the ProductFormData type to include weight
export type ProductFormData = {
  name: string
  description?: string
  sku: string
  price: number
  quantity: number
  category?: string
  vendor?: string
  weight?: string
  imageUrl?: string
}

// Update the addProduct function to include weight
export async function addProduct(data: ProductFormData) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || "",
        sku: data.sku,
        price: Number.parseFloat(data.price.toString()),
        quantity: Number.parseInt(data.quantity.toString()),
        category: data.category || "",
        vendor: data.vendor || "",
        weight: data.weight || "",
        imageUrl: data.imageUrl || "",
      },
    })

    revalidatePath("/inventory")
    return { product }
  } catch (error) {
    console.error("Failed to add product:", error)
    return { error: "Failed to add product" }
  }
}

// Update the updateProduct function to include weight
export async function updateProduct(id: string, data: ProductFormData) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || "",
        sku: data.sku,
        price: Number.parseFloat(data.price.toString()),
        quantity: Number.parseInt(data.quantity.toString()),
        category: data.category || "",
        vendor: data.vendor || "",
        weight: data.weight || "",
        imageUrl: data.imageUrl || "",
      },
    })

    revalidatePath("/inventory")
    return { product }
  } catch (error) {
    console.error("Failed to update product:", error)
    return { error: "Failed to update product" }
  }
}

