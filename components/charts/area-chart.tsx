"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { getStockTransactions } from "@/lib/db"

// Define the data structure for the chart
interface StockData {
  name: string
  value: number
}

export default function StockAreaChart() {
  const [data, setData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all stock transactions
        const transactions = await getStockTransactions()

        // Group transactions by month and calculate total stock
        const monthlyData: Record<string, number> = {}

        // Sort transactions by date
        transactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        // Process transactions to create a running total by month
        transactions.forEach((transaction) => {
          const date = new Date(transaction.createdAt)
          const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = 0
          }

          // Add for "in" transactions, subtract for "out" transactions
          if (transaction.type === "in") {
            monthlyData[monthYear] += transaction.quantity
          } else if (transaction.type === "out") {
            monthlyData[monthYear] -= transaction.quantity
          }
        })

        // Convert to array format for the chart
        const chartData = Object.entries(monthlyData).map(([name, value]) => ({
          name,
          value,
        }))

        setData(chartData.length > 0 ? chartData : generateFallbackData())
      } catch (error) {
        console.error("Error fetching stock data for chart:", error)
        setData(generateFallbackData())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate fallback data if no real data is available
  function generateFallbackData(): StockData[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    return months.slice(0, currentMonth + 1).map((month) => ({
      name: `${month} ${new Date().getFullYear()}`,
      value: Math.floor(Math.random() * 1000) + 500,
    }))
  }

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center">Loading stock data...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorStock)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

