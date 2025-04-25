"use client"

import { useState, useEffect } from "react"
import { DollarSignIcon, MinusIcon, CheckCircleIcon, Loader2Icon, SearchIcon, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Types for our data
interface CashDrawerStatus {
  isOpen: boolean
  openedAt: Date
  openingBalance: number
  currentBalance: number
  cashSales: number
  cardSales: number
  mobileSales: number
  expectedAmount: number
  cashPayouts: number
}

interface CashTransaction {
  id: string
  date: Date
  type: string
  amount: number
  reference: string
  notes: string
}

interface CashDrawerHistory {
  id: string
  date: Date
  openedAt: string
  closedAt: string
  openingBalance: number
  closingBalance: number
  difference: number
  status: string
  cashier: string
}

// Denomination values for cash counting
const DENOMINATIONS = [
  { name: "$100 Bills", value: 100 },
  { name: "$50 Bills", value: 50 },
  { name: "$20 Bills", value: 20 },
  { name: "$10 Bills", value: 10 },
  { name: "$5 Bills", value: 5 },
  { name: "$1 Bills", value: 1 },
  { name: "Quarters", value: 0.25 },
  { name: "Dimes", value: 0.1 },
  { name: "Nickels", value: 0.05 },
  { name: "Pennies", value: 0.01 },
]

export default function CashManagementClient() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState("drawer")
  const [openDrawerDialog, setOpenDrawerDialog] = useState(false)
  const [closeDrawerDialog, setCloseDrawerDialog] = useState(false)
  const [payoutDialog, setPayoutDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  // State for our data
  const [drawerStatus, setDrawerStatus] = useState<CashDrawerStatus | null>(null)
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [drawerHistory, setDrawerHistory] = useState<CashDrawerHistory[]>([])
  const [loading, setLoading] = useState(true)

  // Cash count state
  const [denominations, setDenominations] = useState<{ [key: string]: number }>(
    DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.name]: 0 }), {}),
  )

  // Payout state
  const [payoutAmount, setPayoutAmount] = useState("")
  const [payoutReason, setPayoutReason] = useState("")
  const [payoutReference, setPayoutReference] = useState("")

  // Fetch data from our API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/cash-drawer")
        if (!response.ok) {
          throw new Error("Failed to fetch cash drawer data")
        }

        const data = await response.json()
        setDrawerStatus({
          ...data.drawerStatus,
          openedAt: new Date(data.drawerStatus.openedAt),
        })

        // Parse dates in transactions
        setTransactions(
          data.transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
          })),
        )

        // Parse dates in history
        setDrawerHistory(
          data.history.map((h: any) => ({
            ...h,
            date: new Date(h.date),
          })),
        )
      } catch (error) {
        console.error("Error fetching cash drawer data:", error)
        toast({
          title: "Error",
          description: "Failed to load cash drawer data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Check if user has permission to access this page
  if (!hasPermission("open_register") && !hasPermission("close_register")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <DollarSignIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  // Calculate total from denominations
  const calculateTotal = () => {
    return Object.entries(denominations).reduce((total, [name, count]) => {
      const denomination = DENOMINATIONS.find((d) => d.name === name)
      return total + (denomination?.value || 0) * count
    }, 0)
  }

  // Handle opening cash drawer
  const handleOpenDrawer = async () => {
    setIsProcessing(true)

    try {
      const amount = calculateTotal()
      const response = await fetch("/api/cash-drawer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "open",
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to open cash drawer")
      }

      const data = await response.json()

      toast({
        title: "Cash Drawer Opened",
        description: "Cash drawer has been successfully opened.",
      })

      // Refresh the data
      window.location.reload()
    } catch (error) {
      console.error("Error opening cash drawer:", error)
      toast({
        title: "Error",
        description: "Failed to open cash drawer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setOpenDrawerDialog(false)
      setDenominations(DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.name]: 0 }), {}))
    }
  }

  // Handle closing cash drawer
  const handleCloseDrawer = async () => {
    setIsProcessing(true)

    try {
      const amount = calculateTotal()
      const response = await fetch("/api/cash-drawer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "close",
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to close cash drawer")
      }

      const data = await response.json()

      toast({
        title: "Cash Drawer Closed",
        description: "Cash drawer has been successfully closed and balanced.",
      })

      // Refresh the data
      window.location.reload()
    } catch (error) {
      console.error("Error closing cash drawer:", error)
      toast({
        title: "Error",
        description: "Failed to close cash drawer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setCloseDrawerDialog(false)
      setDenominations(DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.name]: 0 }), {}))
    }
  }

  // Handle cash payout
  const handlePayout = async () => {
    if (!payoutAmount || Number.parseFloat(payoutAmount) <= 0 || !payoutReason) {
      toast({
        title: "Invalid Payout",
        description: "Please enter a valid amount and reason for the payout.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/cash-drawer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "payout",
          amount: Number.parseFloat(payoutAmount),
          reason: payoutReason,
          reference: payoutReference,
          notes: payoutReference,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to record payout")
      }

      const data = await response.json()

      toast({
        title: "Payout Recorded",
        description: `$${payoutAmount} has been paid out from the cash drawer.`,
      })

      // Refresh the data
      window.location.reload()
    } catch (error) {
      console.error("Error recording payout:", error)
      toast({
        title: "Error",
        description: "Failed to record payout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setPayoutDialog(false)
      setPayoutAmount("")
      setPayoutReason("")
      setPayoutReference("")
    }
  }

  // Filter cash transactions based on search and date
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate =
      !dateFilter ||
      (transaction.date.getDate() === dateFilter.getDate() &&
        transaction.date.getMonth() === dateFilter.getMonth() &&
        transaction.date.getFullYear() === dateFilter.getFullYear())

    return matchesSearch && matchesDate
  })

  // Update denomination count
  const updateDenomination = (name: string, count: number) => {
    if (count < 0) count = 0
    setDenominations({ ...denominations, [name]: count })
  }

  if (loading || !drawerStatus) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Management</h1>
          <p className="text-muted-foreground">Manage your cash drawer and transactions</p>
        </div>
        <div className="flex gap-2">
          {drawerStatus.isOpen
            ? hasPermission("close_register") && (
                <Button onClick={() => setCloseDrawerDialog(true)}>
                  <DollarSignIcon className="mr-2 h-4 w-4" />
                  Close Cash Drawer
                </Button>
              )
            : hasPermission("open_register") && (
                <Button onClick={() => setOpenDrawerDialog(true)}>
                  <DollarSignIcon className="mr-2 h-4 w-4" />
                  Open Cash Drawer
                </Button>
              )}

          {drawerStatus.isOpen && hasPermission("perform_payouts") && (
            <Button variant="outline" onClick={() => setPayoutDialog(true)}>
              <MinusIcon className="mr-2 h-4 w-4" />
              Cash Payout
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="drawer" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="drawer">Cash Drawer</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Cash Drawer Tab */}
        <TabsContent value="drawer" className="space-y-4">
          {drawerStatus.isOpen ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Current Cash Drawer Status</CardTitle>
                  <CardDescription>
                    Opened at {format(drawerStatus.openedAt, "h:mm a")} on{" "}
                    {format(drawerStatus.openedAt, "MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${drawerStatus.openingBalance.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${drawerStatus.currentBalance.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Expected Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${drawerStatus.expectedAmount.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Sales Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Cash Sales:</span>
                          <span className="font-medium">${drawerStatus.cashSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Card Sales:</span>
                          <span className="font-medium">${drawerStatus.cardSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mobile Sales:</span>
                          <span className="font-medium">${drawerStatus.mobileSales.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total Sales:</span>
                          <span>
                            ${(drawerStatus.cashSales + drawerStatus.cardSales + drawerStatus.mobileSales).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Cash Flow</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Opening Balance:</span>
                          <span className="font-medium">${drawerStatus.openingBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash Sales:</span>
                          <span className="font-medium text-green-600">+${drawerStatus.cashSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash Payouts:</span>
                          <span className="font-medium text-red-600">-${drawerStatus.cashPayouts.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Expected Cash:</span>
                          <span>${drawerStatus.expectedAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPayoutDialog(true)}
                    disabled={!hasPermission("perform_payouts")}
                  >
                    <MinusIcon className="mr-2 h-4 w-4" />
                    Cash Payout
                  </Button>
                  <Button onClick={() => setCloseDrawerDialog(true)} disabled={!hasPermission("close_register")}>
                    <DollarSignIcon className="mr-2 h-4 w-4" />
                    Close Cash Drawer
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Cash Transactions</CardTitle>
                  <CardDescription>Last 5 cash transactions for the current drawer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(transaction.date, "h:mm a")}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                transaction.type === "Cash Sale"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium",
                              transaction.amount > 0 ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Cash Drawer Closed</CardTitle>
                <CardDescription>The cash drawer is currently closed</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <DollarSignIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-6">
                  You need to open the cash drawer to start processing cash transactions
                </p>
                <Button onClick={() => setOpenDrawerDialog(true)} disabled={!hasPermission("open_register")}>
                  <DollarSignIcon className="mr-2 h-4 w-4" />
                  Open Cash Drawer
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Transactions</CardTitle>
              <CardDescription>View all cash-related transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(transaction.date, "MMM d, yyyy h:mm a")}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                transaction.type === "Cash Sale"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell>{transaction.notes}</TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium",
                              transaction.amount > 0 ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Drawer History</CardTitle>
              <CardDescription>Past cash drawer sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Open Time</TableHead>
                      <TableHead>Close Time</TableHead>
                      <TableHead className="text-right">Opening</TableHead>
                      <TableHead className="text-right">Closing</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawerHistory.length > 0 ? (
                      drawerHistory.map((drawer) => (
                        <TableRow key={drawer.id}>
                          <TableCell>{format(drawer.date, "MMM d, yyyy")}</TableCell>
                          <TableCell>{drawer.id}</TableCell>
                          <TableCell>{drawer.openedAt}</TableCell>
                          <TableCell>{drawer.closedAt}</TableCell>
                          <TableCell className="text-right">${drawer.openingBalance.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${drawer.closingBalance.toFixed(2)}</TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium",
                              drawer.difference === 0 ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {drawer.difference === 0 ? "0.00" : drawer.difference.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                drawer.status === "Balanced"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {drawer.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Open Drawer Dialog */}
      <Dialog open={openDrawerDialog} onOpenChange={setOpenDrawerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open Cash Drawer</DialogTitle>
            <DialogDescription>Count and enter the starting cash amount for the drawer.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {DENOMINATIONS.map((denom) => (
                  <div key={denom.name} className="flex items-center justify-between space-x-2">
                    <Label htmlFor={denom.name} className="flex-1">
                      {denom.name}
                    </Label>
                    <Input
                      id={denom.name}
                      type="number"
                      min="0"
                      className="w-20"
                      value={denominations[denom.name]}
                      onChange={(e) => updateDenomination(denom.name, Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total Opening Amount:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDrawerDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleOpenDrawer} disabled={isProcessing || calculateTotal() <= 0}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Open Drawer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Drawer Dialog */}
      <Dialog open={closeDrawerDialog} onOpenChange={setCloseDrawerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close Cash Drawer</DialogTitle>
            <DialogDescription>Count and enter the ending cash amount in the drawer.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {DENOMINATIONS.map((denom) => (
                  <div key={denom.name} className="flex items-center justify-between space-x-2">
                    <Label htmlFor={`close-${denom.name}`} className="flex-1">
                      {denom.name}
                    </Label>
                    <Input
                      id={`close-${denom.name}`}
                      type="number"
                      min="0"
                      className="w-20"
                      value={denominations[denom.name]}
                      onChange={(e) => updateDenomination(denom.name, Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Total Counted:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Expected Amount:</span>
                  <span>${drawerStatus.expectedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Difference:</span>
                  <span
                    className={cn(calculateTotal() === drawerStatus.expectedAmount ? "text-green-600" : "text-red-600")}
                  >
                    ${(calculateTotal() - drawerStatus.expectedAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {calculateTotal() !== drawerStatus.expectedAmount && (
                <div className="space-y-2">
                  <Label htmlFor="discrepancy-notes">Discrepancy Notes</Label>
                  <Textarea
                    id="discrepancy-notes"
                    placeholder="Explain the reason for the cash discrepancy..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDrawerDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleCloseDrawer} disabled={isProcessing || calculateTotal() <= 0}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Close Drawer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={payoutDialog} onOpenChange={setPayoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cash Payout</DialogTitle>
            <DialogDescription>Record money taken out of the cash drawer.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payout-amount">Amount</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payout-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-reason">Reason</Label>
                <Select value={payoutReason} onValueChange={setPayoutReason}>
                  <SelectTrigger id="payout-reason">
                    <SelectValue placeholder="Select reason for payout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier Payment</SelectItem>
                    <SelectItem value="refund">Customer Refund</SelectItem>
                    <SelectItem value="petty-cash">Petty Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-reference">Reference (Optional)</Label>
                <Input
                  id="payout-reference"
                  placeholder="Invoice number, receipt, etc."
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-notes">Notes</Label>
                <Textarea id="payout-notes" placeholder="Additional details about this payout..." rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handlePayout}
              disabled={isProcessing || !payoutAmount || Number.parseFloat(payoutAmount) <= 0 || !payoutReason}
            >
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Record Payout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

