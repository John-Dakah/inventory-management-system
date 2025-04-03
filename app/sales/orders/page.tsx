"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CheckIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  FileDownIcon,
  Loader2Icon,
  SearchIcon,
  ShoppingCartIcon,
  TruckIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { NetworkStatus } from "@/components/network-status"
import { SyncManager } from "@/components/sync-manager"

// Mock data - In a real app, this would come from your database
const mockOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    date: "2023-09-01",
    items: 3,
    total: 149.97,
    status: "Completed",
    payment: "Credit Card",
  },
  {
    id: "ORD-002",
    customer: "Emily Johnson",
    date: "2023-09-02",
    items: 2,
    total: 89.98,
    status: "Processing",
    payment: "PayPal",
  },
  {
    id: "ORD-003",
    customer: "Michael Brown",
    date: "2023-09-03",
    items: 5,
    total: 245.95,
    status: "Shipped",
    payment: "Credit Card",
  },
  {
    id: "ORD-004",
    customer: "Sarah Davis",
    date: "2023-09-04",
    items: 1,
    total: 59.99,
    status: "Pending",
    payment: "Cash on Delivery",
  },
  {
    id: "ORD-005",
    customer: "David Wilson",
    date: "2023-09-05",
    items: 4,
    total: 199.96,
    status: "Cancelled",
    payment: "Bank Transfer",
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState(mockOrders)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<(typeof mockOrders)[0] | null>(null)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    // Simulate loading data from API
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter orders based on search term and active tab
  useEffect(() => {
    let filtered = mockOrders

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.customer.toLowerCase().includes(term) ||
          order.status.toLowerCase().includes(term),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status.toLowerCase() === activeTab)
    }

    setFilteredOrders(filtered)
  }, [searchTerm, activeTab])

  // Handle order status update
  const updateOrderStatus = () => {
    if (!selectedOrder || !newStatus) return

    // In a real app, this would call an API to update the order status
    toast({
      title: "Order Status Updated",
      description: `Order ${selectedOrder.id} status changed to ${newStatus}`,
      duration: 3000,
    })

    setIsUpdateDialogOpen(false)
    setSelectedOrder(null)
    setNewStatus("")
  }

  // Toggle order selection for bulk actions
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to perform this action.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // In a real app, this would call an API to perform the bulk action
    toast({
      title: "Bulk Action Performed",
      description: `${action} applied to ${selectedOrders.length} orders`,
      duration: 3000,
    })

    setSelectedOrders([])
  }

  // Generate order status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800/30 dark:text-green-500">
            <CheckIcon className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800/30 dark:text-blue-500"
          >
            <ClipboardCheckIcon className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-800/30 dark:text-purple-500"
          >
            <TruckIcon className="mr-1 h-3 w-3" />
            Shipped
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-800/30 dark:text-amber-500"
          >
            <CreditCardIcon className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XIcon className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage your customer orders</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <Button variant="outline">
            <FileDownIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <ShoppingCartIcon className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("Mark as Processing")}>
                Mark as Processing
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("Mark as Shipped")}>
                Mark as Shipped
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => handleBulkAction("Cancel Orders")}
              >
                Cancel Orders
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOrders(filteredOrders.map((order) => order.id))
                      } else {
                        setSelectedOrders([])
                      }
                    }}
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        aria-label={`Select order ${order.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.payment}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setNewStatus(order.status)
                          setIsUpdateDialogOpen(true)
                        }}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filteredOrders.length} of {mockOrders.length} orders
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Update Order Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status for order {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-status">Current Status</Label>
              <Input id="current-status" value={selectedOrder?.status || ""} readOnly className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateOrderStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SyncManager />
    </div>
  )
}

function ArrowLeftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  )
}

