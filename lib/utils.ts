import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { businessInfo } from "@/lib/pos-config"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export function formatCurrency(amount: number): string {
  return `${businessInfo.currency}${amount.toFixed(2)}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

export function calculateTax(amount: number): number {
  return (amount * businessInfo.taxRate) / 100
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

