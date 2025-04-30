import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import CashManagementClient from "./cash-management-client"

export const metadata = {
  title: "Cash Management",
  description: "Manage your cash drawer and transactions",
}

export default function CashManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingState />}>
        <CashManagementClient />
      </Suspense>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
