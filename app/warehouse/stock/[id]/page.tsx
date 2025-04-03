"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, PlusIcon, RefreshCwIcon, EditIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StockForm } from "@/components/stock-form"
import { StockTransactionForm } from "@/components/stock-transaction-form"
import { getStockItem, getStockTransactions, type StockItem, type StockTransaction } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

export default function StockItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [stockItem, setStockItem] = useState<StockItem | null>(null)
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  const id = params.id as string

  useEffect(() => {
    fetchStockItemData()
  }, [id])

  async function fetchStockItemData() {
    setLoading(true)
    try {
      const item = await getStockItem(id)
      if (!item) {
        toast({
          title: "Item Not Found",
          description: "The requested stock item could not be found.",
          variant: "destructive",
        })
        router.push("/warehouse/stock")
        return
      }

      setStockItem(item)

      // Fetch transactions for this item
      const itemTransactions = await getStockTransactions(id)
      setTransactions(itemTransactions)
    } catch (error) {
      console.error("Error fetching stock item:", error)
      toast({
        title: "Error",
        description: "There was an error loading the stock item data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleEditSuccess() {
    setIsEditDialogOpen(false)
    fetchStockItemData()
  }

  function handleTransactionSuccess() {
    setIsTransactionDialogOpen(false)
    fetchStockItemData()
  }

  function handleBackClick() {
    router.push("/warehouse/stock")
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <RefreshCwIcon className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading stock item data...</span>
      </div>
    )
  }

  if (!stockItem) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleBackClick}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{stockItem.name}</h1>
        <Badge
          variant={
            stockItem.status === "In Stock" ? "default" : stockItem.status === "Low Stock" ? "outline" : "destructive"
          }
        >
          {stockItem.status}
        </Badge>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Stock item information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                <p>{stockItem.sku}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <p>{stockItem.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <p>{stockItem.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p>{stockItem.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                <p className="text-2xl font-bold">{stockItem.quantity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(stockItem.lastUpdated).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Stock Item</DialogTitle>
                    <DialogDescription>Update the stock item details</DialogDescription>
                  </DialogHeader>
                  <StockForm initialData={stockItem} onSuccess={handleEditSuccess} />
                </DialogContent>
              </Dialog>

              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Record Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Record Stock Transaction</DialogTitle>
                    <DialogDescription>Add a stock in, out, or adjustment transaction</DialogDescription>
                  </DialogHeader>
                  <StockTransactionForm
                    stockItemId={stockItem.id}
                    currentQuantity={stockItem.quantity}
                    onSuccess={handleTransactionSuccess}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Record of all stock movements for this item</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">No transactions recorded for this item</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "in"
                              ? "default"
                              : transaction.type === "out"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {transaction.type === "in"
                            ? "Stock In"
                            : transaction.type === "out"
                              ? "Stock Out"
                              : "Adjustment"}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.previousQuantity}</TableCell>
                      <TableCell>{transaction.newQuantity}</TableCell>
                      <TableCell>{transaction.reason || "-"}</TableCell>
                      <TableCell>{transaction.reference || "-"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

