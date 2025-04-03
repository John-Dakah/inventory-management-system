import { Loader2Icon } from "lucide-react"

export default function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">View and manage your notifications</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-12">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  )
}

