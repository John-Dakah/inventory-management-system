"use client"

import { useState, useEffect } from "react"
import {
  SearchIcon,
  PlusIcon,
  PackageIcon,
  EditIcon,
  TrashIcon,
  ArrowUpDownIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define the Product type based on your Prisma schema
type Product = {
  id: string
  name: string
  description: string | null
  sku: string
  price: number
  quantity: number
  category: string | null
  vendor: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  status: string // This is calculated based on quantity
}

export default function ProductsClient() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (categoryFilter !== "All") params.append("category", categoryFilter)
        if (statusFilter !== "All") params.append("status", statusFilter)

        const response = await fetch(`/api/products?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch products")

        const result = await response.json()
        const productList: Product[] = Array.isArray(result)
          ? result
          : Array.isArray(result.products)
          ? result.products
          : []

        setProducts(productList)

        if (categoryFilter === "All") {
          const uniqueCategories = [
            "All",
            ...Array.from(new Set(productList.map((p) => p.category).filter((c): c is string => c !== null))),
          ]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, categoryFilter, statusFilter, toast])

  if (!hasPermission("view_products")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <PackageIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        {hasPermission("manage_products") && (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>{products.length} products found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-full"
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
                      {category || "Uncategorized"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  {hasPermission("manage_products") && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={hasPermission("manage_products") ? 7 : 6}
                      className="text-center py-4"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category || "Uncategorized"}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            product.status === "In Stock"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : product.status === "Low Stock"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      {hasPermission("manage_products") && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowUpDownIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={hasPermission("manage_products") ? 7 : 6}
                      className="text-center py-4"
                    >
                      No products found
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
