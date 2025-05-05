"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface UserRoleDistributionProps {
  adminUsers: number
  warehouseManagers: number
  salesPersons: number
}

export function UserRoleDistribution({ adminUsers, warehouseManagers, salesPersons }: UserRoleDistributionProps) {
  const data = [
    { name: "Admins", value: adminUsers },
    { name: "Warehouse Managers", value: warehouseManagers },
    { name: "Sales Persons", value: salesPersons },
  ].filter((item) => item.value > 0)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      {data.length > 0 ? (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
          <Legend />
        </PieChart>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      )}
    </ResponsiveContainer>
  )
}
