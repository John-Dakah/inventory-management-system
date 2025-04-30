"use client"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CashDrawerStatus {
  isOpen: boolean
  openedAt: Date
  openingBalance: number
  currentBalance: number
  cashSales: number
  cardSales: number
  mobileSales: number
  expectedAmount: number
  cashPayouts: number
}

interface CashTransaction {
  id: string
  date: Date
  type: string
  amount: number
  reference: string
  notes: string
}

interface CashDrawerHistory {
  id: string
  date: Date
  openedAt: string
  closedAt: string
  openingBalance: number
  closingBalance: number
  difference: number
  status: string
  cashier: string
}

const DENOMINATIONS = [
  { name: "$100 Bills", value: 100 },
  { name: "$50 Bills", value: 50 },
  { name: "$20 Bills", value: 20 },
  { name: "$10 Bills", value: 10 },
  { name: "$5 Bills", value: 5 },
  { name: "$1 Bills", value: 1 },
  { name: "Quarters", value: 0.25 },
  { name: "Dimes", value: 0.1 },
  { name: "Nickels", value: 0.05 },
  { name: "Pennies", value: 0.01 },
]

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export default function CashManagementClient() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("drawer")
  const [openDrawerDialog, setOpenDrawerDialog] = useState(false)
  const [closeDrawerDialog, setCloseDrawerDialog] = useState(false)
  const [payoutDialog, setPayoutDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const [drawerStatus, setDrawerStatus] = useState<CashDrawerStatus | null>(null)
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [drawerHistory, setDrawerHistory] = useState<CashDrawerHistory[]>([])
  const [loading, setLoading] = useState(true)

  const [denominations, setDenominations] = useState<{ [key: string]: number }>(
    DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.name]: 0 }), {})
  )

  const [payoutAmount, setPayoutAmount] = useState("")
  const [payoutReason, setPayoutReason] = useState("")
  const [payoutReference, setPayoutReference] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/cash-drawer", {
          headers: getAuthHeaders(),
          credentials: "include" 
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please login again.")
          }
          const errorData = await response.json()
          throw new Error(`Failed to fetch cash drawer data: ${errorData.error || response.statusText}`)
        }

        const data = await response.json()

        if (data.drawerStatus && data.drawerStatus.openedAt) {
          data.drawerStatus.openedAt = new Date(data.drawerStatus.openedAt)
        }

        setDrawerStatus(data.drawerStatus)
        setTransactions(data.transactions.map((t: any) => ({ ...t, date: new Date(t.date) })))
        setDrawerHistory(data.history.map((h: any) => ({ ...h, date: new Date(h.date) })))
      } catch (error) {
        console.error("Error fetching cash drawer data:", error)
        toast({
          title: "Error",
          description: `Failed to load cash drawer data: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const calculateTotal = () => {
    return DENOMINATIONS.reduce((total, denom) => {
      return total + (denominations[denom.name] || 0) * denom.value
    }, 0)
  }

  const handleOpenDrawer = async () => {
    setIsProcessing(true)
    try {
      const amount = calculateTotal()
      const response = await fetch("/api/cash-drawer", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include", 
        body: JSON.stringify({ action: "open", amount }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.")
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to open cash drawer")
      }

      toast({
        title: "Cash Drawer Opened",
        description: "Cash drawer has been successfully opened.",
      })
      window.location.reload()
    } catch (error) {
      console.error("Error opening cash drawer:", error)
      toast({
        title: "Error",
        description: `Failed to open cash drawer: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setOpenDrawerDialog(false)
      setDenominations(DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.name]: 0 }), {}))
    }
  }

  const handleCloseDrawer = async () => {
    setIsProcessing(true)
    try {
      const amount = calculateTotal()
      const response = await fetch("/api/cash-drawer", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include", 
        body: JSON.stringify({ action: "close", amount }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.")
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to close cash drawer")
      }

      toast({
        title: "Cash Drawer Closed",
        description: "Cash drawer has been successfully closed and balanced.",
      })
      window.location.reload()
    } catch (error) {
      console.error("Error closing cash drawer:", error)
      toast({
        title: "Error",
        description: `Failed to close cash drawer: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setCloseDrawerDialog(false)
      setDenominations(DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.name]: 0 }), {}))
    }
  }

  const handlePayout = async () => {
    if (!payoutAmount || Number.parseFloat(payoutAmount) <= 0 || !payoutReason) {
      toast({
        title: "Invalid Payout",
        description: "Please enter a valid amount and reason for the payout.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/cash-drawer", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include", 
        body: JSON.stringify({
          action: "payout",
          amount: Number.parseFloat(payoutAmount),
          reason: payoutReason,
          reference: payoutReference,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.")
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to record payout")
      }

      toast({
        title: "Payout Recorded",
        description: `$${payoutAmount} has been paid out from the cash drawer.`,
      })
      window.location.reload()
    } catch (error) {
      console.error("Error recording payout:", error)
      toast({
        title: "Error",
        description: `Failed to record payout: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setPayoutDialog(false)
      setPayoutAmount("")
      setPayoutReason("")
      setPayoutReference("")
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }
 
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cash Management</h1>
      
      {/* Add your tabs UI here */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'drawer' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('drawer')}
        >
          Cash Drawer
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'transactions' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Conditional rendering based on activeTab */}
      {activeTab === 'drawer' && (
        <div>
          {/* Cash drawer content */}
          {drawerStatus?.isOpen ? (
            <div>
              <p>Drawer is open since {drawerStatus.openedAt.toLocaleString()}</p>
              <button 
                onClick={() => setCloseDrawerDialog(true)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Close Drawer
              </button>
            </div>
          ) : (
            <div>
              <p>Drawer is currently closed</p>
              <button 
                onClick={() => setOpenDrawerDialog(true)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Open Drawer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dialog and Modal Components */}
{openDrawerDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Open Cash Drawer</h2>
      <p className="mb-4">Enter starting cash amounts:</p>
      
      <div className="space-y-3 mb-6">
        {DENOMINATIONS.map((denom) => (
          <div key={denom.name} className="flex items-center">
            <label className="w-32">{denom.name}:</label>
            <input
              type="number"
              min="0"
              className="border rounded px-2 py-1 w-24"
              value={denominations[denom.name] || 0}
              onChange={(e) => setDenominations({
                ...denominations,
                [denom.name]: parseInt(e.target.value) || 0
              })}
            />
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <p className="font-semibold">Total: ${calculateTotal().toFixed(2)}</p>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => setOpenDrawerDialog(false)}
          className="px-4 py-2 border rounded"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={handleOpenDrawer}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isProcessing}
        >
          {isProcessing ? 'Opening...' : 'Open Drawer'}
        </button>
      </div>
    </div>
  </div>
)}

{closeDrawerDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Close Cash Drawer</h2>
      <p className="mb-4">Enter remaining cash amounts:</p>
      
      <div className="space-y-3 mb-6">
        {DENOMINATIONS.map((denom) => (
          <div key={denom.name} className="flex items-center">
            <label className="w-32">{denom.name}:</label>
            <input
              type="number"
              min="0"
              className="border rounded px-2 py-1 w-24"
              value={denominations[denom.name] || 0}
              onChange={(e) => setDenominations({
                ...denominations,
                [denom.name]: parseInt(e.target.value) || 0
              })}
            />
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <p className="font-semibold">Total: ${calculateTotal().toFixed(2)}</p>
        {drawerStatus && (
          <p className="text-sm text-gray-600">
            Expected: ${drawerStatus.expectedAmount.toFixed(2)} | 
            Difference: ${(calculateTotal() - drawerStatus.expectedAmount).toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => setCloseDrawerDialog(false)}
          className="px-4 py-2 border rounded"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={handleCloseDrawer}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={isProcessing}
        >
          {isProcessing ? 'Closing...' : 'Close Drawer'}
        </button>
      </div>
    </div>
  </div>
)}

{payoutDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Record Cash Payout</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-1">Amount ($)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="border rounded px-2 py-1 w-full"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-1">Reason</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={payoutReason}
            onChange={(e) => setPayoutReason(e.target.value)}
            placeholder="e.g. Vendor payment, Refund, etc."
          />
        </div>
        
        <div>
          <label className="block mb-1">Reference (Optional)</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={payoutReference}
            onChange={(e) => setPayoutReference(e.target.value)}
            placeholder="Invoice #, Receipt #, etc."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => setPayoutDialog(false)}
          className="px-4 py-2 border rounded"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={handlePayout}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Record Payout'}
        </button>
      </div>
    </div>
  </div>
)}

{/* Cash Drawer Status Card */}
{drawerStatus && (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-lg font-semibold">
          Cash Drawer {drawerStatus.isOpen ? 'Open' : 'Closed'}
        </h2>
        {drawerStatus.isOpen && (
          <p className="text-sm text-gray-600">
            Opened at: {drawerStatus.openedAt.toLocaleString()}
          </p>
        )}
      </div>
      
      <div className="space-x-2">
        {drawerStatus.isOpen ? (
          <>
            <button
              onClick={() => setPayoutDialog(true)}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
            >
              Record Payout
            </button>
            <button
              onClick={() => setCloseDrawerDialog(true)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Close Drawer
            </button>
          </>
        ) : (
          <button
            onClick={() => setOpenDrawerDialog(true)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Open Drawer
          </button>
        )}
      </div>
    </div>

    {drawerStatus.isOpen && (
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Opening Balance</p>
          <p className="font-semibold">${drawerStatus.openingBalance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Current Balance</p>
          <p className="font-semibold">${drawerStatus.currentBalance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Cash Sales</p>
          <p className="font-semibold">${drawerStatus.cashSales.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Card Sales</p>
          <p className="font-semibold">${drawerStatus.cardSales.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Cash Payouts</p>
          <p className="font-semibold">${drawerStatus.cashPayouts.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Expected Amount</p>
          <p className="font-semibold">${drawerStatus.expectedAmount.toFixed(2)}</p>
        </div>
      </div>
    )}
  </div>
)}

{/* Transactions Table */}
{activeTab === 'transactions' && (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-4 border-b flex justify-between items-center">
      <h2 className="font-semibold">Recent Transactions</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search transactions..."
          className="border rounded px-2 py-1 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={dateFilter?.toISOString().split('T')[0] || ''}
          onChange={(e) => setDateFilter(e.target.value ? new Date(e.target.value) : undefined)}
        />
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions
            .filter(tx => 
              searchQuery === '' || 
              tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
              tx.notes.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter(tx => !dateFilter || tx.date.toDateString() === dateFilter.toDateString())
            .map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.date.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tx.type}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  tx.amount < 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  ${Math.abs(tx.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.reference}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {tx.notes}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{/* Drawer History Table */}
{activeTab === 'history' && (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-4 border-b">
      <h2 className="font-semibold">Drawer History</h2>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closing</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {drawerHistory.map((history) => (
            <tr key={history.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {history.date.toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  history.status === 'balanced' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {history.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {history.cashier}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${history.openingBalance.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${history.closingBalance.toFixed(2)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                history.difference < 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                ${Math.abs(history.difference).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
    </div>
  )
  
}