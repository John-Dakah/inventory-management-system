"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusIcon, Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SuppliersTable } from "@/components/suppliers-table"
import { SupplierForm } from "@/components/supplier-form"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import { getSuppliers, getSupplierStats } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Supplier } from "@/lib/db"

export default function SuppliersPage() {
  const [open, setOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    activePercentage: 0,
    onHold: 0,
    inactive: 0,
  })

  // Load suppliers and stats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load suppliers
        const data = await getSuppliers()
        setSuppliers(data)
        setFilteredSuppliers(data)

        // Calculate stats
        const supplierStats = await getSupplierStats()
        setStats(supplierStats)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters
  useEffect(() => {
    let results = suppliers

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(term) ||
          supplier.contactPerson.toLowerCase().includes(term) ||
          supplier.email.toLowerCase().includes(term) ||
          supplier.phone.toLowerCase().includes(term) ||
          supplier.products.toLowerCase().includes(term),
      )
    }

    // Status filter
    if (statusFilter !== "All") {
      results = results.filter((supplier) => supplier.status === statusFilter)
    }

    setFilteredSuppliers(results)
  }, [searchTerm, statusFilter, suppliers])

  // Handle supplier saved (added or updated)
  const handleSupplierSaved = (supplier: Supplier) => {
    setSuppliers((prev) => {
      // Check if supplier already exists
      const exists = prev.some((s) => s.id === supplier.id)

      if (exists) {
        // Update existing supplier
        return prev.map((s) => (s.id === supplier.id ? supplier : s))
      } else {
        // Add new supplier
        return [supplier, ...prev]
      }
    })

    // Update stats
    setStats((prev) => {
      const newStats = { ...prev }

      // If it's a new supplier
      if (!editSupplier) {
        newStats.total += 1

        if (supplier.status === "Active") {
          newStats.active += 1
        } else if (supplier.status === "On Hold") {
          newStats.onHold += 1
        } else if (supplier.status === "Inactive") {
          newStats.inactive += 1
        }

        // Check if it's a new supplier this month
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const supplierDate = new Date(supplier.createdAt)

        if (supplierDate >= firstDayOfMonth) {
          newStats.newThisMonth += 1
        }

        // Recalculate percentage
        newStats.activePercentage = Math.round((newStats.active / newStats.total) * 100)
      }
      // If it's an update and status changed
      else if (editSupplier.status !== supplier.status) {
        if (supplier.status === "Active" && editSupplier.status !== "Active") {
          newStats.active += 1
          newStats.inactive = Math.max(0, newStats.inactive - 1)
          newStats.onHold = Math.max(0, newStats.onHold - 1)
        } else if (supplier.status !== "Active" && editSupplier.status === "Active") {
          newStats.active -= 1
        } else if (supplier.status === "On Hold" && editSupplier.status !== "On Hold") {
          newStats.onHold += 1
          newStats.active = Math.max(0, newStats.active - 1)
          newStats.inactive = Math.max(0, newStats.inactive - 1)
        } else if (supplier.status !== "On Hold" && editSupplier.status === "On Hold") {
          newStats.onHold -= 1
        } else if (supplier.status === "Inactive" && editSupplier.status !== "Inactive") {
          newStats.inactive += 1
          newStats.active = Math.max(0, newStats.active - 1)
          newStats.onHold = Math.max(0, newStats.onHold - 1)
        } else if (supplier.status !== "Inactive" && editSupplier.status === "Inactive") {
          newStats.inactive -= 1
        }

        // Recalculate percentage
        newStats.activePercentage = Math.round((newStats.active / newStats.total) * 100)
      }

      return newStats
    })

    // Reset edit supplier
    setEditSupplier(null)
  }

  // Handle edit button click
  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier)
    setOpen(true)
  }

  // Handle add button click
  const handleAdd = () => {
    setEditSupplier(null)
    setOpen(true)
  }

  // Handle delete
  const handleDelete = (supplierId: string) => {
    // Find the supplier to get its details for stats update
    const supplierToDelete = suppliers.find((s) => s.id === supplierId)

    if (supplierToDelete) {
      // Update suppliers list
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierId))

      // Update stats
      setStats((prev) => {
        const newStats = { ...prev }
        newStats.total -= 1

        if (supplierToDelete.status === "Active") {
          newStats.active -= 1
        } else if (supplierToDelete.status === "On Hold") {
          newStats.onHold -= 1
        } else if (supplierToDelete.status === "Inactive") {
          newStats.inactive -= 1
        }

        // Check if it was a new supplier this month
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const supplierDate = new Date(supplierToDelete.createdAt)

        if (supplierDate >= firstDayOfMonth) {
          newStats.newThisMonth -= 1
        }

        // Recalculate percentage
        newStats.activePercentage = newStats.total > 0 ? Math.round((newStats.active / newStats.total) * 100) : 0

        return newStats
      })
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers and vendor relationships.</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <Button onClick={handleAdd}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `+${stats.newThisMonth} new this month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${stats.activePercentage}% of total`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.onHold}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${Math.round((stats.onHold / stats.total) * 100) || 0}% of total`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${Math.round((stats.inactive / stats.total) * 100) || 0}% of total`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>View and manage all your suppliers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between pb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SuppliersTable
            suppliers={filteredSuppliers}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSupplierSaved={handleSupplierSaved}
          />
        </CardContent>
      </Card>

      <SupplierForm
        open={open}
        onOpenChange={setOpen}
        onSupplierSaved={handleSupplierSaved}
        editSupplier={editSupplier}
      />

      <SyncManager />
    </div>
  )
}
