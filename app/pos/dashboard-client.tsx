"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingCartIcon,
  UsersIcon,
  CreditCardIcon,
  SettingsIcon,
  AlertCircleIcon,
  PackageIcon,
  Loader2Icon,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface DashboardData {
  todaySalesCount: number
  todaySalesTotal: number
  recentSales: {
    reference: string
    total: number
    date: string
  }[]
  registerStatus: string
  registerBalance: number
  lowStockCount: number
  outOfStockCount: number
  customerCount: number
}

export default function DashboardClient() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false)
  const [closeRegisterDialog, setCloseRegisterDialog] = useState(false)
  const [openingAmount, setOpeningAmount] = useState("200.00")
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) throw new Error("Failed to fetch dashboard data")

        const data = await response.json()
        setDashboardData({
          ...data,
          recentSales: data.recentSales.map((sale: any) => ({
            ...sale,
            date: new Date(sale.date),
          })),
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const handleOpenRegister = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "open",
          amount: Number.parseFloat(openingAmount),
          notes: "Opened from dashboard",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to open register")
      }

      const data = await response.json()

      // Update dashboard data
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              registerStatus: data.status,
              registerBalance: data.balance,
            }
          : null,
      )

      toast({
        title: "Register opened",
        description: "You have successfully opened the register.",
      })

      setOpenRegisterDialog(false)
    } catch (error) {
      console.error("Error opening register:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseRegister = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "close",
          notes: "Closed from dashboard",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to close register")
      }

      const data = await response.json()

      // Update dashboard data
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              registerStatus: data.status,
              registerBalance: data.balance,
            }
          : null,
      )

      toast({
        title: "Register closed",
        description: "You have successfully closed the register.",
      })

      setCloseRegisterDialog(false)
    } catch (error) {
      console.error("Error closing register:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to close register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "User"}! Here's an overview of your point of sale system.
        </p>
      </div>

      {/* Register Status Card */}
      {dashboardData && (
        <Card className={dashboardData.registerStatus === "Closed" ? "border-dashed border-2" : ""}>
          <CardHeader>
            <CardTitle>Register Status: {dashboardData.registerStatus}</CardTitle>
            <CardDescription>
              {dashboardData.registerStatus === "Open"
                ? `Current balance: $${dashboardData.registerBalance.toFixed(2)}`
                : "You need to open the register before processing sales."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {dashboardData.registerStatus === "Closed" && hasPermission("open_register") ? (
              <Button onClick={() => setOpenRegisterDialog(true)}>Open Register</Button>
            ) : dashboardData.registerStatus === "Open" && hasPermission("close_register") ? (
              <Button variant="outline" onClick={() => setCloseRegisterDialog(true)}>
                Close Register
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.todaySalesTotal.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{dashboardData?.todaySalesCount || 0} transactions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboardData?.lowStockCount || 0) + (dashboardData?.outOfStockCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.lowStockCount || 0} low stock, {dashboardData?.outOfStockCount || 0} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.customerCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Register Balance</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.registerBalance.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.registerStatus === "Open" ? "Register is open" : "Register is closed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* POS Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer" onClick={() => navigateTo("/pos")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Point of Sale</CardTitle>
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Process sales and manage transactions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => navigateTo("/products")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage your product inventory</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => navigateTo("/customers")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage customer information</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => navigateTo("/cash-management")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Management</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage cash drawer and payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Sales Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You've processed {dashboardData?.todaySalesCount || 0} sales today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              {dashboardData?.recentSales && dashboardData.recentSales.length > 0 ? (
                dashboardData.recentSales.map((sale) => (
                  <div key={sale.reference} className="flex items-center justify-between text-sm">
                    <span>{sale.reference}</span>
                    <span className="font-medium">${sale.total.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent sales found</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigateTo("/transactions")}>
              View All Transactions
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => navigateTo("/pos")}
                disabled={dashboardData?.registerStatus !== "Open"}
              >
                New Sale
              </Button>
              <Button variant="outline" onClick={() => navigateTo("/products/new")}>
                Add Product
              </Button>
              <Button variant="outline" onClick={() => navigateTo("/customers/new")}>
                Add Customer
              </Button>
              <Button variant="outline" onClick={() => navigateTo("/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Register Dialog */}
      <Dialog open={openRegisterDialog} onOpenChange={setOpenRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open Register</DialogTitle>
            <DialogDescription>Enter the opening balance for the cash drawer.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opening-amount">Opening Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="opening-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Opening Balance:</span>
                <span>${Number.parseFloat(openingAmount || "0").toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRegisterDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleOpenRegister} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Open Register"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Register Dialog */}
      <Dialog open={closeRegisterDialog} onOpenChange={setCloseRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close Register</DialogTitle>
            <DialogDescription>Are you sure you want to close the register?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span className="font-medium">${dashboardData?.registerBalance.toFixed(2) || "0.00"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Closing the register will end the current session and reset the balance to zero. Make sure you've
                counted the cash and reconciled the drawer before closing.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseRegisterDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCloseRegister} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Close Register"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

