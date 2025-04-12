"use client"

import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NetworkStatus() {
  const isOnline = useNetworkStatus()

  // Get the raw browser online status for comparison
  const browserOnlineStatus = typeof navigator !== "undefined" ? navigator.onLine : false

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isOnline ? "default" : "outline"}
            className={isOnline ? "bg-green-500" : "text-amber-500 border-amber-500"}
          >
            {isOnline ? (
              <>
                <Wifi className="mr-1 h-3 w-3" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline ? (
            <p>Connected to server</p>
          ) : browserOnlineStatus ? (
            <p>Browser reports online, but can't reach the server</p>
          ) : (
            <p>No network connection available</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

