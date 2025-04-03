"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Minus, ShoppingCart, CreditCard, Loader2, SearchIcon, PackageIcon, XIcon, UserIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getProducts, saveProduct, saveTransaction, type Product } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Walk-in Customer", email: "", phone: "" },
    { id: "2", name: "John Doe", email: "john@example.com", phone: "555-1234" },
    { id: "3", name: "Jane Smith", email: "jane@example.com", phone: "555-5678" },
  ])

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const data = await getProducts()
        setProducts(data)

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((product) => product.category).filter(Boolean))]
        setCategories(uniqueCategories)

        // Set default customer
        setSelectedCustomer(customers[0])
      } catch (error) {
        console.error("Error loading products:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products from database.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((product) => product.category === activeCategory)
    }

    // Only show products with quantity > 0
    filtered = filtered.filter((product) => product.quantity > 0)

    setFilteredProducts(filtered)
  }, [products, searchTerm, activeCategory])

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === product.id)
      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [
        ...currentCart,
        {
          id: uuidv4(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]
    })

    // Show toast notification
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const updateQuantity = (id: string, change: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const processPayment = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to your cart before processing payment.",
      })
      return
    }

    setIsProcessing(true)
    try {
      // Create transaction record
      const transactionId = uuidv4()
      const now = new Date().toISOString()

      const transaction = {
        id: transactionId,
        customerId: selectedCustomer?.id || "1",
        customerName: selectedCustomer?.name || "Walk-in Customer",
        items: cart,
        total: total,
        paymentMethod: paymentMethod,
        status: "completed",
        createdAt: now,
      }

      // Save transaction
      await saveTransaction(transaction)

      // Update product quantities in database
      for (const item of cart) {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          const updatedProduct = {
            ...product,
            quantity: Math.max(0, product.quantity - item.quantity),
            updatedAt: now,
          }
          await saveProduct(updatedProduct)

          // Update local products state
          setProducts((prevProducts) => prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
        }
      }

      toast({
        title: "Payment Processed",
        description: `Transaction #${transactionId.substring(0, 8)} complete for $${total.toFixed(2)}`,
      })

      // Clear cart after successful payment
      setCart([])

      // Reset to default customer
      setSelectedCustomer(customers[0])

      // Reset payment method
      setPaymentMethod("cash")
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFromCart = (id: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCustomerDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading products...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">Process customer transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserIcon className="mr-2 h-4 w-4" />
                {selectedCustomer?.name || "Select Customer"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Customer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {customers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant={selectedCustomer?.id === customer.id ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => selectCustomer(customer)}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div>{customer.name}</div>
                      {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                    </div>
                  </Button>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="flex w-full overflow-x-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto w-full p-4 flex flex-col items-center gap-2"
                        onClick={() => addToCart(product)}
                        disabled={product.quantity <= 0}
                      >
                        <PackageIcon className="h-8 w-8 text-primary" />
                        <span className="text-lg font-semibold">{product.name}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-muted-foreground">${product.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">In stock: {product.quantity}</span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No products match your search" : "No products available"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={(products.find((p) => p.id === item.productId)?.quantity || 0) <= item.quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {cart.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No items in cart
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0 || isProcessing}
                onClick={processPayment}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Process Payment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

