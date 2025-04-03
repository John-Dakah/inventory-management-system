"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  SearchIcon,
  ArrowUpDownIcon,
  Loader2Icon,
  PackageIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XIcon,
  SlidersHorizontalIcon,
  MapPinIcon,
  TagIcon,
  BoxIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Import the enhanced Table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table2"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SyncManager } from "@/components/sync-manager"
import { getProducts } from "@/lib/product-service"
import { updateProductQuantity } from "@/lib/stock-service"
import { initializeDatabase } from "@/lib/db-utils"
import { toast } from "@/components/ui/use-toast"
import type { Product } from "@/types"

export default function StockManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add")
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1)
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStockInDialogOpen, setIsStockInDialogOpen] = useState(false)
  const [isStockOutDialogOpen, setIsStockOutDialogOpen] = useState(false)
  const [stockInLocation, setStockInLocation] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [isCustomLocation, setIsCustomLocation] = useState(false)
  const [stockInReference, setStockInReference] = useState("")
  const [stockInNotes, setStockInNotes] = useState("")
  const [stockOutQuantity, setStockOutQuantity] = useState(1)
  const [stockOutReference, setStockOutReference] = useState("")
  const [stockOutNotes, setStockOutNotes] = useState("")
  const [warehouseLocations, setWarehouseLocations] = useState<string[]>([
    "Warehouse A",
    "Warehouse B",
    "Warehouse C",
    "Storage Room 1",
    "Storage Room 2",
  ])

  const customLocationInputRef = useRef<HTMLInputElement>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [productLocations, setProductLocations] = useState<Record<string, string>>({})

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

  // Focus custom location input when it appears
  useEffect(() => {
    if (isCustomLocation && customLocationInputRef.current) {
      customLocationInputRef.current.focus()
    }
  }, [isCustomLocation])

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const productData = await getProducts()

        // Ensure location property is properly set for display
        const processedProducts = productData.map((product) => ({
          ...product,
          location: product.location || "", // Ensure location is never undefined
        }))

        setProducts(processedProducts)

        // Extract unique categories
        const uniqueCategories = [...new Set(processedProducts.map((p) => p.category).filter(Boolean))]
        setCategories(uniqueCategories)

        // Extract unique warehouse locations
        const locations = [...new Set(processedProducts.map((p) => p.location).filter(Boolean))]
        if (locations.length > 0) {
          setWarehouseLocations((prev) => [...new Set([...prev, ...locations])])
        }
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Add this useEffect at the top level of the StockManagementPage component
  // to load saved locations when the component mounts
  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const savedLocations = localStorage.getItem("productLocations")
        if (savedLocations) {
          const locations = JSON.parse(savedLocations)
          setProductLocations(locations)

          // Apply saved locations to products
          setProducts((prevProducts) =>
            prevProducts.map((product) => {
              if (locations[product.id]) {
                return {
                  ...product,
                  location: locations[product.id],
                }
              }
              return product
            }),
          )
        }
      } catch (error) {
        console.error("Error loading saved locations:", error)
      }
    }

    loadSavedLocations()
  }, [])

  // Filter products based on search, tab, and category
  useEffect(() => {
    let filtered = [...products]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term),
      )
    }

    // Apply tab filter
    if (activeTab === "low-stock") {
      filtered = filtered.filter((product) => product.quantity > 0 && product.quantity <= 5)
    } else if (activeTab === "out-of-stock") {
      filtered = filtered.filter((product) => product.quantity === 0)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, activeTab, categoryFilter])

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product)
    setAdjustmentType("add")
    setAdjustmentQuantity(1)
    setAdjustmentReason("")
    setIsAdjustDialogOpen(true)
  }

  const handleSubmitAdjustment = async () => {
    if (!selectedProduct) return

    setIsSubmitting(true)
    try {
      const change = adjustmentType === "add" ? adjustmentQuantity : -adjustmentQuantity

      // Update product quantity
      const updatedProduct = await updateProductQuantity(
        selectedProduct.id,
        change,
        adjustmentReason,
        selectedProduct.location, // Preserve the location
      )

      if (updatedProduct) {
        // Update local state with preserved location
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === updatedProduct.id
              ? {
                  ...updatedProduct,
                  location: selectedProduct.location, // Explicitly preserve the location
                }
              : p,
          ),
        )

        toast({
          title: "Stock Updated",
          description: `${selectedProduct.name} stock has been ${adjustmentType === "add" ? "increased" : "decreased"} by ${adjustmentQuantity}.`,
        })
      }

      setIsAdjustDialogOpen(false)
    } catch (error) {
      console.error("Error adjusting stock:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the handleStockIn function to dispatch a custom event for location updates
  const handleStockIn = async () => {
    if (!selectedProduct) return

    // Determine the final location to use
    const finalLocation = isCustomLocation ? customLocation : stockInLocation

    if (!finalLocation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select or enter a warehouse location.",
      })
      return
    }

    // Add the new location to the list if it's not already there
    if (!warehouseLocations.includes(finalLocation)) {
      setWarehouseLocations((prev) => [...prev, finalLocation])
    }

    setIsSubmitting(true)
    try {
      // Only update the location without changing quantity
      const updatedProduct = {
        ...selectedProduct,
        location: finalLocation,
        lastUpdated: new Date().toISOString(),
      }

      // Save the updated product with location
      // We're using 0 as quantity change to not affect the actual quantity
      const savedProduct = await updateProductQuantity(
        selectedProduct.id,
        0,
        `Assigned to warehouse: ${stockInReference} - ${stockInNotes}`,
        finalLocation,
      )

      if (savedProduct) {
        // Update local state with the new location
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === savedProduct.id
              ? {
                  ...savedProduct,
                  location: finalLocation, // Ensure location is updated in the UI
                }
              : p,
          ),
        )

        // Dispatch a custom event to notify other components about the location update
        const locationUpdateEvent = new CustomEvent("product-location-updated", {
          detail: {
            productId: selectedProduct.id,
            location: finalLocation,
          },
        })
        window.dispatchEvent(locationUpdateEvent)

        // Also save to localStorage for persistence across page refreshes
        try {
          const savedLocations = localStorage.getItem("productLocations") || "{}"
          const locations = JSON.parse(savedLocations)
          locations[selectedProduct.id] = finalLocation
          localStorage.setItem("productLocations", JSON.stringify(locations))
        } catch (error) {
          console.error("Error saving location to localStorage:", error)
        }

        toast({
          title: "Stock Assigned",
          description: `${selectedProduct.name} assigned to ${finalLocation}.`,
        })
      }

      setIsStockInDialogOpen(false)
      resetStockInForm()
    } catch (error) {
      console.error("Error assigning stock:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStockOut = async () => {
    if (!selectedProduct) return

    if (stockOutQuantity > selectedProduct.quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot remove more units than available in stock.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Update product quantity
      const locationInfo = selectedProduct.location ? `from ${selectedProduct.location}` : ""
      const updatedProduct = await updateProductQuantity(
        selectedProduct.id,
        -stockOutQuantity,
        `Stock Out ${locationInfo}: ${stockOutReference} - ${stockOutNotes}`,
        selectedProduct.location, // Preserve the location
      )

      if (updatedProduct) {
        // Update local state - ensure location is preserved
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === updatedProduct.id
              ? {
                  ...updatedProduct,
                  location: selectedProduct.location, // Explicitly preserve the location
                }
              : p,
          ),
        )

        const locationMsg = selectedProduct.location ? `from ${selectedProduct.location}` : ""
        toast({
          title: "Stock Out Recorded",
          description: `${stockOutQuantity} units of ${selectedProduct.name} removed ${locationMsg}.`,
        })
      }

      setIsStockOutDialogOpen(false)
      resetStockOutForm()
    } catch (error) {
      console.error("Error removing stock:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetStockInForm = () => {
    setStockInLocation("")
    setCustomLocation("")
    setIsCustomLocation(false)
    setStockInReference("")
    setStockInNotes("")
  }

  const resetStockOutForm = () => {
    setStockOutQuantity(1)
    setStockOutReference("")
    setStockOutNotes("")
  }

  const openStockInDialog = (product: Product) => {
    setSelectedProduct(product)
    setStockInLocation(product.location || "")
    setIsCustomLocation(false)
    setCustomLocation("")
    setIsStockInDialogOpen(true)
  }

  const openStockOutDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsStockOutDialogOpen(true)
  }

  const handleLocationChange = (value: string) => {
    if (value === "custom") {
      setIsCustomLocation(true)
      setStockInLocation("custom")
      setCustomLocation("")
    } else {
      setIsCustomLocation(false)
      setStockInLocation(value)
    }
  }

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Manage and adjust inventory stock levels</p>
        </div>
      </div>

      <SyncManager />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <StockTable
            products={filteredProducts}
            onAdjustStock={handleAdjustStock}
            openStockInDialog={openStockInDialog}
            openStockOutDialog={openStockOutDialog}
            productLocations={productLocations}
          />
        </TabsContent>
        <TabsContent value="low-stock" className="mt-4">
          <StockTable
            products={filteredProducts}
            onAdjustStock={handleAdjustStock}
            openStockInDialog={openStockInDialog}
            openStockOutDialog={openStockOutDialog}
            productLocations={productLocations}
          />
        </TabsContent>
        <TabsContent value="out-of-stock" className="mt-4">
          <StockTable
            products={filteredProducts}
            onAdjustStock={handleAdjustStock}
            openStockInDialog={openStockInDialog}
            openStockOutDialog={openStockOutDialog}
            productLocations={productLocations}
          />
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>Update the stock quantity for {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <BoxIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedProduct?.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-1 text-sm">
                <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">SKU: {selectedProduct?.sku}</span>
              </div>
              {selectedProduct?.location && (
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Location: {selectedProduct.location}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-stock" className="text-right">
                Current Stock
              </Label>
              <div className="col-span-3">
                <Input id="current-stock" value={selectedProduct?.quantity || 0} disabled />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustment-type" className="text-right">
                Adjustment
              </Label>
              <div className="col-span-3">
                <Select value={adjustmentType} onValueChange={(value: "add" | "remove") => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <div className="col-span-3">
                <Input
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Reason for adjustment"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdjustment} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock In Dialog */}
      <Dialog open={isStockInDialogOpen} onOpenChange={setIsStockInDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign to Warehouse</DialogTitle>
            <DialogDescription>Assign inventory to warehouse location</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <BoxIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedProduct?.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-1 text-sm">
                <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">SKU: {selectedProduct?.sku}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current Inventory: </span>
                <Badge
                  variant={
                    selectedProduct?.quantity === 0
                      ? "destructive"
                      : selectedProduct?.quantity <= 5
                        ? "outline"
                        : "default"
                  }
                >
                  {selectedProduct?.quantity || 0}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-in" className="text-right">
                Warehouse
              </Label>
              <div className="col-span-3">
                {isCustomLocation ? (
                  <div className="space-y-2">
                    <Input
                      ref={customLocationInputRef}
                      placeholder="Enter new location name"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      autoFocus
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCustomLocation(false)
                        setStockInLocation("")
                      }}
                      className="w-full"
                    >
                      Cancel Custom Location
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={stockInLocation} onValueChange={handleLocationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse location" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouseLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Add New Location...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference-in" className="text-right">
                Reference
              </Label>
              <div className="col-span-3">
                <Input
                  id="reference-in"
                  value={stockInReference}
                  onChange={(e) => setStockInReference(e.target.value)}
                  placeholder="PO-12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes-in" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Input
                  id="notes-in"
                  value={stockInNotes}
                  onChange={(e) => setStockInNotes(e.target.value)}
                  placeholder="Additional information"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockInDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStockIn}
              disabled={isSubmitting || (isCustomLocation ? !customLocation : !stockInLocation)}
            >
              {isSubmitting ? "Processing..." : "Assign to Warehouse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={isStockOutDialogOpen} onOpenChange={setIsStockOutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stock Out</DialogTitle>
            <DialogDescription>Remove stock from warehouse</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <BoxIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedProduct?.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-1 text-sm">
                <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">SKU: {selectedProduct?.sku}</span>
              </div>
              {selectedProduct?.location && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Location: {selectedProduct.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Available in Warehouse: </span>
                <Badge
                  variant={
                    selectedProduct?.quantity === 0
                      ? "destructive"
                      : selectedProduct?.quantity <= 5
                        ? "outline"
                        : "default"
                  }
                >
                  {selectedProduct?.quantity || 0}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity-out" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3">
                <Input
                  id="quantity-out"
                  type="number"
                  min="1"
                  max={selectedProduct?.quantity || 1}
                  value={stockOutQuantity}
                  onChange={(e) => setStockOutQuantity(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference-out" className="text-right">
                Reference
              </Label>
              <div className="col-span-3">
                <Input
                  id="reference-out"
                  value={stockOutReference}
                  onChange={(e) => setStockOutReference(e.target.value)}
                  placeholder="SO-12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes-out" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Input
                  id="notes-out"
                  value={stockOutNotes}
                  onChange={(e) => setStockOutNotes(e.target.value)}
                  placeholder="Additional information"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockOutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockOut} disabled={isSubmitting || selectedProduct?.quantity === 0}>
              {isSubmitting ? "Processing..." : "Remove from Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

interface StockTableProps {
  products: Product[]
  onAdjustStock: (product: Product) => void
  openStockInDialog: (product: Product) => void
  openStockOutDialog: (product: Product) => void
  productLocations: Record<string, string>
}

// Update the StockTable component to use the enhanced location persistence
function StockTable({
  products,
  onAdjustStock,
  openStockInDialog,
  openStockOutDialog,
  productLocations,
}: StockTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

  // Add state to track location updates
  const [locationUpdates, setLocationUpdates] = useState<Record<string, string>>({});

  // Load saved locations from localStorage when component mounts
  useEffect(() => {
    try {
      const savedLocations = localStorage.getItem("productLocations");
      if (savedLocations) {
        setLocationUpdates(JSON.parse(savedLocations));
      }
    } catch (error) {
      console.error("Error loading saved locations:", error);
    }
  }, []);

  // Update localStorage whenever locations change
  useEffect(() => {
    if (Object.keys(locationUpdates).length > 0) {
      localStorage.setItem("productLocations", JSON.stringify(locationUpdates));
    }
  }, [locationUpdates]);

  // Subscribe to custom events for location updates
  useEffect(() => {
    const handleLocationUpdate = (event: CustomEvent) => {
      const { productId, location } = event.detail;
      if (productId && location) {
        setLocationUpdates((prev) => ({
          ...prev,
          [productId]: location,
        }));
      }
    };

    // Add event listener for location updates
    window.addEventListener("product-location-updated", handleLocationUpdate as EventListener);

    // Clean up
    return () => {
      window.removeEventListener("product-location-updated", handleLocationUpdate as EventListener);
    };
  }, []); // <-- This hook is now always called, ensuring consistent hook order

  // Handle sorting
  const requestSort = (key: keyof Product) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDownIcon className="ml-1 h-4 w-4" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpDownIcon className="ml-1 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDownIcon className="ml-1 h-4 w-4 text-primary rotate-180" />
    );
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <PackageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-center text-muted-foreground">No products found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Inventory Stock</CardTitle>
        <CardDescription>Manage stock levels for {products.length} products</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                <div className="flex items-center">Product {getSortIcon("name")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("sku")}>
                <div className="flex items-center">SKU {getSortIcon("sku")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("category")}>
                <div className="flex items-center">Category {getSortIcon("category")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("quantity")}>
                <div className="flex items-center">Current Stock {getSortIcon("quantity")}</div>
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    {product.name}
                  </div>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.quantity === 0
                        ? "destructive"
                        : product.quantity <= 5
                        ? "outline"
                        : "default"
                    }
                  >
                    {product.quantity}
                  </Badge>
                </TableCell>
                <TableCell>
                  {productLocations[product.id] || "Not assigned"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStockInDialog(product)}
                      className="h-8 px-2 py-0"
                    >
                      <ArrowDownIcon className="h-3.5 w-3.5 mr-1" />
                      In
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStockOutDialog(product)}
                      className="h-8 px-2 py-0"
                    >
                      <ArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                      Out
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustStock(product)}
                      className="h-8 px-2 py-0"
                    >
                      <SlidersHorizontalIcon className="h-3.5 w-3.5 mr-1" />
                      Adjust
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}