"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  SearchIcon,
  FilterIcon,
  Loader2Icon,
  ArrowDownIcon,
  ArrowUpIcon,
  SlidersHorizontalIcon,
  XIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  ChevronDownIcon,
  CalendarIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"
import { getStockTransactions, getStockItems, type StockTransaction, type StockItem } from "@/lib/db"

export default function WarehouseTransactionsPage() {
  const [transactions, setTransactions] = useState<(StockTransaction & { itemName: string })[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<(StockTransaction & { itemName: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true)

        // Get all transactions
        const allTransactions = await getStockTransactions()

        // Get all stock items to map names
        const stockItems = await getStockItems()
        const stockItemMap = new Map<string, StockItem>()
        stockItems.forEach((item) => stockItemMap.set(item.id, item))

        // Combine transactions with item names
        const transactionsWithNames = allTransactions.map((transaction) => {
          const stockItem = stockItemMap.get(transaction.stockItemId)
          return {
            ...transaction,
            itemName: stockItem ? stockItem.name : "Unknown Item",
          }
        })

        // Sort by date (newest first)
        transactionsWithNames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setTransactions(transactionsWithNames)
        setFilteredTransactions(transactionsWithNames)
      } catch (error) {
        console.error("Error loading transactions:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load transaction history. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  // Apply filters
  useEffect(() => {
    let results = [...transactions]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (transaction) =>
          transaction.itemName.toLowerCase().includes(term) ||
          transaction.location.toLowerCase().includes(term) ||
          (transaction.reference && transaction.reference.toLowerCase().includes(term)) ||
          (transaction.notes && transaction.notes.toLowerCase().includes(term)),
      )
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      results = results.filter((transaction) => selectedTypes.includes(transaction.type))
    }

    // Apply location filter
    if (selectedLocations.length > 0) {
      results = results.filter((transaction) => selectedLocations.includes(transaction.location))
    }

    // Apply date range filter
    if (dateRange.from) {
      results = results.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        return transactionDate >= dateRange.from!
      })
    }
    if (dateRange.to) {
      results = results.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        return transactionDate <= dateRange.to!
      })
    }

    setFilteredTransactions(results)
  }, [transactions, searchTerm, selectedTypes, selectedLocations, dateRange])

  // Get unique locations for filters
  const locations = [...new Set(transactions.map((t) => t.location))]

  // Handle checkbox changes
  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTypes([])
    setSelectedLocations([])
    setDateRange({ from: undefined, to: undefined })
    setIsFilterOpen(false)
  }

  // Handle export
  const handleExport = async (format: string) => {
    setIsExporting(true)
    setExportFormat(format)

    try {
      // Create export data
      const exportData = filteredTransactions.map((transaction) => ({
        ID: transaction.id,
        Item: transaction.itemName,
        Type: transaction.type === "in" ? "Stock In" : transaction.type === "out" ? "Stock Out" : "Adjustment",
        Quantity: transaction.quantity,
        PreviousQuantity: transaction.previousQuantity,
        NewQuantity: transaction.newQuantity,
        Location: transaction.location,
        Reference: transaction.reference || "",
        Notes: transaction.notes || "",
        Date: new Date(transaction.createdAt).toLocaleString(),
      }))

      let filename = ""
      let content = ""
      let type = ""

      switch (format) {
        case "csv":
          filename = `transaction-history-${new Date().toISOString().split("T")[0]}.csv`

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
          filename = `transaction-history-${new Date().toISOString().split("T")[0]}.json`
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
    selectedTypes.length > 0,
    selectedLocations.length > 0,
    dateRange.from || dateRange.to,
  ].filter(Boolean).length

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return ""

    const fromStr = dateRange.from ? dateRange.from.toLocaleDateString() : "Any"
    const toStr = dateRange.to ? dateRange.to.toLocaleDateString() : "Any"

    return `${fromStr} to ${toStr}`
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground">View and track all inventory movements</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">View and track all inventory movements</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />

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
      </motion.div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
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
                  <h5 className="mb-2 text-sm font-medium">Transaction Type</h5>
                  <div className="space-y-2">
                    {["in", "out", "adjustment"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeChange(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                          {type === "in" ? "Stock In" : type === "out" ? "Stock Out" : "Adjustment"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Location</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {locations.map((location) => (
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
                  <h5 className="mb-2 text-sm font-medium">Date Range</h5>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from || dateRange.to ? formatDateRange() : <span>Pick a date range</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
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
          {selectedTypes.map((type) => (
            <Badge key={`badge-type-${type}`} variant="secondary" className="flex items-center gap-1">
              Type: {type === "in" ? "Stock In" : type === "out" ? "Stock Out" : "Adjustment"}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleTypeChange(type)} />
            </Badge>
          ))}

          {selectedLocations.map((location) => (
            <Badge key={`badge-location-${location}`} variant="secondary" className="flex items-center gap-1">
              Location: {location}
              <XIcon className="h-3 w-3 cursor-pointer" onClick={() => handleLocationChange(location)} />
            </Badge>
          ))}

          {(dateRange.from || dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {formatDateRange()}
              <XIcon
                className="h-3 w-3 cursor-pointer"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
              />
            </Badge>
          )}
        </motion.div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>{filteredTransactions.length} transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "in" ? "default" : transaction.type === "out" ? "destructive" : "outline"
                        }
                        className="flex w-24 items-center justify-center"
                      >
                        {transaction.type === "in" ? (
                          <>
                            <ArrowDownIcon className="mr-1 h-3 w-3" /> Stock In
                          </>
                        ) : transaction.type === "out" ? (
                          <>
                            <ArrowUpIcon className="mr-1 h-3 w-3" /> Stock Out
                          </>
                        ) : (
                          <>
                            <SlidersHorizontalIcon className="mr-1 h-3 w-3" /> Adjustment
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.itemName}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>{transaction.previousQuantity}</TableCell>
                    <TableCell>{transaction.newQuantity}</TableCell>
                    <TableCell>{transaction.location}</TableCell>
                    <TableCell>{transaction.reference || "—"}</TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>No transactions found.</p>
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
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardFooter>
      </Card>

      <SyncManager />
    </div>
  )
}

