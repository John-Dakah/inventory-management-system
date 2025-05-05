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
import { Edit, MoreHorizontal, Trash2, Mail, Phone } from "lucide-react"
import { deleteSupplier, type Supplier } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"

interface SuppliersTableProps {
  suppliers: Supplier[]
  isLoading: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplierId: string) => void
  onSupplierSaved: (supplier: Supplier) => void
}

export function SuppliersTable({ suppliers, isLoading, onEdit, onDelete, onSupplierSaved }: SuppliersTableProps) {
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)

  const handleDeleteClick = (supplierId: string) => {
    setSupplierToDelete(supplierId)
  }

  const handleDeleteConfirm = async () => {
    if (supplierToDelete) {
      try {
        const success = await deleteSupplier(supplierToDelete)
        if (success) {
          onDelete(supplierToDelete)
          toast({
            title: "Supplier deleted",
            description: "The supplier has been successfully deleted.",
          })
        }
      } catch (error) {
        console.error("Error deleting supplier:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete supplier. Please try again.",
        })
      } finally {
        setSupplierToDelete(null)
      }
    }
  }

  const handleDeleteCancel = () => {
    setSupplierToDelete(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="success" className="bg-green-500 hover:bg-green-600">
            Active
          </Badge>
        )
      case "On Hold":
        return (
          <Badge variant="warning" className="bg-amber-500 hover:bg-amber-600">
            On Hold
          </Badge>
        )
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-medium">No suppliers found</h3>
        <p className="text-muted-foreground">Add a new supplier or adjust your filters.</p>
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
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${supplier.email}`} className="hover:underline">
                        {supplier.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${supplier.phone}`} className="hover:underline">
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={supplier.products}>
                    {supplier.products}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
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
                      <DropdownMenuItem onClick={() => onEdit(supplier)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(supplier.id)}
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

      <AlertDialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier and remove it from our system.
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
