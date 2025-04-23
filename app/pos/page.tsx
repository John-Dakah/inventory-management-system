"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Loader2,
  Search,
  Percent,
  Trash2,
  BarChart4,
  User,
  Tag,
  Camera,
} from "lucide-react"
import {
  getProducts,
  getCategories,
  saveTransaction,
  updateInventoryFromTransaction,
  seedInitialData,
  type Product,
  type Category,
  type TransactionItem,
  type Transaction,
  type PaymentDetail,
} from "@/lib/dbs"
import { businessInfo } from "@/lib/pos-config"
import { formatCurrency, calculateTax } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { PaymentDialog } from "@/components/pos/payment-dialog"
import { DiscountDialog } from "@/components/pos/discount-dialog"
import { ReceiptDialog } from "@/components/pos/receipt-dialog"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"

export default function POSPage() {
  // State for products and categories
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // State for cart
  const [cart, setCart] = useState<TransactionItem[]>([])

  // State for search
  const [searchTerm, setSearchTerm] = useState("")

  // State for loading
  const [isLoading, setIsLoading] = useState(true)

  // State for dialogs
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null)

  // State for completed transaction
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null)

  const { toast } = useToast()

  // Load products and categories from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
  
        // Seed initial data if needed
        await seedInitialData();
  
        // Load products and categories
        const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);
  
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products and categories.",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    loadData();
  }, [toast]);

  // Filter products by category and search term
  const filteredProducts = useCallback(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm))
      return matchesCategory && matchesSearch && product.quantity > 0
    })
  }, [products, activeCategory, searchTerm])

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === product.id)

      if (existingItem) {
        // Check if we have enough inventory
        const productInStock = products.find((p) => p.id === product.id)
        if (productInStock && existingItem.quantity >= productInStock.quantity) {
          toast({
            title: "Inventory Limit Reached",
            description: `Only ${productInStock.quantity} units of ${product.name} available.`,
            variant: "destructive",
          })
          return currentCart
        }

        return currentCart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
                tax: calculateTax((item.quantity + 1) * item.price - item.discount),
                total:
                  (item.quantity + 1) * item.price -
                  item.discount +
                  calculateTax((item.quantity + 1) * item.price - item.discount),
              }
            : item,
        )
      }

      const newItem: TransactionItem = {
        id: uuidv4(),
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.price,
        quantity: 1,
        discount: 0,
        discountType: "",
        subtotal: product.price,
        tax: calculateTax(product.price),
        total: product.price + calculateTax(product.price),
      }

      return [...currentCart, newItem]
    })
  }

  // Update cart item quantity
  const updateQuantity = (id: string, change: number) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.id === id) {
            // Check inventory limit when increasing
            if (change > 0) {
              const productInStock = products.find((p) => p.id === item.productId)
              if (productInStock && item.quantity >= productInStock.quantity) {
                toast({
                  title: "Inventory Limit Reached",
                  description: `Only ${productInStock.quantity} units of ${item.name} available.`,
                  variant: "destructive",
                })
                return item
              }
            }

            const newQuantity = Math.max(0, item.quantity + change)
            const newSubtotal = newQuantity * item.price
            const newTax = calculateTax(newSubtotal - item.discount)

            return {
              ...item,
              quantity: newQuantity,
              subtotal: newSubtotal,
              tax: newTax,
              total: newSubtotal - item.discount + newTax,
            }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id))
  }

  // Open discount dialog for a cart item
  const openDiscountDialog = (id: string) => {
    setSelectedCartItemId(id)
    setIsDiscountDialogOpen(true)
  }

  // Apply discount to cart item
  const applyDiscount = (amount: number, type: string) => {
    if (!selectedCartItemId) return

    setCart((currentCart) => {
      return currentCart.map((item) => {
        if (item.id === selectedCartItemId) {
          return {
            ...item,
            discount: amount,
            discountType: type,
            tax: calculateTax(item.subtotal - amount),
            total: item.subtotal - amount + calculateTax(item.subtotal - amount),
          }
        }
        return item
      })
    })

    setIsDiscountDialogOpen(false)
    setSelectedCartItemId(null)
  }

  // Calculate cart totals
  const cartTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const discountTotal = cart.reduce((sum, item) => sum + item.discount, 0)
    const taxTotal = cart.reduce((sum, item) => sum + item.tax, 0)
    const total = cart.reduce((sum, item) => sum + item.total, 0)

    return { subtotal, discountTotal, taxTotal, total }
  }, [cart])

  // Process payment
  const processPayment = async (payments: PaymentDetail[], cashierName: string) => {
    try {
      const { subtotal, discountTotal, taxTotal, total } = cartTotals()

      // Calculate change if cash payment is more than total
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const change = Math.max(0, totalPaid - total)

      // Create transaction object
      const transaction: Transaction = {
        id: uuidv4(),
        items: cart,
        subtotal,
        discountTotal,
        taxTotal,
        total,
        payments,
        change,
        status: "completed",
        cashierName,
        receiptNumber: `R${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save transaction to database
      await saveTransaction(transaction)

      // Update inventory
      await updateInventoryFromTransaction(transaction)

      // Update local products state to reflect inventory changes
      setProducts((prevProducts) => {
        return prevProducts.map((product) => {
          const cartItem = cart.find((item) => item.productId === product.id)
          if (cartItem) {
            return {
              ...product,
              quantity: Math.max(0, product.quantity - cartItem.quantity),
            }
          }
          return product
        })
      })

      // Set completed transaction for receipt
      setCompletedTransaction(transaction)

      // Show success message
      toast({
        title: "Payment Processed",
        description: `Transaction complete for ${formatCurrency(total)}`,
      })

      // Close payment dialog and open receipt dialog
      setIsPaymentDialogOpen(false)
      setIsReceiptDialogOpen(true)

      // Clear cart
      setCart([])
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      })
    }
  }

  // Handle barcode scan
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const barcode = searchTerm.trim()
      if (barcode) {
        const product = products.find((p) => p.barcode === barcode)
        if (product) {
          addToCart(product)
          setSearchTerm("")
        } else {
          toast({
            title: "Product Not Found",
            description: `No product found with barcode ${barcode}`,
            variant: "destructive",
          })
        }
      }
    }
  }

  // Handle barcode detection from scanner
  const handleBarcodeDetection = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addToCart(product)
      toast({
        title: "Product Added",
        description: `${product.name} added to cart`,
      })
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode ${barcode}`,
        variant: "destructive",
      })
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{businessInfo.name} - Point of Sale</h1>
          <p className="text-muted-foreground">Process customer transactions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Products Section */}
        <Card className="md:order-1">
          <CardHeader className="pb-3">
            <CardTitle>Products</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or scan barcode..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-0">
                {filteredProducts().length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProducts().map((product) => (
                      <Button
                        key={product.id}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center justify-between gap-2 hover:bg-accent"
                        onClick={() => addToCart(product)}
                      >
                        <span className="text-sm font-medium line-clamp-2 text-center">{product.name}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold">{formatCurrency(product.price)}</span>
                          <span className="text-xs text-muted-foreground">Stock: {product.quantity}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No products match your search" : "No products available in this category"}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Cart Section */}
        <Card className="md:order-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Sale
              {cart.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[calc(100vh-26rem)] overflow-y-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.discount > 0 && (
                          <div className="text-xs text-red-500">Discount: -{formatCurrency(item.discount)}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(item.total)}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openDiscountDialog(item.id)}
                          >
                            <Percent className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cart.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-8 w-8 mb-2" />
                          <p>No items in cart</p>
                          <p className="text-sm">Add products to begin a sale</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotals().subtotal)}</span>
                </div>
                {cartTotals().discountTotal > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>-{formatCurrency(cartTotals().discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({businessInfo.taxRate}%)</span>
                  <span>{formatCurrency(cartTotals().taxTotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotals().total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={() => setCart([])} disabled={cart.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Sale
                </Button>
                <Button className="w-full" onClick={() => setIsPaymentDialogOpen(true)} disabled={cart.length === 0}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Customer
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Tag className="mr-2 h-4 w-4" />
                  Discounts
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        cartItems={cart}
        subtotal={cartTotals().subtotal}
        discountTotal={cartTotals().discountTotal}
        taxTotal={cartTotals().taxTotal}
        total={cartTotals().total}
        onProcessPayment={processPayment}
      />

      {selectedCartItemId && (
        <DiscountDialog
          isOpen={isDiscountDialogOpen}
          onClose={() => {
            setIsDiscountDialogOpen(false)
            setSelectedCartItemId(null)
          }}
          itemName={cart.find((item) => item.id === selectedCartItemId)?.name || ""}
          itemPrice={cart.find((item) => item.id === selectedCartItemId)?.price || 0}
          onApplyDiscount={applyDiscount}
        />
      )}

      <ReceiptDialog
        isOpen={isReceiptDialogOpen}
        onClose={() => setIsReceiptDialogOpen(false)}
        transaction={completedTransaction}
      />

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleBarcodeDetection}
      />
    </div>
  )
}
