"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"
import { ProductForm } from "@/components/product-form"
import { AlertCircle, Search, X, FilterIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

type Product = {
  id: string | undefined
  name: string
  description: string | null
  sku: string
  price: number
  quantity: number
  category: string | null
  vendor: string | null
  imageUrl: string | null
  createdAt?: string
  updatedAt?: string
}

export default function InventoryPage() {
  const [open, setOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`)
      }
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again.")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      const productData = await fetchProducts()
      setProducts(productData)
      setFilteredProducts(productData)

      const categories = [...new Set(productData.map((p: { category: any }) => p.category).filter(Boolean))] as string[]
      const vendors = [...new Set(productData.map((p: { vendor: any }) => p.vendor).filter(Boolean))] as string[]

      const inStock = productData.filter((p: { quantity: number }) => p.quantity > 10).length
      const lowStock = productData.filter((p: { quantity: number }) => p.quantity > 0 && p.quantity <= 10).length
      const outOfStock = productData.filter((p: { quantity: number }) => p.quantity === 0).length

      setStats({
        total: productData.length,
        inStock,
        lowStock,
        outOfStock,
        categories,
        vendors,
      })
    }

    loadData()
  }, [])

  useEffect(() => {
    let results = products

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        product =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)))
    }

    if (selectedCategories.length > 0) {
      results = results.filter(product => product.category && selectedCategories.includes(product.category))
    }

    if (selectedVendors.length > 0) {
      results = results.filter(product => product.vendor && selectedVendors.includes(product.vendor))
    }

    if (priceRange.min) {
      results = results.filter(product => product.price >= Number(priceRange.min))
    }
    if (priceRange.max) {
      results = results.filter(product => product.price <= Number(priceRange.max))
    }

    if (stockFilter) {
      switch (stockFilter) {
        case "inStock":
          results = results.filter(product => product.quantity > 10)
          break
        case "lowStock":
          results = results.filter(product => product.quantity > 0 && product.quantity <= 10)
          break
        case "outOfStock":
          results = results.filter(product => product.quantity === 0)
          break
      }
    }

    setFilteredProducts(results)
  }, [searchTerm, selectedCategories, selectedVendors, priceRange, stockFilter, products])

  const handleProductSaved = async (product: Product) => {
    setError(null)
    try {
      const method = product.id ? "PUT" : "POST"
      const url = product.id ? `/api/products/${product.id}` : "/api/products"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error(`Error saving product: ${response.statusText}`)
      }

      const savedProduct = await response.json()

      setProducts(prev => {
        const exists = prev.some(p => p.id === savedProduct.id)
        return exists 
          ? prev.map(p => p.id === savedProduct.id ? savedProduct : p)
          : [savedProduct, ...prev]
      })

      setStats(prev => {
        const newStats = { ...prev }
        if (!products.some(p => p.id === savedProduct.id)) {
          newStats.total += 1
        }
        if (savedProduct.category && !newStats.categories.includes(savedProduct.category)) {
          newStats.categories.push(savedProduct.category)
        }
        if (savedProduct.vendor && !newStats.vendors.includes(savedProduct.vendor)) {
          newStats.vendors.push(savedProduct.vendor)
        }
        return newStats
      })

      setEditProduct(null)
      setOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
      setError("Failed to save product. Please try again.")
    }
  }

  const handleDelete = async (productId: string) => {
    setError(null)
    try {
      const productToDelete = products.find(p => p.id === productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting product: ${response.statusText}`)
      }

      if (productToDelete) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        setStats(prev => {
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
    } catch (error) {
      console.error("Error deleting product:", error)
      setError("Failed to delete product. Please try again.")
    }
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setOpen(true)
  }

  const handleAdd = () => {
    setEditProduct(null)
    setOpen(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const handleVendorChange = (vendor: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendor) ? prev.filter(v => v !== vendor) : [...prev, vendor]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedVendors([])
    setPriceRange({ min: "", max: "" })
    setStockFilter(null)
    setIsFilterOpen(false)
  }

  const activeFilterCount = [
    selectedCategories.length > 0,
    selectedVendors.length > 0,
    priceRange.min || priceRange.max,
    stockFilter !== null,
  ].filter(Boolean).length

  const outOfStockProducts = products.filter(p => p.quantity === 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleAdd}>Add Product</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
                      <SelectItem value="inStock">{"In Stock (>10)"}</SelectItem>
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
        products={filteredProducts
          .filter(product => product.id !== undefined)
          .map(product => ({
            ...product,
            description: product.description || "",
          }))}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductForm
        open={open}
        onOpenChange={setOpen}
        onProductSaved={(product) => { void handleProductSaved(product) }}
        editProduct={editProduct ? { 
          ...editProduct, 
          description: editProduct.description || "", 
          category: editProduct.category || "", 
          vendor: editProduct.vendor || "",
          imageUrl: editProduct.imageUrl || ""
        } : null}
        categories={stats.categories}
        vendors={stats.vendors}
      />
    </div>
  )
}