"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function WavyBackground({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}) {
  const containerRef = useRef(null)
  const [waveColors, setWaveColors] = useState(colors || ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"])

  const [fillColor, setFillColor] = useState(backgroundFill || "#f8fafc")

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [wavesWidth, setWavesWidth] = useState(waveWidth || 50)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setWidth(entry.contentRect.width)
          setHeight(entry.contentRect.height)
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className={cn("relative flex flex-col overflow-hidden", containerClassName)} ref={containerRef} {...props}>
      <svg
        className="absolute inset-0 z-0"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <rect width={width} height={height} fill={fillColor} />
        {Array.from({ length: waveColors.length }).map((_, index) => {
          const waveId = `wave-${index}`
          const animationDuration = speed === "fast" ? "5s" : "10s"
          const animationDelay = `${index * 0.1}s`

          return (
            <g key={index} filter="url(#blur)">
              <path
                id={waveId}
                fill={waveColors[index]}
                fillOpacity={waveOpacity}
                d={`M 0 ${height * 0.5} Q ${wavesWidth * 0.25} ${
                  height * 0.35
                } ${wavesWidth * 0.5} ${height * 0.5} T ${wavesWidth} ${
                  height * 0.5
                } T ${wavesWidth * 1.5} ${height * 0.5} T ${wavesWidth * 2} ${
                  height * 0.5
                } T ${wavesWidth * 2.5} ${height * 0.5} T ${wavesWidth * 3} ${
                  height * 0.5
                } T ${wavesWidth * 3.5} ${height * 0.5} T ${wavesWidth * 4} ${
                  height * 0.5
                } T ${wavesWidth * 4.5} ${height * 0.5} T ${wavesWidth * 5} ${height * 0.5} V ${height} H 0 Z`}
              >
                <animate
                  attributeName="d"
                  values={`
                    M 0 ${height * 0.5} Q ${wavesWidth * 0.25} ${
                      height * 0.35
                    } ${wavesWidth * 0.5} ${height * 0.5} T ${wavesWidth} ${
                      height * 0.5
                    } T ${wavesWidth * 1.5} ${height * 0.5} T ${wavesWidth * 2} ${
                      height * 0.5
                    } T ${wavesWidth * 2.5} ${height * 0.5} T ${wavesWidth * 3} ${
                      height * 0.5
                    } T ${wavesWidth * 3.5} ${height * 0.5} T ${wavesWidth * 4} ${
                      height * 0.5
                    } T ${wavesWidth * 4.5} ${height * 0.5} T ${wavesWidth * 5} ${height * 0.5} V ${height} H 0 Z;
                    M 0 ${height * 0.5} Q ${wavesWidth * 0.25} ${
                      height * 0.65
                    } ${wavesWidth * 0.5} ${height * 0.5} T ${wavesWidth} ${
                      height * 0.5
                    } T ${wavesWidth * 1.5} ${height * 0.5} T ${wavesWidth * 2} ${
                      height * 0.5
                    } T ${wavesWidth * 2.5} ${height * 0.5} T ${wavesWidth * 3} ${
                      height * 0.5
                    } T ${wavesWidth * 3.5} ${height * 0.5} T ${wavesWidth * 4} ${
                      height * 0.5
                    } T ${wavesWidth * 4.5} ${height * 0.5} T ${wavesWidth * 5} ${height * 0.5} V ${height} H 0 Z;
                    M 0 ${height * 0.5} Q ${wavesWidth * 0.25} ${
                      height * 0.35
                    } ${wavesWidth * 0.5} ${height * 0.5} T ${wavesWidth} ${
                      height * 0.5
                    } T ${wavesWidth * 1.5} ${height * 0.5} T ${wavesWidth * 2} ${
                      height * 0.5
                    } T ${wavesWidth * 2.5} ${height * 0.5} T ${wavesWidth * 3} ${
                      height * 0.5
                    } T ${wavesWidth * 3.5} ${height * 0.5} T ${wavesWidth * 4} ${
                      height * 0.5
                    } T ${wavesWidth * 4.5} ${height * 0.5} T ${wavesWidth * 5} ${height * 0.5} V ${height} H 0 Z;
                  `}
                  dur={animationDuration}
                  repeatCount="indefinite"
                  begin={animationDelay}
                />
              </path>
            </g>
          )
        })}
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

