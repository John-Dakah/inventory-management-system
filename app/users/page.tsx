import { Suspense } from "react"
import { getUserStats, getUsers } from "@/lib/user-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersTable } from "@/components/users-table"
import { UserRoleDistribution } from "@/components/user-role-distribution"
import { UserActivityChart } from "@/components/user-activity-chart"
import { Users, UserCheck, UserX, UserPlus } from "lucide-react"

export const metadata = {
  title: "Users Management",
  description: "Manage system users and their permissions",
}

async function UsersPage() {
  // Get user statistics
  const stats = await getUserStats()

  // Get users for the table (first page)
  const { users, pagination } = await getUsers(1, 10)

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.newUsersThisMonth} new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activePercentage}% of total users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Roles</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers} Admins</div>
            <p className="text-xs text-muted-foreground">
              {stats.warehouseManagers} Warehouse, {stats.salesPersons} Sales
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all-users" className="space-y-4">
          <UsersTable initialUsers={users} pagination={pagination} />
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <UsersTable
            initialUsers={users.filter((user) => user.status === "active")}
            pagination={pagination}
            filterStatus="active"
          />
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4">
          <UsersTable
            initialUsers={users.filter((user) => user.status === "inactive")}
            pagination={pagination}
            filterStatus="inactive"
          />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Breakdown of users by role</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <UserRoleDistribution
              adminUsers={stats.adminUsers}
              warehouseManagers={stats.warehouseManagers}
              salesPersons={stats.salesPersons}
            />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Active vs. inactive users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UsersPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading user data...</div>}>
      <UsersPage />
    </Suspense>
  )
}
