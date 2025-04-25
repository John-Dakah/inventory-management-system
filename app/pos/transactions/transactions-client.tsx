"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import {
  SearchIcon,
  ReceiptIcon,
  CalendarIcon,
  FilterIcon,
  EyeIcon,
  PrinterIcon,
  XCircleIcon,
  Loader2Icon,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

// Transaction type
interface Transaction {
  id: string
  date: Date
  customer: string
  customerId?: string
  items: number
  total: number
  paymentMethod: string
  status: string
  cashier: string
}

// Transaction item type
interface TransactionItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
}

// Transaction details type
interface TransactionDetails {
  id: string
  date: Date
  customer: string
  customerId?: string
  items: TransactionItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  status: string
  cashier: string
  notes?: string
}

export default function TransactionsClient() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [viewTransactionId, setViewTransactionId] = useState<string | null>(null)
  const [isVoiding, setIsVoiding] = useState(false)
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [voidReason, setVoidReason] = useState("")

  // State for transactions and loading
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Fetch transactions on mount and when filters change
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        // Build query params
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (statusFilter !== "All") params.append("status", statusFilter)
        if (paymentMethodFilter !== "All") params.append("paymentMethod", paymentMethodFilter)
        if (dateFilter) params.append("date", dateFilter.toISOString())

        const response = await fetch(`/api/transactions?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch transactions")

        const data = await response.json()

        // Parse dates
        setTransactions(
          data.map((t: any) => ({
            ...t,
            date: new Date(t.date),
          })),
        )
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [searchQuery, statusFilter, paymentMethodFilter, dateFilter, toast])

  // Fetch transaction details when viewing a transaction
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!viewTransactionId) return

      setLoadingDetails(true)
      try {
        const response = await fetch(`/api/transactions/${viewTransactionId}`)
        if (!response.ok) throw new Error("Failed to fetch transaction details")

        const data = await response.json()

        // Parse dates
        setTransactionDetails({
          ...data,
          date: new Date(data.date),
        })
      } catch (error) {
        console.error("Error fetching transaction details:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction details. Please try again.",
          variant: "destructive",
        })
        setViewTransactionId(null)
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchTransactionDetails()
  }, [viewTransactionId, toast])

  // Check if user has permission to access this page
  if (!hasPermission("view_sales_history")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <ReceiptIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  // Handle void transaction
  const handleVoidTransaction = async () => {
    if (!selectedTransactionId) return

    setIsVoiding(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: selectedTransactionId,
          reason: voidReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to void transaction")
      }

      const data = await response.json()

      toast({
        title: "Transaction Voided",
        description: `Transaction ${selectedTransactionId} has been voided.`,
      })

      // Update transaction in the list
      setTransactions((prev) => prev.map((t) => (t.id === selectedTransactionId ? { ...t, status: "Voided" } : t)))

      // Update transaction details if currently viewing
      if (viewTransactionId === selectedTransactionId) {
        setTransactionDetails((prev) => (prev ? { ...prev, status: "Voided" } : null))
      }
    } catch (error) {
      console.error("Error voiding transaction:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to void transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoiding(false)
      setVoidDialogOpen(false)
      setSelectedTransactionId(null)
      setVoidReason("")
    }
  }

  // Print receipt
  const handlePrintReceipt = (transactionId: string) => {
    // In a real app, this would open a print dialog or generate a PDF
    toast({
      title: "Print Receipt",
      description: `Printing receipt for transaction ${transactionId}...`,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage sales transactions</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>{transactions.length} transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID or customer..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[150px] justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Voided">Voided</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{format(transaction.date, "MMM d, yyyy h:mm a")}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell className="text-right">{transaction.items}</TableCell>
                      <TableCell className="text-right">${transaction.total.toFixed(2)}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === "Completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FilterIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewTransactionId(transaction.id)}>
                              <EyeIcon className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintReceipt(transaction.id)}>
                              <PrinterIcon className="mr-2 h-4 w-4" />
                              Print Receipt
                            </DropdownMenuItem>
                            {hasPermission("void_transactions") && transaction.status !== "Voided" && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedTransactionId(transaction.id)
                                  setVoidDialogOpen(true)
                                }}
                              >
                                <XCircleIcon className="mr-2 h-4 w-4" />
                                Void Transaction
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!viewTransactionId} onOpenChange={(open) => !open && setViewTransactionId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {transactionDetails && format(transactionDetails.date, "MMMM d, yyyy h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="py-8 flex justify-center">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            transactionDetails && (
              <div className="py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="font-medium">{transactionDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant="outline"
                        className={
                          transactionDetails.status === "Completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {transactionDetails.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{transactionDetails.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cashier</p>
                      <p className="font-medium">{transactionDetails.cashier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{transactionDetails.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-medium">${transactionDetails.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-2">Items</p>
                    <div className="space-y-2">
                      {transactionDetails.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity} x {item.name}
                          </span>
                          <span>${item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${transactionDetails.subtotal.toFixed(2)}</span>
                    </div>
                    {transactionDetails.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${transactionDetails.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${transactionDetails.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${transactionDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTransactionId(null)}>
              Close
            </Button>
            <Button onClick={() => handlePrintReceipt(viewTransactionId!)}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Transaction Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Void Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to void this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center font-medium mb-4">Transaction ID: {selectedTransactionId}</p>
            <div className="space-y-2">
              <Label htmlFor="void-reason">Reason for voiding (optional)</Label>
              <Textarea
                id="void-reason"
                placeholder="Enter reason for voiding this transaction"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)} disabled={isVoiding}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleVoidTransaction} disabled={isVoiding}>
              {isVoiding ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Voiding...
                </>
              ) : (
                <>
                  <XCircleIcon className="mr-2 h-4 w-4" />
                  Void Transaction
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

