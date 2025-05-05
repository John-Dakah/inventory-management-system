"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Product = {
  id?: string
  name: string
  description: string
  sku: string
  price: number
  quantity: number
  category: string
  vendor: string
  imageUrl: string
}

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductSaved: (product: Product) => void
  editProduct: Product | null
  categories: string[]
  vendors: string[]
}

export function ProductForm({
  open,
  onOpenChange,
  onProductSaved,
  editProduct,
  categories,
  vendors,
}: ProductFormProps) {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    sku: "",
    price: 0,
    quantity: 0,
    category: "",
    vendor: "",
    imageUrl: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editProduct) {
      setProduct(editProduct)
    } else {
      setProduct({
        name: "",
        description: "",
        sku: "",
        price: 0,
        quantity: 0,
        category: "",
        vendor: "",
        imageUrl: "",
      })
    }
    setErrors({})
  }, [editProduct, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setProduct((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!product.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!product.sku.trim()) {
      newErrors.sku = "SKU is required"
    }

    if (isNaN(Number(product.price)) || Number(product.price) < 0) {
      newErrors.price = "Price must be a positive number"
    }

    if (
      isNaN(Number(product.quantity)) ||
      Number(product.quantity) < 0 ||
      !Number.isInteger(Number(product.quantity))
    ) {
      newErrors.quantity = "Quantity must be a positive integer"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const productToSave = {
      ...product,
      price: Number(product.price),
      quantity: Number(product.quantity),
    }

    onProductSaved(productToSave)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {editProduct
              ? "Update the product details below."
              : "Fill in the details below to add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please fix the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={product.sku}
                onChange={handleChange}
                className={errors.sku ? "border-destructive" : ""}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={product.price}
                onChange={handleChange}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            {/* Only show quantity field when editing an existing product */}
            {editProduct && (
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  type="number"
                  id="quantity"
                  min="0"
                  placeholder="0"
                  value={product.quantity}
                  onChange={(e) => setProduct({ ...product, quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={product.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add new category</SelectItem>
                </SelectContent>
              </Select>
              {product.category === "new" && (
                <Input
                  placeholder="Enter new category"
                  className="mt-2"
                  value=""
                  onChange={(e) => handleSelectChange("category", e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={product.vendor} onValueChange={(value) => handleSelectChange("vendor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add new vendor</SelectItem>
                </SelectContent>
              </Select>
              {product.vendor === "new" && (
                <Input
                  placeholder="Enter new vendor"
                  className="mt-2"
                  value=""
                  onChange={(e) => handleSelectChange("vendor", e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={product.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editProduct ? "Update Product" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
