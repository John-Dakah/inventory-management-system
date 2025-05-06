import type { Metadata } from "next"
import POSClient from "@/components/pos-client"

export const metadata: Metadata = {
  title: "Point of Sale | Retail Management System",
  description: "Process sales and manage transactions",
}

export default function POSPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <POSClient />
    </div>
  )
}
