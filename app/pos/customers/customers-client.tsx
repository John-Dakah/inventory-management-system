"use client"

import { useState, useEffect } from "react"
import {
  SearchIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  Loader2Icon,
  ArrowUpDownIcon,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

// Customer type
interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  joinDate: Date
  lastVisit: Date
  totalSpent: number
  visits: number
  type: string
  notes: string | null
}

// Purchase history type
interface PurchaseHistory {
  id: string
  date: Date
  amount: number
  items: number
  paymentMethod: string
  status: string
}

// Customer details type
interface CustomerDetails extends Customer {
  purchaseHistory: PurchaseHistory[]
}

export default function CustomersClient() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

  // State for customers and loading
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "Regular",
    notes: "",
  })

  // Fetch customers on mount and when filters change
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        // Build query params
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (typeFilter !== "All") params.append("type", typeFilter)

        const response = await fetch(`/api/customers?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch customers")

        const data = await response.json()

        // Parse dates
        setCustomers(
          data.map((c: any) => ({
            ...c,
            joinDate: new Date(c.joinDate),
            lastVisit: new Date(c.lastVisit),
          })),
        )
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [searchQuery, typeFilter, toast])

  // Fetch customer details when selecting a customer
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!selectedCustomer) {
        setCustomerDetails(null)
        return
      }

      setLoadingDetails(true)
      try {
        const response = await fetch(`/api/customers/${selectedCustomer}`)
        if (!response.ok) throw new Error("Failed to fetch customer details")

        const data = await response.json()

        // Parse dates
        setCustomerDetails({
          ...data,
          joinDate: new Date(data.joinDate),
          lastVisit: new Date(data.lastVisit),
          purchaseHistory: data.purchaseHistory.map((p: any) => ({
            ...p,
            date: new Date(p.date),
          })),
        })
      } catch (error) {
        console.error("Error fetching customer details:", error)
        toast({
          title: "Error",
          description: "Failed to load customer details. Please try again.",
          variant: "destructive",
        })
        setSelectedCustomer(null)
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchCustomerDetails()
  }, [selectedCustomer, toast])

  // Check if user has permission to access this page
  if (!hasPermission("view_customers")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <UsersIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  // Handle opening the customer dialog for adding a new customer
  const handleAddCustomer = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      type: "Regular",
      notes: "",
    })
    setIsNewCustomer(true)
    setCustomerDialogOpen(true)
  }

  // Handle opening the customer dialog for editing an existing customer
  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
        type: customer.type,
        notes: customer.notes || "",
      })
      setIsNewCustomer(false)
      setCustomerDialogOpen(true)
    }
  }

  // Handle saving customer data
  const handleSaveCustomer = async () => {
    // Validate form
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      if (isNewCustomer) {
        // Create new customer
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create customer")
        }

        const data = await response.json()

        // Add new customer to list
        setCustomers((prev) => [
          {
            ...data.customer,
            joinDate: new Date(data.customer.joinDate),
            lastVisit: new Date(data.customer.lastVisit),
          },
          ...prev,
        ])

        toast({
          title: "Customer Added",
          description: `${formData.name} has been added to your customer database.`,
        })
      } else {
        // Update existing customer
        const response = await fetch(`/api/customers/${selectedCustomer}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update customer")
        }

        const data = await response.json()

        // Update customer in list
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer
              ? {
                  ...c,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  type: formData.type,
                  notes: formData.notes,
                }
              : c,
          ),
        )

        // Update customer details if currently viewing
        if (customerDetails && customerDetails.id === selectedCustomer) {
          setCustomerDetails({
            ...customerDetails,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            type: formData.type,
            notes: formData.notes,
          })
        }

        toast({
          title: "Customer Updated",
          description: `${formData.name} has been updated in your customer database.`,
        })
      }
    } catch (error) {
      console.error("Error saving customer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setCustomerDialogOpen(false)
    }
  }

  // Handle deleting a customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/customers/${customerToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete customer")
      }

      // Remove customer from list
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete))

      // If the deleted customer was selected, clear the selection
      if (customerToDelete === selectedCustomer) {
        setSelectedCustomer(null)
      }

      toast({
        title: "Customer Deleted",
        description: "The customer has been removed from your database.",
      })
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  // Update form data
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Customer types
  const CUSTOMER_TYPES = ["All", "New", "Regular", "VIP"]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        {hasPermission("manage_customers") && (
          <Button onClick={handleAddCustomer}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer List */}
        <div className="md:col-span-1 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>{customers.length} customers found</CardDescription>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${
                          selectedCustomer === customer.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedCustomer(customer.id)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{customer.name}</p>
                          <p
                            className={`text-xs truncate ${
                              selectedCustomer === customer.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {customer.email}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            customer.type === "VIP"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                              : customer.type === "New"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-green-100 text-green-800 hover:bg-green-100"
                          }
                        >
                          {customer.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <UsersIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No customers found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="md:col-span-2 space-y-4">
          {selectedCustomer ? (
            loadingDetails ? (
              <Card>
                <CardContent className="flex justify-center py-12">
                  <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : customerDetails ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl">{customerDetails.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{customerDetails.name}</CardTitle>
                        <CardDescription>
                          Customer since {format(customerDetails.joinDate, "MMMM yyyy")}
                        </CardDescription>
                        <Badge
                          variant="outline"
                          className={
                            customerDetails.type === "VIP"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-100 mt-1"
                              : customerDetails.type === "New"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100 mt-1"
                                : "bg-green-100 text-green-800 hover:bg-green-100 mt-1"
                          }
                        >
                          {customerDetails.type}
                        </Badge>
                      </div>
                    </div>
                    {hasPermission("manage_customers") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpDownIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCustomer(customerDetails.id)}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setCustomerToDelete(customerDetails.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="details">Customer Details</TabsTrigger>
                      <TabsTrigger value="purchases">Purchase History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{customerDetails.email}</span>
                          </div>
                          {customerDetails.phone && (
                            <div className="flex items-center text-sm">
                              <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{customerDetails.phone}</span>
                            </div>
                          )}
                          {customerDetails.address && (
                            <div className="flex items-start text-sm">
                              <MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{customerDetails.address}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Spent:</span>
                            <span className="font-medium">${customerDetails.totalSpent.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Visit Count:</span>
                            <span className="font-medium">{customerDetails.visits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Last Visit:</span>
                            <span className="font-medium">{format(customerDetails.lastVisit, "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>

                      {customerDetails.notes && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-sm font-medium mb-1">Notes</h3>
                            <p className="text-sm text-muted-foreground">{customerDetails.notes}</p>
                          </div>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="purchases" className="pt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Transaction ID</TableHead>
                              <TableHead className="text-right">Items</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerDetails.purchaseHistory.length > 0 ? (
                              customerDetails.purchaseHistory.map((purchase) => (
                                <TableRow key={purchase.id}>
                                  <TableCell>{format(purchase.date, "MMM d, yyyy")}</TableCell>
                                  <TableCell className="font-medium">{purchase.id}</TableCell>
                                  <TableCell className="text-right">{purchase.items}</TableCell>
                                  <TableCell className="text-right">${purchase.amount.toFixed(2)}</TableCell>
                                  <TableCell>{purchase.paymentMethod}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        purchase.status === "Completed"
                                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                                          : "bg-red-100 text-red-800 hover:bg-red-100"
                                      }
                                    >
                                      {purchase.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                  No purchase history found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : null
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Customer Selected</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Select a customer from the list to view their details, or add a new customer to your database.
                </p>
                {hasPermission("manage_customers") && (
                  <Button onClick={handleAddCustomer}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewCustomer ? "Add New Customer" : "Edit Customer"}</DialogTitle>
            <DialogDescription>
              {isNewCustomer ? "Enter the details for the new customer." : "Update the customer's information."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address, city, state, zip"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Customer Type</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this customer"
                  value={formData.notes}
                  onChange={(e) => updateFormData("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomer} disabled={isProcessing || !formData.name || !formData.email}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  {isNewCustomer ? "Add Customer" : "Save Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center font-medium">
              {customerToDelete && customers.find((c) => c.id === customerToDelete)?.name}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

