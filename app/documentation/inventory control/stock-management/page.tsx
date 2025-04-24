import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Card, CardContent } from "@/components/ui/card"
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
  import Link from "next/link"
  import { ChevronRight, Info } from "lucide-react"
  
  export default function StockManagementPage() {
    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/inventory-control/stock-management">Inventory Control</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Stock Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <h1 className="text-3xl font-bold mb-6">Stock Management</h1>
  
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Accurate stock management is essential for preventing stockouts and overstock situations. Regularly update
            your inventory counts to maintain accuracy.
          </AlertDescription>
        </Alert>
  
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Stock Overview</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  The Stock Overview provides a real-time view of your current inventory levels across all locations. From
                  this screen, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View current stock levels for all products</li>
                  <li>Filter products by category, location, or stock status</li>
                  <li>Identify low stock or out-of-stock items</li>
                  <li>See inventory valuation at current cost</li>
                  <li>Access quick actions for inventory adjustments</li>
                </ul>
                <p className="mt-4">
                  To access the Stock Overview, navigate to Inventory Control &gt; Stock Overview in the main menu.
                </p>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">Stock Movements</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Stock movements track all changes to your inventory. The system records the following types of
                  movements:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Stock Receipts:</strong> Inventory received from suppliers
                  </li>
                  <li>
                    <strong>Stock Sales:</strong> Inventory sold to customers
                  </li>
                  <li>
                    <strong>Stock Transfers:</strong> Inventory moved between locations
                  </li>
                  <li>
                    <strong>Stock Adjustments:</strong> Manual corrections to inventory counts
                  </li>
                  <li>
                    <strong>Stock Returns:</strong> Items returned by customers or to suppliers
                  </li>
                </ul>
                <p className="mt-4">Each movement includes details such as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Date and time of the movement</li>
                  <li>User who performed the action</li>
                  <li>Quantity changed</li>
                  <li>Reference document (e.g., purchase order, sales order)</li>
                  <li>Notes or reasons for the movement</li>
                </ul>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">Stock Counts</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Regular stock counts (physical inventory) help maintain accurate inventory records. The system supports
                  both full and cycle counting methods:
                </p>
                <h3 className="text-lg font-medium mb-2">Full Inventory Count</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Navigate to Inventory Control {'>'} Stock Counts</li>
                  <li>Click "New Stock Count" and select "Full Inventory"</li>
                  <li>Choose the location for the count</li>
                  <li>Generate and print count sheets if needed</li>
                  <li>Enter the counted quantities for each product</li>
                  <li>Review discrepancies between system and counted quantities</li>
                  <li>Approve and post the count to update inventory levels</li>
                </ol>
  
                <h3 className="text-lg font-medium mb-2">Cycle Counting</h3>
                <p className="mb-4">Cycle counting involves counting a subset of inventory on a rotating schedule:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to Inventory Control {'>'} Stock Counts</li>
                  <li>Click "New Stock Count" and select "Cycle Count"</li>
                  <li>Choose counting criteria (category, value, location, etc.)</li>
                  <li>Generate the count for the selected items</li>
                  <li>Enter counted quantities</li>
                  <li>Review and post the count</li>
                </ol>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">Stock Transfers</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Stock transfers allow you to move inventory between locations:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to Inventory Control {'>'} Stock Transfers</li>
                  <li>Click "New Transfer"</li>
                  <li>Select source and destination locations</li>
                  <li>Add products and quantities to transfer</li>
                  <li>Set a transfer date and reference</li>
                  <li>
                    Choose the transfer status:
                    <ul className="list-disc pl-6 mt-2">
                      <li>
                        <strong>Draft:</strong> Saved but not processed
                      </li>
                      <li>
                        <strong>In Transit:</strong> Items have left source but not arrived at destination
                      </li>
                      <li>
                        <strong>Completed:</strong> Items have arrived at destination
                      </li>
                    </ul>
                  </li>
                  <li>Process the transfer to update inventory at both locations</li>
                </ol>
                <p className="mt-4">
                  For multi-step transfers or transfers requiring approval, use the advanced transfer workflow options.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    )
  }
  