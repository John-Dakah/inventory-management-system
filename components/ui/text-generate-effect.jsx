"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function TextGenerateEffect({ words, className }) {
  const [wordArray, setWordArray] = useState([])
  const [currentText, setCurrentText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setWordArray(words.split(" "))
  }, [words])

  useEffect(() => {
    if (wordArray.length === 0) return

    const timeout = setTimeout(() => {
      if (currentText.split(" ").length >= wordArray.length) {
        setIsComplete(true)
        return
      }

      setCurrentText(wordArray.slice(0, currentText.split(" ").length + 1).join(" "))
    }, 50)

    return () => clearTimeout(timeout)
  }, [currentText, wordArray])

  return (
    <div className={cn("font-medium", className)}>
      <div className="mt-4">
        <div className="text-base sm:text-xl md:text-2xl text-center max-w-2xl mx-auto">
          {currentText}
          {!isComplete && <span className="animate-pulse">|</span>}
        </div>
      </div>
    </div>
  )
}

