"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { deleteSupplier } from "@/lib/supplier-service"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import type { Supplier } from "@/types"

interface SuppliersTableProps {
  suppliers: Supplier[]
  isLoading: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplierId: string) => void
}

export function SuppliersTable({ suppliers, isLoading, onEdit, onDelete }: SuppliersTableProps) {
  const isOnline = useNetworkStatus()
  const [isDeleting, setIsDeleting] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)

  const handleDeleteClick = (supplierId: string) => {
    setSupplierToDelete(supplierId)
    setAlertOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return

    setIsDeleting(true)
    try {
      await deleteSupplier(supplierToDelete)
      onDelete(supplierToDelete)

      toast({
        title: "Supplier Deleted",
        description: isOnline
          ? "Supplier has been deleted and will be synced with the server."
          : "Supplier has been deleted locally and will be synced when you're back online.",
      })
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setAlertOpen(false)
      setSupplierToDelete(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "success"
      case "Inactive":
        return "destructive"
      case "On Hold":
        return "warning"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No suppliers found. Add your first supplier to get started.
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
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
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell className="max-w-[200px] truncate">{supplier.products}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(supplier.status) as any}>{supplier.status}</Badge>
                  {supplier.syncStatus === "pending" && (
                    <Badge variant="outline" className="ml-2">
                      Pending Sync
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(supplier)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(supplier.id)}
                      >
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

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier
              {!isOnline && " when you're back online"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

