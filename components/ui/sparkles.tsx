"use client"

import { useRef, useEffect } from "react"

export const SparklesCore = ({
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 100,
  className,
  particleColor = "#FFFFFF",
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      const width = (canvas.width = canvas.offsetWidth)
      const height = (canvas.height = canvas.offsetHeight)

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particleDensity; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * (maxSize - minSize) + minSize
        const opacity = Math.random()

        ctx.fillStyle = particleColor
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [minSize, maxSize, particleDensity, particleColor])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: background,
        pointerEvents: "none",
      }}
      className={className}
    />
  )
}

