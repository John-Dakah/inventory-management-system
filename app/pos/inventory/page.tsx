"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { SearchIcon, PlusIcon, DownloadIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for inventory
const mockInventory = [
  {
    id: "P001",
    name: "Product ABC",
    category: "Electronics",
    location: "Warehouse North",
    currentStock: 150,
    minStock: 100,
    maxStock: 300,
    unitPrice: 29.99,
    status: "In Stock",
  },
  {
    id: "P002",
    name: "Product DEF",
    category: "Furniture",
    location: "Warehouse South",
    currentStock: 75,
    minStock: 100,
    maxStock: 200,
    unitPrice: 149.99,
    status: "Low Stock",
  },
  {
    id: "P003",
    name: "Product XYZ",
    category: "Electronics",
    location: "Warehouse North",
    currentStock: 200,
    minStock: 50,
    maxStock: 250,
    unitPrice: 49.99,
    status: "In Stock",
  },
  {
    id: "P004",
    name: "Product MNO",
    category: "Clothing",
    location: "Warehouse East",
    currentStock: 30,
    minStock: 75,
    maxStock: 150,
    unitPrice: 19.99,
    status: "Critical",
  },
  {
    id: "P005",
    name: "Product PQR",
    category: "Furniture",
    location: "Warehouse West",
    currentStock: 60,
    minStock: 80,
    maxStock: 180,
    unitPrice: 199.99,
    status: "Low Stock",
  },
  {
    id: "P006",
    name: "Product STU",
    category: "Electronics",
    location: "Warehouse North",
    currentStock: 0,
    minStock: 50,
    maxStock: 150,
    unitPrice: 39.99,
    status: "Out of Stock",
  },
  {
    id: "P007",
    name: "Product VWX",
    category: "Clothing",
    location: "Warehouse South",
    currentStock: 120,
    minStock: 50,
    maxStock: 200,
    unitPrice: 24.99,
    status: "In Stock",
  },
  {
    id: "P008",
    name: "Product YZA",
    category: "Furniture",
    location: "Warehouse East",
    currentStock: 90,
    minStock: 50,
    maxStock: 150,
    unitPrice: 129.99,
    status: "In Stock",
  },
]

// Categories and locations for filtering
const categories = ["All", "Electronics", "Furniture", "Clothing"]
const locations = ["All", "Warehouse North", "Warehouse South", "Warehouse East", "Warehouse West"]
const statuses = ["All", "In Stock", "Low Stock", "Critical", "Out of Stock"]

export default function InventoryPage() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [locationFilter, setLocationFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isExporting, setIsExporting] = useState(false)

  // Filter inventory based on search query and filters
  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    const matchesLocation = locationFilter === "All" || item.location === locationFilter
    const matchesStatus = statusFilter === "All" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus
  })

  const handleExport = async (format: string) => {
    if (!hasPermission("view_inventory")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to export inventory data",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // In a real app, this would generate the actual file
      const filename = `inventory-export.${format}`
      const mockData = JSON.stringify(filteredInventory, null, 2)
      const blob = new Blob([mockData], { type: "application/octet-stream" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Inventory data exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage and view all inventory items across warehouses</p>
        </div>
        <div className="flex gap-2">
          {hasPermission("manage_inventory") && (
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>{filteredInventory.length} items found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID or name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">{item.currentStock}</TableCell>
                      <TableCell className="text-right">{item.minStock}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            item.status === "In Stock" && "bg-green-100 text-green-800",
                            item.status === "Low Stock" && "bg-yellow-100 text-yellow-800",
                            item.status === "Critical" && "bg-red-100 text-red-800",
                            item.status === "Out of Stock" && "bg-gray-100 text-gray-800",
                          )}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

