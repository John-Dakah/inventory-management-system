import { Suspense } from "react"
import { Package2Icon, TruckIcon, Users2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StockAreaChart } from "@/components/charts/area-chart"
import { WarehouseBarChart } from "@/components/charts/bar-chart"
import {
  getDashboardStats,
  getRecentActivity,
  getLowStockItems,
  getStockOverviewData,
  getStockDistributionByLocation,
  getProductGrowthRate,
  getNewSuppliersThisMonth,
} from "@/lib/dashboard"
import { DashboardActions } from "@/components/dashboard/dashboard-actions"

export default async function DashboardPage() {
  // Fetch all the data needed for the dashboard
  const stats = await getDashboardStats()
  const recentActivity = await getRecentActivity()
  const lowStockItems = await getLowStockItems()
  const stockOverviewData = await getStockOverviewData()
  const stockDistributionData = await getStockDistributionByLocation()
  const productGrowthRate = await getProductGrowthRate()
  const newSuppliers = await getNewSuppliersThisMonth()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your inventory.</p>
        </div>
        <Suspense fallback={<Button disabled>Loading...</Button>}>
          <DashboardActions />
        </Suspense>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{productGrowthRate}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">+{newSuppliers} new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Monthly stock levels across all warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            <StockAreaChart data={stockOverviewData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory movements and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div
                      className={`ml-auto font-medium ${
                        activity.value.startsWith("+")
                          ? "text-green-600"
                          : activity.value.startsWith("-")
                            ? "text-destructive"
                            : ""
                      }`}
                    >
                      {activity.value}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No recent activity found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Items that require immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.threshold}</TableCell>
                      <TableCell
                        className={
                          item.status === "Critical"
                            ? "text-destructive"
                            : item.status === "Warning"
                              ? "text-amber-500"
                              : ""
                        }
                      >
                        {item.status}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No low stock items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock Distribution</CardTitle>
            <CardDescription>Stock levels by warehouse location</CardDescription>
          </CardHeader>
          <CardContent>
            <WarehouseBarChart data={stockDistributionData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

