"use client"

import { useState } from "react"
import { SearchIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { StockOutForm } from "@/components/stock-out-form"

// Mock data for stock out history
const mockStockOutHistory = [
  {
    id: "SO001",
    date: "2023-03-27",
    productId: "P001",
    productName: "Product ABC",
    quantity: 50,
    destination: "Customer XYZ",
    issuedBy: "John Doe",
    status: "Completed",
  },
  {
    id: "SO002",
    date: "2023-03-26",
    productId: "P002",
    productName: "Product DEF",
    quantity: 75,
    destination: "Customer ABC",
    issuedBy: "Jane Smith",
    status: "Completed",
  },
  {
    id: "SO003",
    date: "2023-03-25",
    productId: "P003",
    productName: "Product XYZ",
    quantity: 100,
    destination: "Customer DEF",
    issuedBy: "Mike Johnson",
    status: "Completed",
  },
  {
    id: "SO004",
    date: "2023-03-24",
    productId: "P004",
    productName: "Product MNO",
    quantity: 25,
    destination: "Customer GHI",
    issuedBy: "Sarah Williams",
    status: "Completed",
  },
  {
    id: "SO005",
    date: "2023-03-23",
    productId: "P005",
    productName: "Product PQR",
    quantity: 60,
    destination: "Customer JKL",
    issuedBy: "David Brown",
    status: "Completed",
  },
]

export default function StockOutPage() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter stock out history based on search query
  const filteredHistory = mockStockOutHistory.filter(
    (item) =>
      item.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStockOut = async (data: any) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Stock Out Recorded",
      description: `Removed ${data.quantity} units of ${data.productName} from inventory`,
    })

    setIsSubmitting(false)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Out</h1>
          <p className="text-muted-foreground">Record inventory removals and view stock out history</p>
        </div>
        {hasPermission("manage_stock_out") && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Record Stock Out
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record Stock Out</CardTitle>
            <CardDescription>Enter details about the outgoing inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <StockOutForm onSubmit={handleStockOut} onCancel={() => setShowForm(false)} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Out History</CardTitle>
          <CardDescription>Recent inventory removals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by product ID, name, or destination..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>
                      {item.productId} - {item.productName}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>{item.issuedBy}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No stock out records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

