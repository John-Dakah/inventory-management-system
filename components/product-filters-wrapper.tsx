"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductFilters } from "@/components/product-filters"
import { type ProductFilter, getProducts } from "@/app/actions/product-actions"

export function ProductFiltersWrapper() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get categories and vendors from server component
  const [categories, setCategories] = useState<string[]>([])
  const [vendors, setVendors] = useState<string[]>([])

  // Fetch categories and vendors on mount
  useState(() => {
    const fetchFilters = async () => {
      const { categories, vendors } = await getProducts()
      if (categories) setCategories(categories)
      if (vendors) setVendors(vendors)
    }

    fetchFilters()
  })

  const handleFilterChange = (filters: ProductFilter) => {
    startTransition(() => {
      // This will trigger a re-render with the new filters
      // The actual filtering happens on the server
      router.refresh()
    })
  }

  return <ProductFilters categories={categories} vendors={vendors} onFilterChange={handleFilterChange} />
}

