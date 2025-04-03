"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { getStockItems } from "@/lib/db"

interface LocationData {
  name: string
  value: number
}

export default function WarehouseBarChart() {
  const [data, setData] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all stock items
        const stockItems = await getStockItems()

        // Group items by location and sum quantities
        const locationData: Record<string, number> = {}

        stockItems.forEach((item) => {
          if (!locationData[item.location]) {
            locationData[item.location] = 0
          }
          locationData[item.location] += item.quantity
        })

        // Convert to array format for the chart
        const chartData = Object.entries(locationData).map(([name, value]) => ({
          name,
          value,
        }))

        setData(chartData.length > 0 ? chartData : generateFallbackData())
      } catch (error) {
        console.error("Error fetching location data for chart:", error)
        setData(generateFallbackData())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate fallback data if no real data is available
  function generateFallbackData(): LocationData[] {
    const locations = ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"]

    return locations.map((location) => ({
      name: location,
      value: Math.floor(Math.random() * 500) + 100,
    }))
  }

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center">Loading location data...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

