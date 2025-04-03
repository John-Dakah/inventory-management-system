"use client"

import { AreaChart, Card, Title } from "@tremor/react"

const data = [
  {
    date: "Jan 22",
    Stock: 2890,
    Sales: 2338,
  },
  {
    date: "Feb 22",
    Stock: 2756,
    Sales: 2103,
  },
  {
    date: "Mar 22",
    Stock: 3322,
    Sales: 2194,
  },
  {
    date: "Apr 22",
    Stock: 3470,
    Sales: 2108,
  },
  {
    date: "May 22",
    Stock: 3475,
    Sales: 1812,
  },
  {
    date: "Jun 22",
    Stock: 3129,
    Sales: 1726,
  },
]

export function Overview() {
  return (
    <Card>
      <Title>Stock vs Sales</Title>
      <AreaChart
        className="mt-4 h-72"
        data={data}
        index="date"
        categories={["Stock", "Sales"]}
        colors={["indigo", "cyan"]}
      />
    </Card>
  )
}

