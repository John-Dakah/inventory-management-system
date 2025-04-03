"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string
    name: string
    title: string
  }[]
  direction?: "left" | "right"
  speed?: "fast" | "normal" | "slow"
  pauseOnHover?: boolean
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollerRef.current) return

    const scrollerContent = Array.from(scrollerRef.current.children)

    // Duplicate the content for seamless scrolling
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true)
      scrollerRef.current?.appendChild(duplicatedItem)
    })
  }, [])

  const getAnimationDuration = () => {
    switch (speed) {
      case "fast":
        return 20
      case "normal":
        return 40
      case "slow":
        return 80
      default:
        return 40
    }
  }

  return (
    <div ref={containerRef} className={cn("relative z-20 max-w-7xl overflow-hidden", className)}>
      <div
        ref={scrollerRef}
        className={cn(
          "flex gap-4 py-4",
          direction === "right" ? "animate-scroll-right" : "animate-scroll-left",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{
          animationDuration: `${getAnimationDuration()}s`,
        }}
      >
        {items.map((item, idx) => (
          <div
            className="w-[350px] max-w-full flex-shrink-0 rounded-2xl border border-gray-200 bg-white px-8 py-6 dark:border-gray-700 dark:bg-gray-800"
            key={idx}
          >
            <blockquote>
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300">"{item.quote}"</p>
                <div className="mt-6">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.title}</p>
                </div>
              </div>
            </blockquote>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * ${items.length} - ${items.length * 16}px));
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(calc(-350px * ${items.length} - ${items.length * 16}px));
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-scroll-left {
          animation: scroll-left linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right linear infinite;
        }
      `}</style>
    </div>
  )
}

