import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Card, CardContent } from "@/components/ui/card"
  import Link from "next/link"
  import { ChevronRight } from "lucide-react"
  
  export default function SystemOverviewPage() {
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
                <Link href="/getting-started/system-overview">Getting Started</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>System Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <h1 className="text-3xl font-bold mb-6">System Overview</h1>
  
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What is the Inventory Management System?</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  The Inventory Management System is a comprehensive web-based solution designed to help businesses
                  efficiently track, manage, and optimize their inventory operations. Our system provides real-time
                  visibility into stock levels, product information, and inventory movements.
                </p>
                <p>
                  Whether you're a small business or a large enterprise, our system scales to meet your inventory
                  management needs with an intuitive interface and powerful features.
                </p>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex gap-2">
                    <div className="font-medium min-w-40">Product Management</div>
                    <div>Add, edit, and organize products with detailed attributes and variants</div>
                  </li>
                  <li className="flex gap-2">
                    <div className="font-medium min-w-40">Inventory Control</div>
                    <div>Track stock levels, manage inventory adjustments, and set up low stock alerts</div>
                  </li>
                  <li className="flex gap-2">
                    <div className="font-medium min-w-40">Order Management</div>
                    <div>Process purchase orders, sales orders, and track order fulfillment</div>
                  </li>
                  <li className="flex gap-2">
                    <div className="font-medium min-w-40">Reporting & Analytics</div>
                    <div>Generate standard and custom reports to gain insights into inventory performance</div>
                  </li>
                  <li className="flex gap-2">
                    <div className="font-medium min-w-40">Multi-location Support</div>
                    <div>Manage inventory across multiple warehouses or retail locations</div>
                  </li>
                  <li className="flex gap-2">
                    <div className="font-medium min-w-40">User Management</div>
                    <div>Control access with role-based permissions for different team members</div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">System Architecture</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Our Inventory Management System is built on a modern, scalable architecture:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Frontend:</strong> React-based user interface with responsive design for desktop and mobile
                    access
                  </li>
                  <li>
                    <strong>Backend:</strong> Secure API services handling business logic and data processing
                  </li>
                  <li>
                    <strong>Database:</strong> Optimized data storage for fast inventory queries and updates
                  </li>
                  <li>
                    <strong>Integration:</strong> APIs for connecting with e-commerce platforms, accounting software, and
                    shipping services
                  </li>
                  <li>
                    <strong>Security:</strong> Role-based access control, data encryption, and secure authentication
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  To get started with the Inventory Management System, we recommend following these steps:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    Review the{" "}
                    <Link href="/getting-started/quick-start" className="text-blue-600 hover:underline">
                      Quick Start Guide
                    </Link>{" "}
                    for a brief introduction
                  </li>
                  <li>
                    Set up your account following the{" "}
                    <Link href="/getting-started/account-setup" className="text-blue-600 hover:underline">
                      Account Setup
                    </Link>{" "}
                    instructions
                  </li>
                  <li>
                    Take the{" "}
                    <Link href="/getting-started/ui-tour" className="text-blue-600 hover:underline">
                      User Interface Tour
                    </Link>{" "}
                    to familiarize yourself with the system
                  </li>
                  <li>
                    Begin adding your products using the{" "}
                    <Link href="/product-management/adding-products" className="text-blue-600 hover:underline">
                      Adding Products
                    </Link>{" "}
                    guide
                  </li>
                  <li>
                    Set up your inventory tracking with the{" "}
                    <Link href="/inventory-control/stock-management" className="text-blue-600 hover:underline">
                      Stock Management
                    </Link>{" "}
                    tools
                  </li>
                </ol>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    )
  }
  