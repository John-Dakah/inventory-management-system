"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { useState } from "react"

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string
    description: string
    icon: React.ReactNode
  }[]
  className?: string
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10", className)}>
      {items.map((item, idx) => (
        <div
          key={item.title}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            className={cn(
              "absolute inset-0 h-full w-full bg-primary/0 block rounded-lg transition-colors duration-300",
              hoveredIndex === idx && "bg-primary/10 dark:bg-primary/20",
            )}
          />
          <div className="rounded-lg h-full w-full p-4 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative z-10 group-hover:border-primary/50 transition-colors">
            <div className="relative z-10">
              <div className="p-4 rounded-full bg-primary/10 w-fit mb-4">{item.icon}</div>
              <div className="font-bold text-xl mb-2">{item.title}</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

