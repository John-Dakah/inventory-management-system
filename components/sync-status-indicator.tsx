"use client"

import { Check, CloudOff, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SyncStatus } from "@/types"

interface SyncStatusIndicatorProps {
  status: SyncStatus
  error?: string
}

export function SyncStatusIndicator({ status, error }: SyncStatusIndicatorProps) {
  let icon
  let label
  let tooltipText

  switch (status) {
    case "synced":
      icon = <Check className="h-4 w-4 text-green-500" />
      label = "Synced"
      tooltipText = "This record is synced with the server"
      break
    case "pending":
      icon = <RefreshCw className="h-4 w-4 text-amber-500 animate-pulse" />
      label = "Pending"
      tooltipText = "This record is waiting to be synced with the server"
      break
    case "error":
      icon = <CloudOff className="h-4 w-4 text-red-500" />
      label = "Error"
      tooltipText = error || "There was an error syncing this record with the server"
      break
    default:
      icon = <Check className="h-4 w-4 text-green-500" />
      label = "Synced"
      tooltipText = "This record is synced with the server"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {icon}
            <span className="sr-only">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

