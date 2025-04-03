"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useSearchParams } from "next/navigation"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FilterIcon,
  Loader2Icon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import {
  getStockItems,
  getStockStats,
  saveStockItem,
  recordStockTransaction,
  getProducts,
  getProduct,
  saveProduct, // Import saveProduct
  type StockItem,
  type StockTransaction,
  type Product,
} from "@/lib/db"

export default function StockPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")

  const [searchTerm, setSearchTerm] = useState("")
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStockInOpen, setIsStockInOpen] = useState(false)
  const [isStockOutOpen, setIsStockOutOpen] = useState(false)
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalItems: 0,
    totalUnits: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categories: [] as string[],
    locations: [] as string[],
    types: [] as string[],
  })

  // Filter states with checkboxes
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Form states
  const [stockInForm, setStockInForm] = useState({
    productId: "",
    quantity: "",
    location: "",
    reference: "",
    notes: "",
  })

  const [stockOutForm, setStockOutForm] = useState({
    productId: "",
    quantity: "",
    location: "",
    reference: "",
    notes: "",
  })

  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: "",
    newQuantity: "",
    reason: "",
    notes: "",
  })

  // Add this state for available products
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  // Add state for out of stock products and fetch them
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([])

  // Load stock items, products and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load stock items
        const items = await getStockItems()
        setStockItems(items)
        setFilteredItems(items)

        // Load products for stock in form
        const products = await getProducts()
        const outOfStock = products.filter((p) => p.quantity === 0)
        setOutOfStockProducts(outOfStock)
        setAvailableProducts(products)

        // Load stats
        const stockStats = await getStockStats()
        setStats(stockStats)

        // If productId is provided in URL, open stock in dialog with that product
        if (productId) {
          const product = await getProduct(productId)
          if (product) {
            setStockInForm({
              productId: product.id,
              quantity: "1",
              location: "",
              reference: "",
              notes: "",
            })
            setIsStockInOpen(true)
          }
        }
      } catch (error) {
        console.error("Error loading stock data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load stock data from local storage.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [productId])

  // Apply filters
  useEffect(() => {
    let results = stockItems

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter((item) => selectedCategories.includes(item.category))
    }

    // Location filter
    if (selectedLocations.length > 0) {
      results = results.filter((item) => selectedLocations.includes(item.location))
    }

    // Type filter
    if (selectedTypes.length > 0) {
      results = results.filter((item) => selectedTypes.includes(item.type))
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      results = results.filter((item) => selectedStatuses.includes(item.status))
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      results = results.filter((item) => {
        const itemDate = new Date(item.lastUpdated)
        return itemDate >= fromDate && itemDate <= toDate
      })
    }

    setFilteredItems(results)
  }, [searchTerm, selectedCategories, selectedLocations, selectedTypes, selectedStatuses, dateRange, stockItems])

  // Handle checkbox changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedLocations([])
    setSelectedTypes([])
    setSelectedStatuses([])
    setDateRange({ from: "", to: "" })
    setIsFilterOpen(false)
  }

  // Handle stock in submission
  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const productId = stockInForm.productId
      const quantity = Number.parseInt(stockInForm.quantity)

      if (isNaN(quantity) || quantity <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid quantity.",
        })
        return
      }

      const now = new Date().toISOString()

      // Check if this product already exists in stock
      const stockItem = stockItems.find((item) => {
        // Match by product ID and location
        return (
          item.name === availableProducts.find((p) => p.id === productId)?.name &&
          item.location === stockInForm.location
        )
      })

      if (stockItem) {
        // Update existing stock item
        const transaction: StockTransaction = {
          id: uuidv4(),
          stockItemId: stockItem.id,
          type: "in",
          quantity: quantity,
          previousQuantity: stockItem.quantity,
          newQuantity: stockItem.quantity + quantity,
          location: stockInForm.location,
          reference: stockInForm.reference,
          notes: stockInForm.notes,
          createdAt: now,
        }

        // Record transaction (this will also update the stock item)
        await recordStockTransaction(transaction)

        // Update local state
        setStockItems((prev) =>
          prev.map((item) => {
            if (item.id === stockItem!.id) {
              const newQuantity = item.quantity + quantity
              let status = "In Stock"
              if (newQuantity === 0) status = "Out of Stock"
              else if (newQuantity <= 10) status = "Low Stock"

              return {
                ...item,
                quantity: newQuantity,
                status,
                lastUpdated: now,
              }
            }
            return item
          }),
        )
      } else {
        // Create new stock item
        const selectedProduct = availableProducts.find((p) => p.id === productId)

        if (!selectedProduct) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Selected product not found.",
          })
          return
        }

        // Determine status based on quantity
        let status = "In Stock"
        if (quantity === 0) status = "Out of Stock"
        else if (quantity <= 10) status = "Low Stock"

        const newStockItem: StockItem = {
          id: uuidv4(),
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          category: selectedProduct.category || "General",
          quantity: quantity,
          location: stockInForm.location,
          status: status,
          type: "Finished Good", // Default type, could be made selectable
          lastUpdated: now,
          createdAt: now,
          updatedAt: now,
        }

        // Save the new stock item
        await saveStockItem(newStockItem)

        // Update local state
        setStockItems((prev) => [newStockItem, ...prev])

        // Add the location to stats if it's new
        if (!stats.locations.includes(stockInForm.location)) {
          setStats((prev) => ({
            ...prev,
            locations: [...prev.locations, stockInForm.location],
          }))
        }
      }

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalUnits: prev.totalUnits + quantity,
        totalItems: stockItem ? prev.totalItems : prev.totalItems + 1,
      }))

      // Update the product in the inventory
      const selectedProduct = availableProducts.find((p) => p.id === productId)
      if (selectedProduct) {
        // Update the product's quantity in the inventory
        const updatedProduct = {
          ...selectedProduct,
          quantity: selectedProduct.quantity + quantity,
          updatedAt: now,
        }

        // Update the product in the database
        await saveProduct(updatedProduct)

        // Update local state
        setAvailableProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

        // Update out of stock products list
        if (selectedProduct.quantity === 0 && quantity > 0) {
          setOutOfStockProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))
        }
      }

      toast({
        title: "Stock In Recorded",
        description: `Added ${quantity} units to inventory at ${stockInForm.location}.`,
        duration: 3000,
      })

      setIsStockInOpen(false)
      setStockInForm({
        productId: "",
        quantity: "",
        location: "",
        reference: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error recording stock in:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record stock in. Please try again.",
      })
    }
  }

  // Handle stock out submission
  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const stockItem = stockItems.find((item) => item.id === stockOutForm.productId)
      if (!stockItem) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Selected product not found.",
        })
        return
      }

      const quantity = Number.parseInt(stockOutForm.quantity)
      if (isNaN(quantity) || quantity <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid quantity.",
        })
        return
      }

      if (quantity > stockItem.quantity) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot remove more units than available in stock.",
        })
        return
      }

      // Create transaction
      const now = new Date().toISOString()
      const transaction: StockTransaction = {
        id: uuidv4(),
        stockItemId: stockOutForm.productId,
        type: "out",
        quantity: quantity,
        previousQuantity: stockItem.quantity,
        newQuantity: stockItem.quantity - quantity,
        location: stockOutForm.location,
        reference: stockOutForm.reference,
        notes: stockOutForm.notes,
        createdAt: now,
      }

      // Record transaction (this will also update the stock item)
      await recordStockTransaction(transaction)

      // Update local state
      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id === stockOutForm.productId) {
            const newQuantity = item.quantity - quantity
            let status = "In Stock"
            if (newQuantity === 0) status = "Out of Stock"
            else if (newQuantity <= 10) status = "Low Stock"

            return {
              ...item,
              quantity: newQuantity,
              status,
              lastUpdated: now,
            }
          }
          return item
        }),
      )

      // Find the corresponding product in inventory
      const relatedProduct = availableProducts.find((p) => p.name === stockItem.name && p.sku === stockItem.sku)

      if (relatedProduct) {
        // Update the product's quantity in the inventory
        const updatedProduct = {
          ...relatedProduct,
          quantity: Math.max(0, relatedProduct.quantity - quantity),
          updatedAt: now,
        }

        // Update the product in the database
        await saveProduct(updatedProduct)

        // Update local state
        setAvailableProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

        // Update out of stock products list
        if (updatedProduct.quantity === 0) {
          setOutOfStockProducts((prev) => {
            if (!prev.some((p) => p.id === updatedProduct.id)) {
              return [...prev, updatedProduct]
            }
            return prev
          })
        }
      }

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalUnits: prev.totalUnits - quantity,
        lowStockItems: stockItems.filter((item) => {
          if (item.id === stockOutForm.productId) {
            const newQuantity = item.quantity - quantity
            return newQuantity > 0 && newQuantity <= 10
          }
          return item.status === "Low Stock"
        }).length,
        outOfStockItems: stockItems.filter((item) => {
          if (item.id === stockOutForm.productId) {
            const newQuantity = item.quantity - quantity
            return newQuantity === 0
          }
          return item.status === "Out of Stock"
        }).length,
      }))

      toast({
        title: "Stock Out Recorded",
        description: `Removed ${quantity} units from inventory.`,
        duration: 3000,
      })

      setIsStockOutOpen(false)
      setStockOutForm({
        productId: "",
        quantity: "",
        location: "",
        reference: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error recording stock out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record stock out. Please try again.",
      })
    }
  }

  // Handle adjustment submission
  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const stockItem = stockItems.find((item) => item.id === adjustmentForm.productId)
      if (!stockItem) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Selected product not found.",
        })
        return
      }

      const newQuantity = Number.parseInt(adjustmentForm.newQuantity)
      if (isNaN(newQuantity) || newQuantity < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid quantity.",
        })
        return
      }

      // Create transaction
      const now = new Date().toISOString()
      const transaction: StockTransaction = {
        id: uuidv4(),
        stockItemId: adjustmentForm.productId,
        type: "adjustment",
        quantity: Math.abs(newQuantity - stockItem.quantity), // Absolute difference
        previousQuantity: stockItem.quantity,
        newQuantity: newQuantity,
        location: stockItem.location,
        reason: adjustmentForm.reason,
        notes: adjustmentForm.notes,
        createdAt: now,
      }

      // Record transaction (this will also update the stock item)
      await recordStockTransaction(transaction)

      // Update local state
      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id === adjustmentForm.productId) {
            let status = "In Stock"
            if (newQuantity === 0) status = "Out of Stock"
            else if (newQuantity <= 10) status = "Low Stock"

            return {
              ...item,
              quantity: newQuantity,
              status,
              lastUpdated: now,
            }
          }
          return item
        }),
      )

      // Find the corresponding product in inventory
      const relatedProduct = availableProducts.find((p) => p.name === stockItem.name && p.sku === stockItem.sku)

      if (relatedProduct) {
        // Calculate the difference
        const quantityDifference = newQuantity - stockItem.quantity

        // Update the product's quantity in the inventory
        const updatedProduct = {
          ...relatedProduct,
          quantity: Math.max(0, relatedProduct.quantity + quantityDifference),
          updatedAt: now,
        }

        // Update the product in the database
        await saveProduct(updatedProduct)

        // Update local state
        setAvailableProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

        // Update out of stock products list
        if (updatedProduct.quantity === 0) {
          setOutOfStockProducts((prev) => {
            if (!prev.some((p) => p.id === updatedProduct.id)) {
              return [...prev, updatedProduct]
            }
            return prev
          })
        } else if (stockItem.quantity === 0 && newQuantity > 0) {
          setOutOfStockProducts((prev) => prev.filter((p) => p.id !== updatedProduct.id))
        }
      }

      // Update stats
      const quantityDifference = newQuantity - stockItem.quantity
      setStats((prev) => ({
        ...prev,
        totalUnits: prev.totalUnits + quantityDifference,
        lowStockItems: stockItems.filter((item) => {
          if (item.id === adjustmentForm.productId) {
            return newQuantity > 0 && newQuantity <= 10
          }
          return item.status === "Low Stock"
        }).length,
        outOfStockItems: stockItems.filter((item) => {
          if (item.id === adjustmentForm.productId) {
            return newQuantity === 0
          }
          return item.status === "Out of Stock"
        }).length,
      }))

      toast({
        title: "Stock Adjusted",
        description: `Inventory quantity updated to ${newQuantity} units.`,
        duration: 3000,
      })

      setIsAdjustmentOpen(false)
      setAdjustmentForm({
        productId: "",
        newQuantity: "",
        reason: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error adjusting stock:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to adjust stock. Please try again.",
      })
    }
  }

  // Handle export
  const handleExport = async (format: string) => {
    setIsExporting(true)
    setExportFormat(format)

    try {
      // Create export data
      const exportData = filteredItems.map((item) => ({
        Name: item.name,
        SKU: item.sku,
        Category: item.category,
        Type: item.type,
        Quantity: item.quantity,
        Location: item.location,
        Status: item.status,
        LastUpdated: new Date(item.lastUpdated).toLocaleDateString(),
      }))

      let filename = ""
      let content = ""
      let type = ""

      switch (format) {
        case "csv":
          filename = `stock-inventory-${new Date().toISOString().split("T")[0]}.csv`

          // Create CSV content
          const headers = Object.keys(exportData[0])
          content = [
            headers.join(","),
            ...exportData.map((row) =>
              headers
                .map((header) => {
                  const value = row[header as keyof typeof row]
                  return typeof value === "string" && value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value
                })
                .join(","),
            ),
          ].join("\n")

          type = "text/csv"
          break

        case "pdf":
        case "excel":
          // For demo purposes, we'll just use JSON for these formats
          // In a real app, you would use libraries like jspdf or xlsx
          filename = `stock-inventory-${new Date().toISOString().split("T")[0]}.json`
          content = JSON.stringify(exportData, null, 2)
          type = "application/json"

          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 1500))
          break
      }

      // Create download
      const blob = new Blob([content], { type })
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
        description: `${format.toUpperCase()} export completed successfully.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  // Count active filters
  const activeFilterCount = [
    selectedCategories.length > 0,
    selectedLocations.length > 0,
    selectedTypes.length > 0,
    selectedStatuses.length > 0,
    dateRange.from && dateRange.to,
  ].filter(Boolean).length

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
            <p className="text-muted-foreground">Manage your inventory stock levels and movements</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Manage your inventory stock levels and movements</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />

          <Dialog open={isStockInOpen} onOpenChange={setIsStockInOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ArrowDownIcon className="h-4 w-4" />
                Stock In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock In</DialogTitle>
                <DialogDescription>Record new stock arriving at your warehouse.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleStockIn}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Product</Label>
                    <Select
                      value={stockInForm.productId}
                      onValueChange={(value) => setStockInForm({ ...stockInForm, productId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.length > 0 ? (
                          availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-products" disabled>
                            No products available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={stockInForm.quantity}
                      onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter warehouse location"
                      value={stockInForm.location}
                      onChange={(e) => setStockInForm({ ...stockInForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input
                      id="reference"
                      placeholder="PO-12345"
                      value={stockInForm.reference}
                      onChange={(e) => setStockInForm({ ...stockInForm, reference: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional information"
                      value={stockInForm.notes}
                      onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Record Stock In</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isStockOutOpen} onOpenChange={setIsStockOutOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ArrowUpIcon className="h-4 w-4" />
                Stock Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Out</DialogTitle>
                <DialogDescription>Record stock leaving your warehouse.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleStockOut}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Product</Label>
                    <Select
                      value={stockOutForm.productId}
                      onValueChange={(value) => {
                        const selectedItem = stockItems.find((item) => item.id === value)
                        setStockOutForm({
                          ...stockOutForm,
                          productId: value,
                          location: selectedItem ? selectedItem.location : "",
                        })
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockItems.filter((item) => item.quantity > 0).length > 0 ? (
                          stockItems
                            .filter((item) => item.quantity > 0)
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity} in stock)
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-stock" disabled>
                            No items in stock
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={
                        stockOutForm.productId
                          ? stockItems.find((item) => item.id === stockOutForm.productId)?.quantity
                          : undefined
                      }
                      value={stockOutForm.quantity}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={stockOutForm.location} readOnly className="bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      Items will be taken from the product's current location
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input
                      id="reference"
                      placeholder="SO-12345"
                      value={stockOutForm.reference}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, reference: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional information"
                      value={stockOutForm.notes}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Record Stock Out</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <SlidersHorizontalIcon className="h-4 w-4" />
                Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>Adjust stock quantities for inventory corrections.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdjustment}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Product</Label>
                    <Select
                      value={adjustmentForm.productId}
                      onValueChange={(value) => {
                        const item = stockItems.find((i) => i.id === value)
                        setAdjustmentForm({
                          ...adjustmentForm,
                          productId: value,
                          newQuantity: item ? item.quantity.toString() : "",
                        })
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockItems.length > 0 ? (
                          stockItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {item.location} ({item.quantity} in stock)
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-items" disabled>
                            No items available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newQuantity">New Quantity</Label>
                    <Input
                      id="newQuantity"
                      type="number"
                      min="0"
                      value={adjustmentForm.newQuantity}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, newQuantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason for Adjustment</Label>
                    <Select
                      value={adjustmentForm.reason}
                      onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, reason: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Physical Count</SelectItem>
                        <SelectItem value="damage">Damaged Goods</SelectItem>
                        <SelectItem value="return">Customer Return</SelectItem>
                        <SelectItem value="error">Data Entry Error</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional information"
                      value={adjustmentForm.notes}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Confirm Adjustment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Exporting {exportFormat}...
                  </>
                ) : (
                  <>
                    Export
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")} className="flex items-center">
                <FileTextIcon className="mr-2 h-4 w-4" />
                <span>CSV File</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="flex items-center">
                <FileTextIcon className="mr-2 h-4 w-4" />
                <span>PDF Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="flex items-center">
                <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
                <span>Excel Spreadsheet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Out of Stock Products from Inventory */}
      {outOfStockProducts.length > 0 && (
        <Card className="mb-4 border-dashed border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Out of Stock Products</CardTitle>
            <CardDescription>These products from your inventory need to be restocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {outOfStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setStockInForm({
                            ...stockInForm,
                            productId: product.id,
                            quantity: "1",
                          })
                          setIsStockInOpen(true)
                        }}
                      >
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex w-full items-center space-x-2 md:w-1/3">
          <div className="relative w-full">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs" variant="secondary">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
                    Clear all
                  </Button>
                </div>

                <div>
                  <h5 className="mb-2 text-sm font-medium">Category</h5>
                  <div className="space-y-2">
                    {stats.categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Location</h5>
                  <div className="space-y-2">
                    {stats.locations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => handleLocationChange(location)}
                        />
                        <Label htmlFor={`location-${location}`} className="text-sm font-normal">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Type</h5>
                  <div className="space-y-2">
                    {stats.types.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeChange(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Status</h5>
                  <div className="space-y-2">
                    {["In Stock", "Low Stock", "Out of Stock"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => handleStatusChange(status)}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm font-normal">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Date Range</h5>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="from" className="text-xs">
                          From
                        </Label>
                        <Input
                          id="from"
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="to" className="text-xs">
                          To
                        </Label>
                        <Input
                          id="to"
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={`badge-category-${category}`} variant="secondary" className="flex items-center gap-1">
              Category: {category}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(category)} />
            </Badge>
          ))}

          {selectedLocations.map((location) => (
            <Badge key={`badge-location-${location}`} variant="secondary" className="flex items-center gap-1">
              Location: {location}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleLocationChange(location)} />
            </Badge>
          ))}

          {selectedTypes.map((type) => (
            <Badge key={`badge-type-${type}`} variant="secondary" className="flex items-center gap-1">
              Type: {type}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleTypeChange(type)} />
            </Badge>
          ))}

          {selectedStatuses.map((status) => (
            <Badge key={`badge-status-${status}`} variant="secondary" className="flex items-center gap-1">
              Status: {status}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleStatusChange(status)} />
            </Badge>
          ))}

          {dateRange.from && dateRange.to && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {dateRange.from} to {dateRange.to}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => setDateRange({ from: "", to: "" })} />
            </Badge>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Stock Inventory</CardTitle>
          <CardDescription>
            {filteredItems.length} items • {filteredItems.reduce((acc, item) => acc + item.quantity, 0)} total units
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <span
                        className={item.quantity === 0 ? "text-destructive" : item.quantity <= 10 ? "text-warning" : ""}
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Out of Stock"
                            ? "destructive"
                            : item.status === "Low Stock"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertCircle className="mb-2 h-8 w-8" />
                      <p>No results found.</p>
                      {activeFilterCount > 0 && <p className="text-sm">Try adjusting your filters or search term.</p>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between py-4">
          <div className="text-xs text-muted-foreground">
            Showing {filteredItems.length} of {stockItems.length} items
          </div>
        </CardFooter>
      </Card>

      <SyncManager />
    </div>
  )
}

