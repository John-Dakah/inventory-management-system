"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  PackageOpen,
  Edit,
  Trash2,
  Loader2,
  FileUp,
  Download,
  Percent,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import { getProducts, saveProduct } from "@/lib/db"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    image: "/placeholder.svg?height=200&width=200",
  })

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const loadedProducts = await getProducts()
        setProducts(loadedProducts)
        setFilteredProducts(loadedProducts)
      } catch (error) {
        console.error("Error loading products:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
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
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    // Tab filter
    if (activeTab !== "all") {
      if (activeTab === "in-stock") {
        results = results.filter((product) => product.quantity > 0)
      } else if (activeTab === "out-of-stock") {
        results = results.filter((product) => product.quantity === 0)
      } else if (activeTab === "low-stock") {
        results = results.filter((product) => product.quantity > 0 && product.quantity <= 10)
      }
    }

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter((product) => selectedCategories.includes(product.category))
    }

    // Price range filter
    if (priceRange.min && !isNaN(Number(priceRange.min))) {
      results = results.filter((product) => product.price >= Number(priceRange.min))
    }
    if (priceRange.max && !isNaN(Number(priceRange.max))) {
      results = results.filter((product) => product.price <= Number(priceRange.max))
    }

    setFilteredProducts(results)
  }, [searchTerm, activeTab, selectedCategories, priceRange, products])

  // Extract unique categories
  const categories = [...new Set(products.map((product) => product.category))].filter(Boolean)

  // Handle category checkbox changes
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setPriceRange({ min: "", max: "" })
    setActiveTab("all")
    setIsFilterOpen(false)
  }

  // Handle product form submission
  const handleProductSubmit = async (e) => {
    e.preventDefault()

    try {
      const newProduct = {
        ...productForm,
        id: selectedProduct ? selectedProduct.id : Date.now().toString(),
        price: Number.parseFloat(productForm.price),
        quantity: Number.parseInt(productForm.quantity, 10),
        createdAt: selectedProduct ? selectedProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to database
      await saveProduct(newProduct)

      // Update local state
      if (selectedProduct) {
        setProducts((prev) => prev.map((p) => (p.id === newProduct.id ? newProduct : p)))
        toast({
          title: "Product Updated",
          description: `${newProduct.name} has been successfully updated.`,
          duration: 3000,
        })
        setIsEditProductOpen(false)
      } else {
        setProducts((prev) => [newProduct, ...prev])
        toast({
          title: "Product Added",
          description: `${newProduct.name} has been successfully added to your inventory.`,
          duration: 3000,
        })
        setIsAddProductOpen(false)
      }

      // Reset form
      setProductForm({
        name: "",
        sku: "",
        description: "",
        price: "",
        category: "",
        quantity: "",
        image: "/placeholder.svg?height=200&width=200",
      })
      setSelectedProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product. Please try again.",
      })
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async (product) => {
    try {
      // In a real app, this would call an API to delete the product
      // For now, we'll just update the local state
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      toast({
        title: "Product Deleted",
        description: `${product.name} has been removed from your inventory.`,
        duration: 3000,
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

  // Handle import/export
  const handleImportExport = async (action) => {
    if (action === "import") {
      setIsImporting(true)
      try {
        // In a real app, this would open a file dialog and process the imported file
        await new Promise((resolve) => setTimeout(resolve, 1500))
        toast({
          title: "Import Successful",
          description: "Products have been imported successfully.",
          duration: 3000,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "There was an error importing products.",
        })
      } finally {
        setIsImporting(false)
      }
    } else if (action === "export") {
      setIsExporting(true)
      try {
        // In a real app, this would generate and download a file
        const exportData = JSON.stringify(products, null, 2)
        const blob = new Blob([exportData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "products-export.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Export Successful",
          description: "Products have been exported successfully.",
          duration: 3000,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: "There was an error exporting products.",
        })
      } finally {
        setIsExporting(false)
      }
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your sales product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isImporting ? "Importing..." : isExporting ? "Exporting..." : "Import/Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleImportExport("import")} disabled={isImporting || isExporting}>
                <FileUp className="mr-2 h-4 w-4" />
                <span>Import Products</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleImportExport("export")} disabled={isImporting || isExporting}>
                <Download className="mr-2 h-4 w-4" />
                <span>Export Products</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details to add a new product to your catalog.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL or leave as default for a placeholder image
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update the details of your product.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Product Name</Label>
                      <Input
                        id="edit-name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-sku">SKU</Label>
                      <Input
                        id="edit-sku"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price">Price ($)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Input
                        id="edit-category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quantity">Quantity</Label>
                      <Input
                        id="edit-quantity"
                        type="number"
                        min="0"
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-image">Image URL</Label>
                    <Input
                      id="edit-image"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Update Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="in-stock">In Stock</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs" variant="secondary">
                    {selectedCategories.length + (priceRange.min || priceRange.max ? 1 : 0)}
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

                <div className="grid gap-2">
                  <h5 className="text-sm font-medium">Price Range</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-price" className="sr-only">
                        Minimum Price
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        min="0"
                        placeholder="Min $"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="sr-only">
                        Maximum Price
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        min="0"
                        placeholder="Max $"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="mb-2 text-sm font-medium">Categories</h5>
                  <div className="max-h-[200px] space-y-2 overflow-y-auto">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No categories available</p>
                    )}
                  </div>
                </div>

                <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Sort
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Price (Low to High)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Price (High to Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Oldest First</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg?height=200&width=200"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                  </div>
                  {product.category && (
                    <Badge variant="secondary" className="mt-2">
                      {product.category}
                    </Badge>
                  )}
                  <div className="mt-2 flex items-center">
                    <PackageOpen className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span
                      className={
                        product.quantity === 0
                          ? "text-red-500"
                          : product.quantity <= 10
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      }
                    >
                      {product.quantity === 0
                        ? "Out of stock"
                        : product.quantity <= 10
                          ? `Low stock (${product.quantity})`
                          : `${product.quantity} in stock`}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product)
                      setProductForm({
                        name: product.name,
                        sku: product.sku,
                        description: product.description || "",
                        price: product.price.toString(),
                        category: product.category || "",
                        quantity: product.quantity.toString(),
                        image: product.image || "/placeholder.svg?height=200&width=200",
                      })
                      setIsEditProductOpen(true)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          // View product details
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // Create a sale/discount for this product
                        }}
                      >
                        <Percent className="mr-2 h-4 w-4" />
                        Add Discount
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <PackageOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or add new products.</p>
            <Button className="mt-4" onClick={() => setIsAddProductOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      <SyncManager />
    </div>
  )
}

