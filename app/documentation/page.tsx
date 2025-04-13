import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  BookOpen,
  FileText,
  Code,
  Database,
  Settings,
  ShoppingCart,
  BarChart,
  Users,
  Truck,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react"

export default function DocumentationPage() {
  const docCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of our inventory management system",
      icon: <BookOpen className="h-6 w-6" />,
      articles: [
        { title: "System Overview", link: "/documentation/overview" },
        { title: "Quick Start Guide", link: "/documentation/quick-start" },
        { title: "Account Setup", link: "/documentation/account-setup" },
        { title: "User Interface Tour", link: "/documentation/ui-tour" },
      ],
    },
    {
      title: "Product Management",
      description: "Manage your products, categories, and variants",
      icon: <ShoppingCart className="h-6 w-6" />,
      articles: [
        { title: "Adding Products", link: "/documentation/adding-products" },
        { title: "Product Categories", link: "/documentation/product-categories" },
        { title: "Managing Variants", link: "/documentation/variants" },
        { title: "Product Attributes", link: "/documentation/attributes" },
      ],
    },
    {
      title: "Inventory Control",
      description: "Track and manage your inventory levels",
      icon: <Database className="h-6 w-6" />,
      articles: [
        { title: "Stock Management", link: "/documentation/stock-management" },
        { title: "Inventory Adjustments", link: "/documentation/adjustments" },
        { title: "Low Stock Alerts", link: "/documentation/low-stock-alerts" },
        { title: "Batch Tracking", link: "/documentation/batch-tracking" },
      ],
    },
    {
      title: "Reporting & Analytics",
      description: "Generate reports and analyze your inventory data",
      icon: <BarChart className="h-6 w-6" />,
      articles: [
        { title: "Standard Reports", link: "/documentation/standard-reports" },
        { title: "Custom Reports", link: "/documentation/custom-reports" },
        { title: "Dashboard Widgets", link: "/documentation/dashboard-widgets" },
        { title: "Data Export", link: "/documentation/data-export" },
      ],
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: <Users className="h-6 w-6" />,
      articles: [
        { title: "User Roles", link: "/documentation/user-roles" },
        { title: "Permissions", link: "/documentation/permissions" },
        { title: "Team Management", link: "/documentation/team-management" },
        { title: "Activity Logs", link: "/documentation/activity-logs" },
      ],
    },
    {
      title: "Integrations",
      description: "Connect with other systems and platforms",
      icon: <Code className="h-6 w-6" />,
      articles: [
        { title: "E-commerce Platforms", link: "/documentation/ecommerce-integrations" },
        { title: "Accounting Software", link: "/documentation/accounting-integrations" },
        { title: "API Documentation", link: "/documentation/api" },
        { title: "Webhooks", link: "/documentation/webhooks" },
      ],
    },
    {
      title: "Supply Chain",
      description: "Manage suppliers, purchases, and orders",
      icon: <Truck className="h-6 w-6" />,
      articles: [
        { title: "Supplier Management", link: "/documentation/supplier-management" },
        { title: "Purchase Orders", link: "/documentation/purchase-orders" },
        { title: "Receiving Inventory", link: "/documentation/receiving" },
        { title: "Order Fulfillment", link: "/documentation/order-fulfillment" },
      ],
    },
    {
      title: "System Settings",
      description: "Configure your system preferences",
      icon: <Settings className="h-6 w-6" />,
      articles: [
        { title: "General Settings", link: "/documentation/general-settings" },
        { title: "Warehouse Setup", link: "/documentation/warehouse-setup" },
        { title: "Notification Settings", link: "/documentation/notifications" },
        { title: "Data Backup", link: "/documentation/data-backup" },
      ],
    },
  ]

  const popularArticles = [
    {
      title: "Getting Started with Inventory Management",
      description: "A comprehensive guide to setting up your inventory system",
      category: "Getting Started",
      link: "/documentation/getting-started",
    },
    {
      title: "Setting Up Multi-location Inventory",
      description: "Learn how to manage inventory across multiple warehouses",
      category: "Inventory Control",
      link: "/documentation/multi-location",
    },
    {
      title: "Integrating with Shopify",
      description: "Step-by-step guide to connecting your Shopify store",
      category: "Integrations",
      link: "/documentation/shopify-integration",
    },
    {
      title: "Creating Custom Reports",
      description: "Build custom reports to analyze your inventory data",
      category: "Reporting & Analytics",
      link: "/documentation/custom-reports",
    },
  ]

  const apiEndpoints = [
    {
      name: "GET /api/products",
      description: "Retrieve a list of products",
      example: `curl -X GET "https://api.example.com/api/products" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    },
    {
      name: "POST /api/products",
      description: "Create a new product",
      example: `curl -X POST "https://api.example.com/api/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Product Name",
    "sku": "SKU123",
    "price": 19.99,
    "quantity": 100
  }'`,
    },
    {
      name: "GET /api/inventory",
      description: "Get current inventory levels",
      example: `curl -X GET "https://api.example.com/api/inventory" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[60%] -left-[5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                <FileText className="h-4 w-4" />
                <span>Documentation</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Inventory Management Documentation</h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                Comprehensive guides, tutorials, and API references to help you get the most out of our inventory
                management system.
              </p>
            </div>
            <div className="relative h-[300px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-primary/10"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-primary/20"></div>
                <div className="absolute top-1/2 right-6 w-12 h-12 rounded-full bg-primary/15"></div>
                <div className="absolute bottom-6 left-20 w-10 h-10 rounded-full bg-primary/10"></div>
              </div>
              <div className="relative z-10 space-y-4 text-center w-full">
                <h3 className="text-xl font-bold">Search Documentation</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search for guides, tutorials, API docs..." className="pl-9" />
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <span className="text-muted-foreground">Popular:</span>
                  <Link href="/documentation/getting-started" className="text-primary hover:underline">
                    Getting Started
                  </Link>
                  <Link href="/documentation/api" className="text-primary hover:underline">
                    API Reference
                  </Link>
                  <Link href="/documentation/integrations" className="text-primary hover:underline">
                    Integrations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Documentation Categories</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Browse our documentation by category to find the information you need.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {docCategories.map((category, index) => (
              <Card key={index} className="overflow-hidden h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, i) => (
                      <li key={i}>
                        <Link
                          href={article.link}
                          className="flex items-center text-sm hover:text-primary transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="ghost" size="sm" className="gap-1 group w-full" asChild>
                    <Link href={`/documentation/${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      View All
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Popular Articles</h2>
              <p className="text-muted-foreground">
                Our most frequently accessed documentation to help you get started quickly.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="overflow-hidden group h-full flex flex-col">
                <CardContent className="p-6 flex-grow">
                  <Badge className="mb-3">{article.category}</Badge>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-muted-foreground text-sm">{article.description}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="ghost" size="sm" className="gap-1 group w-full" asChild>
                    <Link href={article.link}>
                      Read Article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">API Reference</h2>
              <p className="text-muted-foreground">
                Integrate our inventory management system with your existing tools and workflows.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-3">API Sections</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/documentation/api/authentication"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Authentication
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/products"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/inventory"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Inventory
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/orders"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/suppliers"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Suppliers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/webhooks"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Webhooks
                    </Link>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/documentation/api">Full API Reference</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-3">API Tools</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/documentation/api/playground"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      API Playground
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/status"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      API Status
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/documentation/api/changelog"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      API Changelog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-lg border bg-card">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Example API Endpoints</h3>
                </div>
                <div className="p-0">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className={`p-4 ${index !== apiEndpoints.length - 1 ? "border-b" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-mono text-sm font-semibold">{endpoint.name}</h4>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                      <div className="bg-muted rounded-md p-3 relative">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{endpoint.example}</pre>
                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0">
                          <Copy className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy code</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">API Documentation</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      View our complete API documentation with detailed examples and guides.
                    </p>
                    <Button asChild>
                      <Link href="/documentation/api">View Full API Docs</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Versions */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Documentation Versions</h2>
              <p className="text-muted-foreground">Access documentation for different versions of our platform.</p>
            </div>
            <div>
              <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="v3.0">Version 3.0 (Current)</option>
                <option value="v2.5">Version 2.5</option>
                <option value="v2.0">Version 2.0</option>
                <option value="v1.5">Version 1.5</option>
                <option value="v1.0">Version 1.0</option>
              </select>
            </div>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current (v3.0)</TabsTrigger>
              <TabsTrigger value="previous">Previous (v2.x)</TabsTrigger>
              <TabsTrigger value="legacy">Legacy (v1.x)</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Current
                    </Badge>
                    <Badge variant="outline">Released: April 2025</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Version 3.0 Documentation</h3>
                  <p className="text-muted-foreground mb-4">
                    The latest version of our inventory management platform with enhanced features and improved
                    performance.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">New Features</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Advanced forecasting algorithms
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Multi-location inventory management
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Enhanced API capabilities
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Improved reporting dashboard
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Documentation Sections</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <Link href="/documentation/v3/getting-started" className="text-primary hover:underline">
                            Getting Started Guide
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v3/migration" className="text-primary hover:underline">
                            Migration from v2.x
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v3/api" className="text-primary hover:underline">
                            API Reference
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v3/changelog" className="text-primary hover:underline">
                            Full Changelog
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-end">
                  <Button asChild>
                    <Link href="/documentation/v3">Browse v3.0 Documentation</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="previous" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Previous
                    </Badge>
                    <Badge variant="outline">Released: 2023-2024</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Version 2.x Documentation</h3>
                  <p className="text-muted-foreground mb-4">
                    Documentation for the 2.x series of our inventory management platform.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Available Versions</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <Link href="/documentation/v2.5" className="text-primary hover:underline">
                            Version 2.5 (Dec 2024)
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v2.4" className="text-primary hover:underline">
                            Version 2.4 (Sep 2024)
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v2.3" className="text-primary hover:underline">
                            Version 2.3 (Jun 2024)
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v2.0" className="text-primary hover:underline">
                            Version 2.0 (Jan 2023)
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Support Status</h4>
                      <p className="text-sm text-muted-foreground">
                        Version 2.x will continue to receive security updates until December 2025. Feature development
                        has moved to version 3.0.
                      </p>
                      <div className="mt-3">
                        <Link href="/documentation/v2/migration" className="text-primary text-sm hover:underline">
                          Migration Guide to v3.0
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/documentation/v2">Browse v2.x Documentation</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="legacy" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Legacy
                    </Badge>
                    <Badge variant="outline">Released: 2020-2022</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Version 1.x Documentation</h3>
                  <p className="text-muted-foreground mb-4">
                    Legacy documentation for version 1.x of our inventory management platform.
                  </p>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                    <p className="text-sm text-amber-800">
                      <strong>End of Support Notice:</strong> Version 1.x reached end of support on December 31, 2023.
                      We strongly recommend upgrading to version 3.0 for the latest features and security updates.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Available Versions</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <Link href="/documentation/v1.5" className="text-primary hover:underline">
                            Version 1.5 (Jun 2022)
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/v1.0" className="text-primary hover:underline">
                            Version 1.0 (Jan 2020)
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Migration Resources</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <Link href="/documentation/migration/v1-to-v3" className="text-primary hover:underline">
                            Migrating from v1.x to v3.0
                          </Link>
                        </li>
                        <li>
                          <Link href="/documentation/migration/data-export" className="text-primary hover:underline">
                            Exporting Data from v1.x
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/documentation/v1">Browse Legacy Documentation</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Need More Help?</h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Our support team is ready to assist you with any questions or issues you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  size="lg"
                  asChild
                >
                  <Link href="/request-demo">Request a Demo</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] overflow-hidden rounded-xl bg-primary-foreground/10 p-6">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-primary-foreground/10"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-primary-foreground/20"></div>
                <div className="absolute top-1/2 right-6 w-12 h-12 rounded-full bg-primary-foreground/15"></div>
                <div className="absolute bottom-6 left-20 w-10 h-10 rounded-full bg-primary-foreground/10"></div>
              </div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="Support Team"
                  width={400}
                  height={200}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
