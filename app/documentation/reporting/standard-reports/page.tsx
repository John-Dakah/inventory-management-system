import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import Link from "next/link"
  import { ChevronRight, FileText, BarChart, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"
  
  export default function StandardReportsPage() {
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
                <Link href="/reporting/standard-reports">Reporting & Analytics</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Standard Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <h1 className="text-3xl font-bold mb-6">Standard Reports</h1>
  
        <p className="text-lg mb-6">
          The Inventory Management System includes a comprehensive set of standard reports to help you monitor and analyze
          your inventory performance. These reports provide valuable insights into stock levels, movement patterns,
          valuation, and more.
        </p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Inventory Valuation Report
              </CardTitle>
              <CardDescription>View the current value of your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">This report provides:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Total inventory value at cost and retail prices</li>
                <li>Valuation by product, category, or location</li>
                <li>Historical valuation trends</li>
                <li>Potential profit margins</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Use this report for financial reporting, insurance purposes, and investment decisions.
              </p>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Stock Level Report
              </CardTitle>
              <CardDescription>Monitor current inventory quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">This report shows:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Current stock levels for all products</li>
                <li>Stock status (in stock, low stock, out of stock)</li>
                <li>Available quantities by location</li>
                <li>Reserved quantities for pending orders</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Use this report for inventory planning, purchasing decisions, and preventing stockouts.
              </p>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Inventory Movement Report
              </CardTitle>
              <CardDescription>Track inventory changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">This report details:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Stock receipts, sales, transfers, and adjustments</li>
                <li>Movement patterns by date range</li>
                <li>Movement history for specific products</li>
                <li>User activity related to inventory changes</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Use this report to audit inventory changes, identify patterns, and investigate discrepancies.
              </p>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Low Stock Report
              </CardTitle>
              <CardDescription>Identify items that need reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">This report highlights:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Products below minimum stock levels</li>
                <li>Out-of-stock items</li>
                <li>Suggested reorder quantities</li>
                <li>Lead times and supplier information</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Use this report for purchasing planning and preventing stockouts that could impact sales.
              </p>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Product Performance Report
              </CardTitle>
              <CardDescription>Analyze sales and profitability by product</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">This report analyzes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sales volume and revenue by product</li>
                <li>Profit margins and contribution</li>
                <li>Bestsellers and slow-moving items</li>
                <li>Sales trends over time</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Use this report to optimize your product mix, pricing strategy, and promotional activities.
              </p>
            </CardContent>
          </Card>
        </div>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Running Reports</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">To run any standard report:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Navigate to Reporting & Analytics {'>'} Standard Reports</li>
                <li>Select the desired report from the list</li>
                <li>
                  Set the report parameters:
                  <ul className="list-disc pl-6 mt-2">
                    <li>Date range</li>
                    <li>Products or categories to include</li>
                    <li>Locations to include</li>
                    <li>Grouping and sorting options</li>
                  </ul>
                </li>
                <li>Click "Generate Report" to view the results</li>
                <li>Use the toolbar to export, print, or save the report</li>
              </ol>
            </CardContent>
          </Card>
        </section>
  
        <section>
          <h2 className="text-2xl font-semibold mb-4">Scheduling Reports</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                You can schedule reports to run automatically and be delivered to specified recipients:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Navigate to Reporting & Analytics {'>'} Scheduled Reports</li>
                <li>Click "New Scheduled Report"</li>
                <li>Select the report type and set parameters</li>
                <li>Set the schedule (daily, weekly, monthly)</li>
                <li>Add recipients who should receive the report</li>
                <li>Choose the delivery format (PDF, Excel, CSV)</li>
                <li>Save the scheduled report</li>
              </ol>
              <p className="mt-4">
                Scheduled reports are ideal for regular monitoring and distribution to team members or management.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    )
  }
  