import { Loader2Icon } from "lucide-react"

export default function ReportsLoading() {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2Icon className="mr-2 h-6 w-6 animate-spin" />
      <span>Loading report data...</span>
    </div>
  )
}

