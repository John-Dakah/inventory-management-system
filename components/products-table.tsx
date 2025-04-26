"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Trash2, CloudOff, CloudIcon as CloudCheck, CloudIcon as CloudSync } from "lucide-react"
import { deleteProduct } from "@/lib/db"
import type { Product } from "@/lib/db"

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onProductSaved: (product: Product) => void
}

export function ProductsTable({ products, isLoading, onEdit, onDelete, onProductSaved }: ProductsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id)
        onDelete(productToDelete.id)
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Failed to delete product. Please try again.")
      }
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const getSyncStatusBadge = (product: Product) => {
    if (!product.syncStatus || product.syncStatus === "synced") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
          <CloudCheck className="w-3 h-3" />
          Synced
        </Badge>
      )
    } else if (product.syncStatus === "pending") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1">
          <CloudSync className="w-3 h-3" />
          Pending
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
          <CloudOff className="w-3 h-3" />
          Error
        </Badge>
      )
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading products...</div>
  }

  if (products.length === 0) {
    return <div className="text-center py-4">No products found. Add your first product to get started.</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="hidden md:table-cell">Vendor</TableHead>
              <TableHead className="hidden md:table-cell">Sync Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="hidden md:table-cell">{product.category || "-"}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={product.quantity === 0 ? "text-red-500 font-medium" : ""}>{product.quantity}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">{product.vendor || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{getSyncStatusBadge(product)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
