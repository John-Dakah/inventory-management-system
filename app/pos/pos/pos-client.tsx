"use client"

import { useState, useEffect, useCallback } from "react"
import {
  SearchIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CreditCardIcon,
  BanknoteIcon,
  SmartphoneIcon,
  PercentIcon,
  UserIcon,
  ReceiptIcon,
  CheckIcon,
  Loader2Icon,
  ShoppingCartIcon,
  WifiOffIcon,
  WifiIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { isOnline, registerServiceWorker } from "@/lib/network"
import {
  initDB,
  storePendingTransaction,
  getPendingTransactions,
  markTransactionSynced,
  deleteTransaction,
  cacheProducts,
  getCachedProducts,
  cacheCustomers,
  getCachedCustomers,
} from "@/lib/indexedDB"

// Product type
interface Product {
  id: string
  name: string
  price: number
  category: string | null
  imageUrl: string | null
  sku: string
  quantity: number
}

// Customer type
interface Customer {
  id: string
  name: string
  email: string
}

// Cart item type
interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

// Payment methods
const PAYMENT_METHODS = [
  { id: "cash", name: "Cash", icon: BanknoteIcon },
  { id: "card", name: "Credit/Debit Card", icon: CreditCardIcon },
  { id: "mobile", name: "Mobile Payment", icon: SmartphoneIcon },
]

export default function POSClient() {
  const { toast } = useToast()
  const router = useRouter()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<{
    id: string
    items: CartItem[]
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
    date: Date
  } | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")

  // State for products and categories
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(isOnline())
  const [syncNeeded, setSyncNeeded] = useState(false)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([])

  // Initialize service worker and IndexedDB
  useEffect(() => {
    const init = async () => {
      await registerServiceWorker()
      await initDB()

      // Check for pending transactions
      const pending = await getPendingTransactions()
      setPendingTransactions(pending.filter((t) => !t.synced))

      if (pending.filter((t) => !t.synced).length > 0) {
        setSyncNeeded(true)
      }
    }

    init()

    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true)
      if (syncNeeded) {
        setSyncDialogOpen(true)
      }
    }

    const handleOffline = () => {
      setOnline(false)
    }

    // Listen for sync messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SYNC_NEEDED") {
        syncTransactions()
      }
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handleMessage)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)

      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handleMessage)
      }
    }
  }, [syncNeeded])

  // Fetch products and categories
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      if (online) {
        // Fetch from API if online
        const response = await fetch(`/api/pos/products?search=${searchQuery}&category=${selectedCategory}`)

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        setProducts(data.products)
        setCategories(["All", ...data.categories])

        // Cache products for offline use
        await cacheProducts(data.products)
      } else {
        // Use cached products if offline
        const cachedProducts = await getCachedProducts()

        // Filter products based on search and category
        const filtered = cachedProducts.filter((product) => {
          const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
          return matchesSearch && matchesCategory
        })

        setProducts(filtered)

        // Extract unique categories from cached products
        const uniqueCategories = ["All", ...new Set(cachedProducts.map((p) => p.category).filter(Boolean))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching products:", error)

      // Try to use cached products if API fails
      const cachedProducts = await getCachedProducts()

      if (cachedProducts.length > 0) {
        // Filter products based on search and category
        const filtered = cachedProducts.filter((product) => {
          const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
          return matchesSearch && matchesCategory
        })

        setProducts(filtered)

        // Extract unique categories from cached products
        const uniqueCategories = ["All", ...new Set(cachedProducts.map((p) => p.category).filter(Boolean))]
        setCategories(uniqueCategories)

        toast({
          title: "Offline Mode",
          description: "Using cached product data. Some information may not be up to date.",
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load products. Please check your connection.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, online, toast])

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      if (online) {
        // Fetch from API if online
        const response = await fetch(`/api/pos/customers?search=${customerSearchQuery}`)

        if (!response.ok) {
          throw new Error("Failed to fetch customers")
        }

        const data = await response.json()
        setCustomers(data)

        // Cache customers for offline use
        await cacheCustomers(data)
      } else {
        // Use cached customers if offline
        const cachedCustomers = await getCachedCustomers()

        // Filter customers based on search
        const filtered = cachedCustomers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()),
        )

        setCustomers(filtered)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)

      // Try to use cached customers if API fails
      const cachedCustomers = await getCachedCustomers()

      if (cachedCustomers.length > 0) {
        // Filter customers based on search
        const filtered = cachedCustomers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()),
        )

        setCustomers(filtered)

        toast({
          title: "Offline Mode",
          description: "Using cached customer data. Some information may not be up to date.",
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load customers. Please check your connection.",
          variant: "destructive",
        })
      }
    }
  }, [customerSearchQuery, online, toast])

  // Fetch products on mount and when search/category changes
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fetch customers when dialog opens or search changes
  useEffect(() => {
    if (customerDialogOpen) {
      fetchCustomers()
    }
  }, [customerDialogOpen, fetchCustomers])

  // Sync transactions with server
  const syncTransactions = async () => {
    if (!online) {
      toast({
        title: "Offline",
        description: "Cannot sync transactions while offline.",
        variant: "default",
      })
      return
    }

    const pending = await getPendingTransactions()
    const unsynced = pending.filter((t) => !t.synced)

    if (unsynced.length === 0) {
      setSyncNeeded(false)
      setSyncDialogOpen(false)
      return
    }

    setIsProcessing(true)

    for (const transaction of unsynced) {
      try {
        const response = await fetch("/api/pos/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction.data),
        })

        if (response.ok) {
          await markTransactionSynced(transaction.id)
          await deleteTransaction(transaction.id)
        } else {
          console.error("Failed to sync transaction:", transaction.id)
        }
      } catch (error) {
        console.error("Error syncing transaction:", error)
      }
    }

    // Refresh pending transactions
    const updatedPending = await getPendingTransactions()
    setPendingTransactions(updatedPending.filter((t) => !t.synced))
    setSyncNeeded(updatedPending.filter((t) => !t.synced).length > 0)

    setIsProcessing(false)
    setSyncDialogOpen(false)

    toast({
      title: "Sync Complete",
      description: "All pending transactions have been synchronized.",
    })
  }

  // Check if user has permission to access this page
  if (!hasPermission("process_sales")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <ShoppingCartIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    )
  }

  // Filter products based on search query and category
  const filteredProducts = products

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = (subtotal * discountPercent) / 100
  const taxRate = 0.0825 // 8.25% tax rate
  const taxAmount = (subtotal - discountAmount) * taxRate
  const total = subtotal - discountAmount + taxAmount

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id)

      if (existingItem) {
        // Update quantity if product already in cart
        return prevCart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            id: `cart-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ]
      }
    })
  }

  // Update cart item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  // Remove item from cart
  const removeItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  // Clear the entire cart
  const clearCart = () => {
    setCart([])
    setDiscountPercent(0)
    setSelectedCustomer(null)
  }

  // Handle payment process
  const processPayment = async () => {
    setIsProcessing(true)

    const saleData = {
      items: cart,
      subtotal,
      tax: taxAmount,
      total,
      discountPercent,
      paymentMethod: PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.name || "Cash",
      customerId: selectedCustomer?.id,
      date: new Date(),
    }

    try {
      if (online) {
        // Process payment online
        const response = await fetch("/api/pos/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saleData),
        })

        if (!response.ok) {
          throw new Error("Failed to process transaction")
        }

        const data = await response.json()

        setCompletedSale({
          id: data.transactionId,
          items: [...cart],
          subtotal,
          tax: taxAmount,
          total,
          paymentMethod: PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.name || "Cash",
          date: new Date(),
        })
      } else {
        // Store transaction for later sync
        await storePendingTransaction({
          data: saleData,
        })

        setSyncNeeded(true)

        // Generate a temporary ID for offline mode
        const offlineId = `OFFLINE-${Date.now()}`

        setCompletedSale({
          id: offlineId,
          items: [...cart],
          subtotal,
          tax: taxAmount,
          total,
          paymentMethod: PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.name || "Cash",
          date: new Date(),
        })

        toast({
          title: "Offline Transaction",
          description: "This transaction will be processed when you reconnect.",
          variant: "default",
        })
      }

      setIsProcessing(false)
      setPaymentDialogOpen(false)
      setReceiptDialogOpen(true)
    } catch (error) {
      console.error("Error processing payment:", error)

      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      })

      setIsProcessing(false)
    }
  }

  // Start a new sale after completing one
  const startNewSale = () => {
    clearCart()
    setReceiptDialogOpen(false)
  }

  // Apply discount
  const applyDiscount = (percent: number) => {
    if (!hasPermission("apply_discounts")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to apply discounts",
        variant: "destructive",
      })
      return
    }

    setDiscountPercent(percent)
    setDiscountDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">Process sales and manage transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {!online && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
              <WifiOffIcon className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          {online && syncNeeded && (
            <Button size="sm" onClick={() => setSyncDialogOpen(true)}>
              <WifiIcon className="h-4 w-4 mr-1" />
              Sync ({pendingTransactions.length})
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="relative w-full sm:w-64">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="All" onValueChange={setSelectedCategory}>
                  <TabsList className="grid grid-cols-3 sm:grid-cols-6">
                    {categories.slice(0, 6).map((category) => (
                      <TabsTrigger key={category} value={category} className="text-xs">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-3 flex flex-col items-center text-center">
                          <img
                            src={product.imageUrl || "/placeholder.svg?height=80&width=80"}
                            alt={product.name}
                            className="h-20 w-20 object-contain mb-2"
                          />
                          <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                          <p className="text-sm font-bold mt-1">${product.price.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No products found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Current Sale</CardTitle>
                {selectedCustomer ? (
                  <Badge variant="outline" className="flex gap-1 items-center">
                    <UserIcon className="h-3 w-3" />
                    Customer: {selectedCustomer.name}
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setCustomerDialogOpen(true)}>
                    <UserIcon className="h-4 w-4 mr-1" />
                    Add Customer
                  </Button>
                )}
              </div>
              {cart.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={clearCart}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <ShoppingCartIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">Add products by clicking on them</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-26rem)]">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-grow mr-2">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="flex-col border-t pt-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (8.25%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDiscountDialogOpen(true)}
                    disabled={cart.length === 0 || !hasPermission("apply_discounts")}
                  >
                    <PercentIcon className="h-4 w-4 mr-2" />
                    Discount
                  </Button>
                  <Button className="flex-1" onClick={() => setPaymentDialogOpen(true)} disabled={cart.length === 0}>
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Pay
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogPortal>
          {/* Dark Overlay Background */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 relative z-50">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>Select a payment method to complete the transaction.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="font-medium text-lg flex justify-between">
                  <span>Total Amount:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Separator />
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                        <method.icon className="h-5 w-5 mr-2" />
                        {method.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={processPayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Complete Payment</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogPortal>
          {/* Dark Overlay Background */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 relative z-50">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-center">
                <ReceiptIcon className="h-6 w-6 mr-2" />
                Receipt
              </DialogTitle>
            </DialogHeader>
            {completedSale && (
              <div className="py-4">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl">RetailPOS</h3>
                  <p className="text-sm text-muted-foreground">{completedSale.date.toLocaleString()}</p>
                  <p className="text-sm font-medium mt-1">Sale #{completedSale.id}</p>
                  {!online && (
                    <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800">
                      Offline Transaction - Will sync when online
                    </Badge>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {completedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${completedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-${((completedSale.subtotal * discountPercent) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${completedSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${completedSale.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium">Paid via {completedSale.paymentMethod}</p>
                  {selectedCustomer && (
                    <p className="text-sm text-muted-foreground mt-2">Customer: {selectedCustomer.name}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-4">Thank you for your purchase!</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={startNewSale} className="w-full">
                <CheckIcon className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>Select a discount percentage to apply to the current sale.</DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-2">
            {[0, 5, 10, 15, 20, 25].map((percent) => (
              <Button
                key={percent}
                variant={discountPercent === percent ? "default" : "outline"}
                onClick={() => applyDiscount(percent)}
              >
                {percent}%
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>Add a customer to this transaction.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 w-full"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setCustomerDialogOpen(false)
                    }}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    {customer.name}{" "}
                    {customer.email && <span className="text-muted-foreground ml-1">({customer.email})</span>}
                  </Button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No customers found</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sync Offline Transactions</DialogTitle>
            <DialogDescription>
              You have {pendingTransactions.length} offline transaction{pendingTransactions.length !== 1 ? "s" : ""}{" "}
              that need{pendingTransactions.length === 1 ? "s" : ""} to be synchronized.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Would you like to sync these transactions with the server now?
            </p>
            {pendingTransactions.length > 0 && (
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {pendingTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="text-sm py-1">
                    <span className="font-medium">Transaction {index + 1}:</span>{" "}
                    {new Date(transaction.timestamp).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
              Later
            </Button>
            <Button onClick={syncTransactions} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>Sync Now</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

