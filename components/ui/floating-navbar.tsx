"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Package2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export const FloatingNavbar = ({
  navItems,
  className,
}: {
  navItems: {
    name: string
    link: string
  }[]
  className?: string
}) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className={cn("fixed top-4 inset-x-0 z-50 mx-auto max-w-fit", className)}>
      <div
        style={{
          scale: isScrolled ? 0.95 : 1,
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)",
          transition: "all 0.3s ease",
        }}
        className={cn(
          "flex items-center justify-center space-x-4 rounded-full border border-transparent bg-white/50 px-4 py-2 shadow-lg backdrop-blur-md dark:bg-gray-900/50",
          isScrolled ? "dark:border-white/[0.2]" : "dark:border-white/[0.1]",
        )}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package2Icon className="h-6 w-6" />
          <span className="hidden sm:inline-block">Inventory Pro</span>
        </Link>

        <div className="hidden md:flex items-center justify-center space-x-4">
          {navItems.map((item, idx) => (
            <Link
              key={`nav-item-${idx}`}
              href={item.link}
              className="relative text-sm font-medium px-3 py-1 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

