"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function UserActivityChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This would normally fetch from an API
    // For now, we'll use mock data
    const mockData = [
      {
        name: "Jan",
        active: 40,
        inactive: 5,
      },
      {
        name: "Feb",
        active: 45,
        inactive: 7,
      },
      {
        name: "Mar",
        active: 47,
        inactive: 8,
      },
      {
        name: "Apr",
        active: 52,
        inactive: 6,
      },
      {
        name: "May",
        active: 55,
        inactive: 9,
      },
      {
        name: "Jun",
        active: 60,
        inactive: 10,
      },
    ]

    setData(mockData)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="active" fill="#4ade80" name="Active Users" />
        <Bar dataKey="inactive" fill="#f87171" name="Inactive Users" />
      </BarChart>
    </ResponsiveContainer>
  )
}
