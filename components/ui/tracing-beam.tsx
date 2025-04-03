"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [svgHeight, setSvgHeight] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight)
    }

    const handleScroll = () => {
      if (!ref.current) return

      const { top, height } = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate scroll progress (0 to 1)
      const progress = Math.max(0, Math.min(1, 1 - top / (windowHeight - height)))

      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Calculate the position of the dot based on scroll progress
  const dotPosition = 50 + (svgHeight - 100) * scrollProgress

  return (
    <div ref={ref} className={cn("relative w-full max-w-4xl mx-auto", className)}>
      <div className="absolute -left-4 md:-left-20 top-3">
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)",
          }}
        >
          <svg
            width="20"
            height={svgHeight}
            viewBox={`0 0 20 ${svgHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={`M10 10 L10 ${svgHeight - 10}`}
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient
                id="gradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={dotPosition}
                x2="0"
                y2={dotPosition + 100}
              >
                <stop stopColor="#18CCFC" stopOpacity="0" />
                <stop stopColor="#18CCFC" />
                <stop offset="0.325" stopColor="#6344F5" />
                <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              top: dotPosition,
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            className="h-4 w-4 rounded-full bg-primary"
          />
        </div>
      </div>
      <div ref={contentRef} className="ml-4 md:ml-16">
        {children}
      </div>
    </div>
  )
}

