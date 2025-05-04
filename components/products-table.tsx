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
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Product = {
  id: string
  name: string
  description: string
  sku: string
  price: number
  quantity: number
  category: string | null
  vendor: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductsTable({ products, isLoading, onEdit, onDelete }: ProductsTableProps) {
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
  }

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      onDelete(productToDelete)
      setProductToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setProductToDelete(null)
  }

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (quantity <= 10) {
      return (
        <Badge variant="warning" className="bg-amber-500 hover:bg-amber-600">
          Low Stock
        </Badge>
      )
    } else {
      return (
        <Badge variant="success" className="bg-green-500 hover:bg-green-600">
          In Stock
        </Badge>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground">Add a new product or adjust your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{getStockStatus(product.quantity)}</TableCell>
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
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(product.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and remove it from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
