"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type React from "react"

import { useState, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { MoreHorizontal, Trash, Edit, AlertCircle, CloudOff, RefreshCw, Download, Upload, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { deleteProduct } from "@/lib/db"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import type { Product } from "@/lib/db"

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onProductSaved: (product: Product) => void
}

export function ProductsTable({ products, isLoading, onEdit, onDelete, onProductSaved }: ProductsTableProps) {
  const isOnline = useNetworkStatus()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete product
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setIsDeleting(id)
      try {
        await deleteProduct(id)

        // Call parent's onDelete to update UI
        onDelete(id)

        toast({
          title: "Product Deleted",
          description: isOnline
            ? "Product has been deleted and will be synced with the server."
            : "Product has been marked for deletion and will be synced when you're back online.",
        })
      } catch (error) {
        console.error("Error deleting product:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete product. Please try again.",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  // Export products to CSV
  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Name", "SKU", "Price", "Quantity", "Category", "Vendor", "Description"]
      const csvContent = [
        headers.join(","),
        ...products.map((product) =>
          [
            `"${product.name.replace(/"/g, '""')}"`,
            `"${product.sku.replace(/"/g, '""')}"`,
            product.price,
            product.quantity,
            `"${(product.category || "").replace(/"/g, '""')}"`,
            `"${(product.vendor || "").replace(/"/g, '""')}"`,
            `"${product.description || ""}".replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `inventory-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Exported ${products.length} products to CSV.`,
      })
    } catch (error) {
      console.error("Error exporting products:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export products. Please try again.",
      })
    }
  }

  // Export products to JSON
  const exportToJSON = () => {
    try {
      // Create JSON content
      const jsonContent = JSON.stringify(products, null, 2)

      // Create download link
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `inventory-export-${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Exported ${products.length} products to JSON.`,
      })
    } catch (error) {
      console.error("Error exporting products:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export products. Please try again.",
      })
    }
  }

  // Import products from file
  const importProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()

      reader.onload = async (e) => {
        const content = e.target?.result as string
        let importedProducts: Product[] = []

        // Parse file content based on file type
        if (file.name.endsWith(".json")) {
          // Parse JSON
          importedProducts = JSON.parse(content)
        } else if (file.name.endsWith(".csv")) {
          // Parse CSV
          const lines = content.split("\n")
          const headers = lines[0].split(",")

          // Find column indexes
          const nameIndex = headers.findIndex((h) => h.toLowerCase().includes("name"))
          const skuIndex = headers.findIndex((h) => h.toLowerCase().includes("sku"))
          const priceIndex = headers.findIndex((h) => h.toLowerCase().includes("price"))
          const quantityIndex = headers.findIndex((h) => h.toLowerCase().includes("quantity"))
          const categoryIndex = headers.findIndex((h) => h.toLowerCase().includes("category"))
          const vendorIndex = headers.findIndex((h) => h.toLowerCase().includes("vendor"))
          const descriptionIndex = headers.findIndex((h) => h.toLowerCase().includes("description"))

          if (nameIndex === -1 || skuIndex === -1) {
            throw new Error("CSV file must contain at least Name and SKU columns")
          }

          // Parse data rows
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue

            const values = lines[i].split(",")
            const now = new Date().toISOString()

            importedProducts.push({
              id: `imported-${Date.now()}-${i}`,
              name: values[nameIndex].replace(/^"|"$/g, "").replace(/""/g, '"'),
              sku: values[skuIndex].replace(/^"|"$/g, "").replace(/""/g, '"'),
              price: priceIndex !== -1 ? Number.parseFloat(values[priceIndex]) : 0,
              quantity: quantityIndex !== -1 ? Number.parseInt(values[quantityIndex]) : 0,
              category: categoryIndex !== -1 ? values[categoryIndex].replace(/^"|"$/g, "").replace(/""/g, '"') : "",
              vendor: vendorIndex !== -1 ? values[vendorIndex].replace(/^"|"$/g, "").replace(/""/g, '"') : "",
              description:
                descriptionIndex !== -1 ? values[descriptionIndex].replace(/^"|"$/g, "").replace(/""/g, '"') : "",
              createdAt: now,
              updatedAt: now,
              syncStatus: "pending",
            })
          }
        } else {
          throw new Error("Unsupported file format. Please use CSV or JSON.")
        }

        // Validate imported products
        if (!Array.isArray(importedProducts) || importedProducts.length === 0) {
          throw new Error("No valid products found in the file")
        }

        // Save imported products and update UI
        for (const product of importedProducts) {
          onProductSaved(product)
        }

        toast({
          title: "Import Successful",
          description: `Imported ${importedProducts.length} products.`,
        })
      }

      reader.onerror = () => {
        throw new Error("Failed to read file")
      }

      reader.readAsText(file)
    } catch (error: any) {
      console.error("Error importing products:", error)
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "Failed to import products. Please try again.",
      })
    } finally {
      // Reset file input
      event.target.value = ""
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-12 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Import file input (hidden)
  const ImportFileInput = () => (
    <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.json" onChange={importProducts} />
  )

  // Export/Import dropdown
  const ExportImportDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <FileText className="mr-2 h-4 w-4" />
          Export/Import
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Import Products
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Render empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <ExportImportDropdown />
          <ImportFileInput />
        </div>
        <div className="rounded-md border border-dashed p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add your first product to get started.</p>
        </div>
      </div>
    )
  }

  // Render products table
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ExportImportDropdown />
        <ImportFileInput />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {product.name}
                    {product.syncStatus === "pending" && (
                      <Badge variant="outline" className="ml-2 gap-1">
                        {isOnline ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CloudOff className="h-3 w-3" />}
                        <span className="text-xs">{isOnline ? "Syncing..." : "Offline"}</span>
                      </Badge>
                    )}
                    {product.syncStatus === "error" && (
                      <Badge variant="destructive" className="ml-2 gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">Sync Error</span>
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.quantity}
                    {product.quantity === 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        Out of stock
                      </Badge>
                    ) : product.quantity < 10 ? (
                      <Badge variant="outline" className="text-xs">
                        Low stock
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{product.weight || "-"}</TableCell>
                <TableCell>{product.category || "-"}</TableCell>
                <TableCell>{product.vendor || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {isDeleting === product.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

