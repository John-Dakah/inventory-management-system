"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  Loader2Icon,
  PackageIcon,
  ArrowUpDownIcon,
  XIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import { WarehouseProductForm } from "@/components/warehouse-product-form"
import { getProducts, deleteProduct, getProductCategories, getProductVendors } from "@/lib/product-service"
import { initializeDatabase } from "@/lib/db-utils"
import { GlobalSyncIndicator } from "@/components/global-sync-indicator"
import type { Product } from "@/types"

export default function WarehouseInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [categories, setCategories] = useState<string[]>([])
  const [vendors, setVendors] = useState<string[]>([])

  // Initialize database when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase()
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }

    init()
  }, [])

  // Load products, categories, and vendors
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load products
        const productData = await getProducts()
        setProducts(productData)
        setFilteredProducts(productData)

        // Load categories and vendors
        const categoryData = await getProductCategories()
        setCategories(categoryData)

        const vendorData = await getProductVendors()
        setVendors(vendorData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let results = [...products]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      switch (activeTab) {
        case "in-stock":
          results = results.filter((product) => product.quantity > 0)
          break
        case "out-of-stock":
          results = results.filter((product) => product.quantity === 0)
          break
      }
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter((product) => product.category && selectedCategories.includes(product.category))
    }

    // Apply vendor filter
    if (selectedVendors.length > 0) {
      results = results.filter((product) => product.vendor && selectedVendors.includes(product.vendor))
    }

    // Apply price range filter
    if (priceRange.min && !isNaN(Number(priceRange.min))) {
      results = results.filter((product) => product.price >= Number(priceRange.min))
    }
    if (priceRange.max && !isNaN(Number(priceRange.max))) {
      results = results.filter((product) => product.price <= Number(priceRange.max))
    }

    // Apply sorting
    if (sortConfig.key) {
      results.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredProducts(results)
  }, [products, searchTerm, activeTab, selectedCategories, selectedVendors, priceRange, sortConfig])

  // Handle sorting
  const requestSort = (key: keyof Product) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Handle checkbox changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleVendorChange = (vendor: string) => {
    setSelectedVendors((prev) => (prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedVendors([])
    setPriceRange({ min: "", max: "" })
    setIsFilterOpen(false)
  }

  // Handle product operations
  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    // Refresh products
    getProducts().then((data) => {
      setProducts(data)

      // Refresh categories and vendors
      getProductCategories().then(setCategories)
      getProductVendors().then(setVendors)

      toast({
        title: "Product Added",
        description: "The product has been added successfully.",
      })
    })
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
    // Refresh products
    getProducts().then((data) => {
      setProducts(data)

      // Refresh categories and vendors
      getProductCategories().then(setCategories)
      getProductVendors().then(setVendors)

      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      })
    })
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await deleteProduct(id)
        setProducts((prev) => prev.filter((product) => product.id !== id))
        toast({
          title: "Product Deleted",
          description: "The product has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting product:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete product. Please try again.",
        })
      }
    }
  }

  // Count active filters
  const activeFilterCount = [
    selectedCategories.length > 0,
    selectedVendors.length > 0,
    priceRange.min || priceRange.max,
  ].filter(Boolean).length

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Create a new product in your inventory</DialogDescription>
              </DialogHeader>
              <WarehouseProductForm onSuccess={handleAddSuccess} />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update product information</DialogDescription>
              </DialogHeader>
              {selectedProduct && <WarehouseProductForm initialData={selectedProduct} onSuccess={handleEditSuccess} />}
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
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
                    {categories.map((category) => (
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
                  <h5 className="mb-2 text-sm font-medium">Vendor</h5>
                  <div className="space-y-2">
                    {vendors.map((vendor) => (
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
                        placeholder="0"
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
                        placeholder="1000"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="h-8"
                      />
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
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2"
        >
          {selectedCategories.map((category) => (
            <Badge key={`badge-category-${category}`} variant="secondary" className="flex items-center gap-1">
              Category: {category}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(category)} />
            </Badge>
          ))}

          {selectedVendors.map((vendor) => (
            <Badge key={`badge-vendor-${vendor}`} variant="secondary" className="flex items-center gap-1">
              Vendor: {vendor}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleVendorChange(vendor)} />
            </Badge>
          ))}

          {(priceRange.min || priceRange.max) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Price: {priceRange.min || "0"} - {priceRange.max || "∞"}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange({ min: "", max: "" })} />
            </Badge>
          )}
        </motion.div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="in-stock">In Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <ProductsTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortConfig={sortConfig}
            onSort={requestSort}
          />
        </TabsContent>
        <TabsContent value="in-stock" className="mt-4">
          <ProductsTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortConfig={sortConfig}
            onSort={requestSort}
          />
        </TabsContent>
        <TabsContent value="out-of-stock" className="mt-4">
          <ProductsTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortConfig={sortConfig}
            onSort={requestSort}
          />
        </TabsContent>
      </Tabs>

      <SyncManager />
      <GlobalSyncIndicator />
    </div>
  )
}

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  sortConfig: {
    key: keyof Product | null
    direction: "ascending" | "descending"
  }
  onSort: (key: keyof Product) => void
}

function ProductsTable({ products, onEdit, onDelete, sortConfig, onSort }: ProductsTableProps) {
  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDownIcon className="ml-1 h-4 w-4" />
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpDownIcon className="ml-1 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDownIcon className="ml-1 h-4 w-4 text-primary rotate-180" />
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <AlertCircleIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-center text-muted-foreground">No products found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Products</CardTitle>
        <CardDescription>
          {products.length} products • Total value: $
          {products.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => onSort("name")}>
                <div className="flex items-center">Name {getSortIcon("name")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => onSort("sku")}>
                <div className="flex items-center">SKU {getSortIcon("sku")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => onSort("category")}>
                <div className="flex items-center">Category {getSortIcon("category")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => onSort("price")}>
                <div className="flex items-center">Price {getSortIcon("price")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => onSort("quantity")}>
                <div className="flex items-center">Quantity {getSortIcon("quantity")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => onSort("vendor")}>
                <div className="flex items-center">Vendor {getSortIcon("vendor")}</div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {products.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-muted-foreground" />
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.quantity === 0 ? "destructive" : product.quantity < 10 ? "outline" : "default"}
                    >
                      {product.quantity}
                    </Badge>
                    {product.syncStatus === "pending" && (
                      <Badge variant="outline" className="ml-2">
                        Pending Sync
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.vendor || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between py-4">
        <div className="text-xs text-muted-foreground">Showing {products.length} products</div>
      </CardFooter>
    </Card>
  )
}

