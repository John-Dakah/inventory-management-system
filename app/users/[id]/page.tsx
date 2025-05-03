"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, User, ShoppingCart } from "lucide-react"
interface Transaction {
  id: string;
  reference: string;
  date: string;
  total: number;
  status: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  status: string;
  joinDate: string;
  totalSpent: number;
  transactions: Transaction[];
  type: string;
  visits: number;
  lastVisit: string;
  createdAt: string;
  address?: string;
}
export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user details")
      }
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-[60vh]">
        <p>Loading user details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push("/users")}>Back to Users</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">User Details</h1>
        <div className="ml-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/users/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Full Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.fullName}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.email}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.role}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{user.department || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>{user.status}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Joined Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{new Date(user.joinDate).toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${user.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all transactions made by this user.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.transactions && user.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.reference}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                        <TableCell>${transaction.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "Completed" ? "success" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions found for this user.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Detailed information about this user.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{user.phone || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span>{user.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Type:</span>
                      <span>{user.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Visits:</span>
                      <span>{user.visits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Visit:</span>
                      <span>{new Date(user.lastVisit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created At:</span>
                      <span>{new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
