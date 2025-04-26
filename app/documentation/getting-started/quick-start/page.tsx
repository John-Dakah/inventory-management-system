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
  
  export default function QuickStartPage() {
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
                <Link href="/getting-started/quick-start">Getting Started</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Quick Start Guide</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <h1 className="text-3xl font-bold mb-6">Quick Start Guide</h1>
  
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Tip</AlertTitle>
          <AlertDescription>
            This guide provides a quick overview to get you started. For more detailed information, refer to the specific
            sections in the documentation.
          </AlertDescription>
        </Alert>
  
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Create Your Account</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">To begin using the Inventory Management System, you'll need to create an account:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to the login page and click "Sign Up"</li>
                  <li>Enter your business email and create a secure password</li>
                  <li>Provide your business information when prompted</li>
                  <li>Verify your email address by clicking the link sent to your inbox</li>
                  <li>Complete your profile setup with business details and preferences</li>
                </ol>
                <p className="mt-4">
                  For more detailed instructions, see the{" "}
                  <Link href="/getting-started/account-setup" className="text-blue-600 hover:underline">
                    Account Setup
                  </Link>{" "}
                  guide.
                </p>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Set Up Your Inventory Structure</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Before adding products, set up your inventory structure:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Locations:</strong> Add warehouses, stores, or other physical locations where you store
                    inventory
                  </li>
                  <li>
                    <strong>Categories:</strong> Create product categories to organize your inventory
                  </li>
                  <li>
                    <strong>Attributes:</strong> Define product attributes like size, color, material, etc.
                  </li>
                  <li>
                    <strong>Units of Measure:</strong> Set up units for tracking inventory (pieces, boxes, kg, etc.)
                  </li>
                  <li>
                    <strong>Suppliers:</strong> Add your suppliers for purchase order management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Add Your First Product</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Now you're ready to add your first product:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to the Products section and click "Add New Product"</li>
                  <li>Enter basic product information (name, SKU, description)</li>
                  <li>Assign the product to a category</li>
                  <li>Add product attributes and variants if needed</li>
                  <li>Set pricing information</li>
                  <li>Upload product images</li>
                  <li>Save the product</li>
                </ol>
                <p className="mt-4">
                  For more details, see the{" "}
                  <Link href="/product-management/adding-products" className="text-blue-600 hover:underline">
                    Adding Products
                  </Link>{" "}
                  guide.
                </p>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Record Initial Inventory</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">After adding products, record your initial inventory:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Go to the Inventory section and select "Inventory Adjustment"</li>
                  <li>Choose the location where the inventory is stored</li>
                  <li>Select the product and enter the current quantity</li>
                  <li>Add a reference note (e.g., "Initial inventory count")</li>
                  <li>Submit the adjustment</li>
                </ol>
                <p className="mt-4">
                  For more information, see the{" "}
                  <Link href="/inventory-control/inventory-adjustments" className="text-blue-600 hover:underline">
                    Inventory Adjustments
                  </Link>{" "}
                  guide.
                </p>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Set Up Low Stock Alerts</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Configure low stock alerts to avoid stockouts:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to the product details page</li>
                  <li>Set the minimum stock level for each product</li>
                  <li>Configure notification preferences (email, in-app, etc.)</li>
                  <li>Save your settings</li>
                </ol>
                <p className="mt-4">
                  For more details, see the{" "}
                  <Link href="/inventory-control/low-stock-alerts" className="text-blue-600 hover:underline">
                    Low Stock Alerts
                  </Link>{" "}
                  guide.
                </p>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Explore Reports</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Familiarize yourself with the reporting capabilities:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Navigate to the Reports section</li>
                  <li>Explore standard reports like Inventory Valuation and Stock Levels</li>
                  <li>Try filtering and exporting reports</li>
                  <li>Set up dashboard widgets for key metrics</li>
                </ul>
                <p className="mt-4">
                  For more information, see the{" "}
                  <Link href="/reporting/standard-reports" className="text-blue-600 hover:underline">
                    Standard Reports
                  </Link>{" "}
                  guide.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    )
  }
  