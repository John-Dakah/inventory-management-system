"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"
import { ProductForm } from "@/components/product-form"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import { registerServiceWorker } from "@/app/service-worker"
import { checkStorageQuota, getProducts, getProductStats, getStockStats, getSupplierNames } from "@/lib/db"
import { AlertCircle, HardDrive, Search, X, FilterIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/db"
import Link from "next/link"

export default function InventoryPage() {
  const [open, setOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [showStorageWarning, setShowStorageWarning] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: [] as string[],
    vendors: [] as string[],
  })

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [stockFilter, setStockFilter] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Register service worker
  registerServiceWorker()

  // Load products and stats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Check storage quota
        // const info = await checkStorageQuota()
        // setStorageInfo(info)

        // // Show warning if storage usage is above 80%
        // if (info && info.percentUsed > 80) {
        //   setShowStorageWarning(true)
        // }

        // Load products
        const data = await getProducts()
        setProducts(data)
        setFilteredProducts(data)

        // Get supplier names for the product form
        const supplierNames = await getSupplierNames()

        // Calculate stats
        const productStats = await getProductStats()

        // Get stock stats to update the In Stock card
        const stockStats = await getStockStats()

        // Merge stock stats with product stats
        setStats({
          ...productStats,
          // Use stock data for in-stock counts
          inStock: stockStats.totalItems - stockStats.lowStockItems - stockStats.outOfStockItems,
          lowStock: stockStats.lowStockItems,
          outOfStock: stockStats.outOfStockItems,
          // Use supplier names from the suppliers page
          vendors: supplierNames,
        })
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
    let results = products

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter((product) => product.category && selectedCategories.includes(product.category))
    }

    // Vendor filter
    if (selectedVendors.length > 0) {
      results = results.filter((product) => product.vendor && selectedVendors.includes(product.vendor))
    }

    // Price range filter
    if (priceRange.min) {
      results = results.filter((product) => product.price >= Number(priceRange.min))
    }
    if (priceRange.max) {
      results = results.filter((product) => product.price <= Number(priceRange.max))
    }

    // Stock status filter
    if (stockFilter) {
      switch (stockFilter) {
        case "inStock":
          results = results.filter((product) => product.quantity > 10)
          break
        case "lowStock":
          results = results.filter((product) => product.quantity > 0 && product.quantity <= 10)
          break
        case "outOfStock":
          results = results.filter((product) => product.quantity === 0)
          break
      }
    }

    setFilteredProducts(results)
  }, [searchTerm, selectedCategories, selectedVendors, priceRange, stockFilter, products])

  // Handle product saved (added or updated)
  const handleProductSaved = (product: Product) => {
    setProducts((prev) => {
      // Check if product already exists
      const exists = prev.some((p) => p.id === product.id)

      if (exists) {
        // Update existing product
        return prev.map((p) => (p.id === product.id ? product : p))
      } else {
        // Add new product
        return [product, ...prev]
      }
    })

    // We don't need to update stock stats here anymore as they come from the stock page
    // Just update categories and vendors if they're new
    setStats((prev) => {
      const newStats = { ...prev }

      // Add category and vendor if they're new
      if (product.category && !newStats.categories.includes(product.category)) {
        newStats.categories.push(product.category)
      }
      if (product.vendor && !newStats.vendors.includes(product.vendor)) {
        newStats.vendors.push(product.vendor)
      }

      return newStats
    })

    // Reset edit product
    setEditProduct(null)
  }

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setOpen(true)
  }

  // Handle add button click
  const handleAdd = () => {
    setEditProduct(null)
    setOpen(true)
  }

  // Handle delete
  const handleDelete = (productId: string) => {
    // Find the product to get its details for stats update
    const productToDelete = products.find((p) => p.id === productId)

    if (productToDelete) {
      // Update products list
      setProducts((prev) => prev.filter((p) => p.id !== productId))

      // Update stats
      setStats((prev) => {
        const newStats = { ...prev }
        newStats.total -= 1

        if (productToDelete.quantity === 0) {
          newStats.outOfStock -= 1
        } else if (productToDelete.quantity <= 10) {
          newStats.lowStock -= 1
        } else {
          newStats.inStock -= 1
        }

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

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Handle vendor filter change
  const handleVendorChange = (vendor: string) => {
    setSelectedVendors((prev) => (prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]))
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedVendors([])
    setPriceRange({ min: "", max: "" })
    setStockFilter(null)
    setIsFilterOpen(false)
  }

  // Count active filters
  const activeFilterCount = [
    selectedCategories.length > 0,
    selectedVendors.length > 0,
    priceRange.min || priceRange.max,
    stockFilter !== null,
  ].filter(Boolean).length

  // Get out of stock products
  const outOfStockProducts = products.filter((p) => p.quantity === 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <Button onClick={handleAdd}>Add Product</Button>
        </div>
      </div>

      {showStorageWarning && storageInfo && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Storage Warning</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Your local storage is {storageInfo.percentUsed}% full. Consider syncing and clearing old data.</span>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4" />
              <span>
                {storageInfo.used} / {storageInfo.total}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${stats.categories.length} categories, ${stats.vendors.length} vendors`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.inStock}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${Math.round((stats.inStock / stats.total) * 100) || 0}% of products`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on stock page data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${Math.round((stats.lowStock / stats.total) * 100) || 0}% of products`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on stock page data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.outOfStock}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${Math.round((stats.outOfStock / stats.total) * 100) || 0}% of products`}
              </p>
              {stats.outOfStock > 0 && (
                <Button variant="outline" size="sm" asChild className="mt-1">
                  <Link href="/stock">Restock Items</Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on stock page data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `Most items in ${stats.categories[0] || "N/A"}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Out of Stock Products Card */}
      {outOfStockProducts.length > 0 && (
        <Card className="border-dashed border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Out of Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {outOfStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/stock?product=${product.id}`} className="flex items-center gap-1">
                      Restock
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex w-full items-center space-x-2 md:w-1/3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by name or SKU..."
              className="w-full pl-8"
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

                {stats.categories.length > 0 && (
                  <>
                    <div>
                      <h5 className="mb-2 text-sm font-medium">Category</h5>
                      <div className="max-h-32 overflow-y-auto space-y-2">
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
                  </>
                )}

                {stats.vendors.length > 0 && (
                  <>
                    <div>
                      <h5 className="mb-2 text-sm font-medium">Vendor</h5>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {stats.vendors.map((vendor) => (
                          <div key={vendor} className="flex items-center space-x-2">
                            <Checkbox
                              id={`vendor-${vendor}`}
                              checked={selectedVendors.includes(vendor)}
                              onCheckedChange={() => handleVendorChange(vendor)}
                            />
                            <Label htmlFor={`vendor-${vendor}`} className="text-sm font-normal">
                              {vendor}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <h5 className="mb-2 text-sm font-medium">Price Range</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-price" className="text-xs">
                        Min
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-xs">
                        Max
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Stock Status</h5>
                  <Select
                    value={stockFilter || "all"}
                    onValueChange={(value) => setStockFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All stock levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stock levels</SelectItem>
                      <SelectItem value="inStock">In Stock (>10)</SelectItem>
                      <SelectItem value="lowStock">Low Stock (1-10)</SelectItem>
                      <SelectItem value="outOfStock">Out of Stock (0)</SelectItem>
                    </SelectContent>
                  </Select>
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
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(category)} />
            </Badge>
          ))}

          {selectedVendors.map((vendor) => (
            <Badge key={`badge-vendor-${vendor}`} variant="secondary" className="flex items-center gap-1">
              Vendor: {vendor}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleVendorChange(vendor)} />
            </Badge>
          ))}

          {(priceRange.min || priceRange.max) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Price: {priceRange.min || "0"} - {priceRange.max || "∞"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange({ min: "", max: "" })} />
            </Badge>
          )}

          {stockFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status:{" "}
              {stockFilter === "inStock" ? "In Stock" : stockFilter === "lowStock" ? "Low Stock" : "Out of Stock"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStockFilter(null)} />
            </Badge>
          )}
        </div>
      )}

      <ProductsTable
        products={filteredProducts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onProductSaved={handleProductSaved}
      />

      <ProductForm
        open={open}
        onOpenChange={setOpen}
        onProductSaved={handleProductSaved}
        editProduct={editProduct}
        categories={stats.categories}
        vendors={stats.vendors}
      />

      <SyncManager />
    </div>
  )
}

