"use client"

import type React from "react"
import { useState, useEffect,useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
 import { Slider } from "@/components/ui/slider"
import type { ProductFilter } from "@/app/actions/product-actions"
import { useDebounce } from "@/hooks/use-debounce"
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFilters((prev) => ({ ...prev, search: e.target.value }));
};
interface ProductFiltersProps {
  categories: string[]
  vendors: string[]
  onFilterChange: (filters: ProductFilter) => void
}
const searchParams = useSearchParams()

const [filters, setFilters] = useState<ProductFilter>({
  search: searchParams.get("search") || "",
  category: searchParams.get("category") || undefined,
  vendor: searchParams.get("vendor") || undefined,
  minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
  maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
  inStock: searchParams.get("inStock") === "true",
});

export function ProductFilters({ categories, vendors, onFilterChange }: ProductFiltersProps) {
  const router = useRouter()
 
  

  const debouncedSearch = useDebounce(filters.search, 300)

 

  
  // ✅ Only update the URL when filters change, but avoid reinitialization
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Skip the first render
      return;
    }
  
    const params = new URLSearchParams();
  
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.vendor) params.set("vendor", filters.vendor);
    if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.inStock) params.set("inStock", "true");
  
    router.replace(`?${params.toString()}`); // Update URL without reloading
  }, [filters]);

    // Call the parent's filter change handler
    onFilterChange({
      ...filters,
      search: debouncedSearch as string,
    })
  ;
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice || 0, filters.maxPrice || 1000])
  const isFirstRender = useRef(true); 
  // Debounce search input to avoid too many requests
 
  // [debouncedSearch, filters.category, filters.vendor, filters.minPrice, filters.maxPrice, filters.inStock, filters])

  // Handle search input change
 

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value || undefined }))
  }

  // Handle vendor change
  const handleVendorChange = (value: string) => {
    setFilters((prev) => ({ ...prev, vendor: value || undefined }))
  }

  // Handle price range change
  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }))
  }

  // Handle in-stock toggle
  const handleInStockChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, inStock: checked }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      category: undefined,
      vendor: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
    })
    setPriceRange([0, 1000])
    router.push("/inventory")
  }

  // Check if any filters are active
  const hasActiveFilters =
    !!filters.search ||
    !!filters.category ||
    !!filters.vendor ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name, SKU, or description..."
          className="pl-8"
          // value={filters.search || "          "}
          value={filters.search ?? ""}

          onChange={handleSearchChange}
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7"
            onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filter Products</SheetTitle>
            <SheetDescription>Narrow down your product list with filters</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category || ""} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
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

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={filters.vendor || ""} onValueChange={handleVendorChange}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Price Range</Label>
                <span className="text-sm text-muted-foreground">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>
              <Slider
                defaultValue={[0, 1000]}
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={handlePriceChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="in-stock" checked={filters.inStock} onCheckedChange={handleInStockChange} />
              <Label htmlFor="in-stock">In Stock Only</Label>
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" onClick={clearFilters}>
                Reset Filters
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}

