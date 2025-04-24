"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOffIcon, RefreshCwIcon as RefreshIcon } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <WifiOffIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You are currently offline. Some features may be limited until you reconnect.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()}>
              <RefreshIcon className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <Link href="/pos">
              <Button variant="outline" className="w-full">
                Continue to POS (Offline Mode)
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

