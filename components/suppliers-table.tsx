"use client"

import { useState } from "react"
import { MoreHorizontal, Trash2, Edit, AlertCircle, RefreshCw, Database } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteSupplier, syncSupplier } from "@/lib/supplier-service"
import { toast } from "@/components/ui/use-toast"
import { SyncStatusIndicator } from "@/components/sync-status-indicator"
import { useNetworkStatus } from "@/hooks/use-network-status"
import type { Supplier } from "@/types"

interface SuppliersTableProps {
  suppliers: Supplier[]
  isLoading: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplierId: string) => void
}

export function SuppliersTable({ suppliers, isLoading, onEdit, onDelete }: SuppliersTableProps) {
  const isOnline = useNetworkStatus()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [syncingIds, setSyncingIds] = useState<string[]>([])

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!supplierToDelete) return

    try {
      await deleteSupplier(supplierToDelete.id)
      onDelete(supplierToDelete.id)
      toast({
        title: "Supplier Deleted",
        description: "The supplier has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting supplier:", error)
      toast({
        variant: "destructive",
        title: "Error Deleting Supplier",
        description: error.message || "Failed to delete supplier. Please try again.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  const handleSyncItem = async (supplier: Supplier) => {
    if (!isOnline || syncingIds.includes(supplier.id) || supplier.syncStatus !== "pending") {
      return
    }

    setSyncingIds((prev) => [...prev, supplier.id])

    try {
      const result = await syncSupplier(supplier.id)

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: "The supplier has been synced with the database.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: result.error || "Failed to sync with the database. Please try again.",
        })
      }
    } catch (error: any) {
      console.error(`Error syncing supplier ${supplier.id}:`, error)

      // Show a user-friendly error message
      let errorMessage = "Failed to sync with the database. Please try again."

      if (error.message.includes("timed out")) {
        errorMessage = "The connection to the database timed out. Please check your internet connection and try again."
      } else if (error.message.includes("connect")) {
        errorMessage = "Unable to connect to the database. Please check your internet connection."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        variant: "destructive",
        title: "Sync Error",
        description: errorMessage,
      })
    } finally {
      setSyncingIds((prev) => prev.filter((id) => id !== supplier.id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500">Active</Badge>
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "On Hold":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            On Hold
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center">
        <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
        <h3 className="font-medium">No suppliers found</h3>
        <p className="text-sm text-muted-foreground">
          No suppliers match your current filters or you haven't added any suppliers yet.
        </p>
      </div>
    )
  }

  // Count pending items
  const pendingCount = suppliers.filter((s) => s.syncStatus === "pending").length

  return (
    <>
      {pendingCount > 0 && (
        <div className="flex justify-between items-center mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-amber-500 mr-2" />
            <span>
              {pendingCount} item{pendingCount !== 1 ? "s" : ""} waiting to be synced to the database
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Open the sync manager by dispatching a custom event
              window.dispatchEvent(new CustomEvent("open-sync-manager"))
            }}
            disabled={!isOnline}
            className="border-amber-500 text-amber-700 hover:bg-amber-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
        </div>
      )}

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
              <TableHead>Sync</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.products}</TableCell>
                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SyncStatusIndicator status={supplier.syncStatus || "synced"} error={supplier.syncError} />

                    {supplier.syncStatus === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={!isOnline || syncingIds.includes(supplier.id)}
                        onClick={() => handleSyncItem(supplier)}
                        title="Sync this item"
                      >
                        <RefreshCw className={`h-3 w-3 ${syncingIds.includes(supplier.id) ? "animate-spin" : ""}`} />
                        <span className="sr-only">Sync</span>
                      </Button>
                    )}

                    {supplier.syncStatus === "error" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                        disabled={!isOnline || syncingIds.includes(supplier.id)}
                        onClick={() => handleSyncItem(supplier)}
                        title="Retry sync"
                      >
                        <RefreshCw className={`h-3 w-3 ${syncingIds.includes(supplier.id) ? "animate-spin" : ""}`} />
                        <span className="sr-only">Retry</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(supplier)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(supplier)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                      {supplier.syncStatus === "pending" && (
                        <DropdownMenuItem
                          onClick={() => handleSyncItem(supplier)}
                          disabled={!isOnline || syncingIds.includes(supplier.id)}
                        >
                          <RefreshCw
                            className={`mr-2 h-4 w-4 ${syncingIds.includes(supplier.id) ? "animate-spin" : ""}`}
                          />
                          <span>Sync Now</span>
                        </DropdownMenuItem>
                      )}
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
              This will permanently delete the supplier <span className="font-medium">{supplierToDelete?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

