import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  Play,
  FileText,
  BarChart,
  ShoppingCart,
  Truck,
  Star,
  Filter,
} from "lucide-react"

export default function TutorialsPage() {
  const featuredTutorials = [
    {
      id: 1,
      title: "Getting Started with Our Inventory Management System",
      description: "Learn the basics of setting up and using our inventory management platform.",
      category: "Beginner",
      format: "Video",
      duration: "15 min",
      author: "John Daka",
      image: "/placeholder.svg?height=600&width=800",
      difficulty: "Beginner",
    },
    {
      id: 2,
      title: "Setting Up Product Categories and Attributes",
      description: "Learn how to organize your inventory with categories and custom attributes.",
      category: "Product Management",
      format: "Article",
      duration: "10 min read",
      author: "Mitchell Pariva",
      image: "/placeholder.svg?height=600&width=800",
      difficulty: "Intermediate",
    },
    {
      id: 3,
      title: "Advanced Inventory Forecasting Techniques",
      description: "Master the advanced forecasting tools to predict inventory needs accurately.",
      category: "Forecasting",
      format: "Video",
      duration: "25 min",
      author: "Agrippa Karuru",
      image: "/placeholder.svg?height=600&width=800",
      difficulty: "Advanced",
    },
  ]

  const allTutorials = [
    {
      id: 4,
      title: "Creating and Managing Purchase Orders",
      description: "Learn how to create, edit, and track purchase orders in the system.",
      category: "Purchasing",
      format: "Video",
      duration: "12 min",
      author: "Ngonidzashe Gambakwe",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Beginner",
    },
    {
      id: 5,
      title: "Setting Up Automated Reorder Points",
      description: "Configure automatic reordering based on inventory levels and demand.",
      category: "Automation",
      format: "Article",
      duration: "8 min read",
      author: "Tinotenda Maunganidze",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Intermediate",
    },
    {
      id: 6,
      title: "Inventory Reporting and Analytics Dashboard",
      description: "Master the reporting tools to gain insights into your inventory performance.",
      category: "Reporting",
      format: "Video",
      duration: "20 min",
      author: "John Daka",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Intermediate",
    },
    {
      id: 7,
      title: "Managing Multiple Warehouses",
      description: "Learn how to track inventory across multiple locations and warehouses.",
      category: "Warehouse Management",
      format: "Article",
      duration: "15 min read",
      author: "Mitchell Pariva",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Advanced",
    },
    {
      id: 8,
      title: "Integrating with E-commerce Platforms",
      description: "Connect your inventory system with popular e-commerce platforms.",
      category: "Integrations",
      format: "Video",
      duration: "18 min",
      author: "Agrippa Karuru",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Advanced",
    },
    {
      id: 9,
      title: "Barcode Scanning and Mobile App Usage",
      description: "Streamline inventory management with barcode scanning and the mobile app.",
      category: "Mobile",
      format: "Article",
      duration: "10 min read",
      author: "Ngonidzashe Gambakwe",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Beginner",
    },
    {
      id: 10,
      title: "Setting Up User Roles and Permissions",
      description: "Configure access controls and user permissions for your team.",
      category: "Administration",
      format: "Video",
      duration: "15 min",
      author: "Tinotenda Maunganidze",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Intermediate",
    },
    {
      id: 11,
      title: "Inventory Auditing Best Practices",
      description: "Learn how to conduct effective inventory audits using our platform.",
      category: "Auditing",
      format: "Article",
      duration: "12 min read",
      author: "John Daka",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Intermediate",
    },
    {
      id: 12,
      title: "Advanced Reporting and Custom Reports",
      description: "Create custom reports and dashboards for specific business needs.",
      category: "Reporting",
      format: "Video",
      duration: "22 min",
      author: "Mitchell Pariva",
      image: "/placeholder.svg?height=400&width=600",
      difficulty: "Advanced",
    },
  ]

  const categories = [
    "All",
    "Beginner",
    "Product Management",
    "Purchasing",
    "Reporting",
    "Warehouse Management",
    "Integrations",
  ]

  const difficultyLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"]
  const formats = ["All Formats", "Video", "Article"]

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
                <BookOpen className="h-4 w-4" />
                <span>Tutorials & Guides</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Learn How to Master Inventory Management
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                Step-by-step tutorials, guides, and videos to help you get the most out of our inventory management
                system.
              </p>
            </div>
            <div className="relative h-[300px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-primary/10"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-primary/20"></div>
                <div className="absolute top-1/2 right-6 w-12 h-12 rounded-full bg-primary/15"></div>
                <div className="absolute bottom-6 left-20 w-10 h-10 rounded-full bg-primary/10"></div>
              </div>
              <div className="relative z-10 space-y-4 text-center">
                <h3 className="text-xl font-bold">Can't find what you need?</h3>
                <p className="text-sm text-muted-foreground">
                  Search our tutorials or request a specific guide from our team.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search tutorials..." className="pl-9" />
                  </div>
                  <Button>Search</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Featured Tutorials</h2>
              <p className="text-muted-foreground">Start with these popular tutorials to get up and running quickly.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 lg:gap-8 w-full">
              {featuredTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="overflow-hidden group h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={tutorial.image || "/placeholder.svg"}
                      alt={tutorial.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {tutorial.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-background/80">
                        {tutorial.category}
                      </Badge>
                    </div>
                    {tutorial.format === "Video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-primary/90 p-3 text-primary-foreground shadow-lg transform transition-transform group-hover:scale-110">
                          <Play className="h-6 w-6" />
                        </div>
                      </div>
                    )}
                    {tutorial.format === "Article" && (
                      <div className="absolute top-4 right-4">
                        <div className="rounded-full bg-background/80 backdrop-blur-sm p-2 shadow-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tutorial.duration}
                      </span>
                      <span>•</span>
                      <span>{tutorial.format}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{tutorial.description}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center">
                    <div className="text-sm">By {tutorial.author}</div>
                    <Button variant="ghost" size="sm" className="gap-1 group" asChild>
                      <Link href={`/tutorials/${tutorial.id}`}>
                        Start Learning
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All Tutorials */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">Browse All Tutorials</h2>
                <p className="text-muted-foreground">Find the perfect tutorial for your needs.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <select className="h-10 rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {difficultyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <select className="h-10 rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {formats.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Tabs defaultValue="All" className="w-full">
              <TabsList className="flex flex-wrap h-auto p-0 bg-transparent gap-2">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="All" className="mt-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allTutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="overflow-hidden group h-full flex flex-col">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={tutorial.image || "/placeholder.svg"}
                          alt={tutorial.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 flex gap-2 z-10">
                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            {tutorial.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-background/80">
                            {tutorial.category}
                          </Badge>
                        </div>
                        {tutorial.format === "Video" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-primary/90 p-2 text-primary-foreground shadow-lg transform transition-transform group-hover:scale-110">
                              <Play className="h-5 w-5" />
                            </div>
                          </div>
                        )}
                        {tutorial.format === "Article" && (
                          <div className="absolute top-4 right-4">
                            <div className="rounded-full bg-background/80 backdrop-blur-sm p-2 shadow-lg">
                              <FileText className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </span>
                          <span>•</span>
                          <span>{tutorial.format}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{tutorial.description}</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex justify-between items-center">
                        <div className="text-sm">By {tutorial.author}</div>
                        <Button variant="ghost" size="sm" className="gap-1 group" asChild>
                          <Link href={`/tutorials/${tutorial.id}`}>
                            Start Learning
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {categories.slice(1).map((category) => (
                <TabsContent key={category} value={category} className="mt-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {allTutorials
                      .filter((tutorial) => tutorial.category === category || tutorial.difficulty === category)
                      .map((tutorial) => (
                        <Card key={tutorial.id} className="overflow-hidden group h-full flex flex-col">
                          <div className="relative aspect-video overflow-hidden">
                            <Image
                              src={tutorial.image || "/placeholder.svg"}
                              alt={tutorial.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 flex gap-2 z-10">
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                {tutorial.difficulty}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-background/80 backdrop-blur-sm border-background/80"
                              >
                                {tutorial.category}
                              </Badge>
                            </div>
                            {tutorial.format === "Video" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="rounded-full bg-primary/90 p-2 text-primary-foreground shadow-lg transform transition-transform group-hover:scale-110">
                                  <Play className="h-5 w-5" />
                                </div>
                              </div>
                            )}
                            {tutorial.format === "Article" && (
                              <div className="absolute top-4 right-4">
                                <div className="rounded-full bg-background/80 backdrop-blur-sm p-2 shadow-lg">
                                  <FileText className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-6 flex-grow">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tutorial.duration}
                              </span>
                              <span>•</span>
                              <span>{tutorial.format}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                              {tutorial.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{tutorial.description}</p>
                          </CardContent>
                          <CardFooter className="p-6 pt-0 flex justify-between items-center">
                            <div className="text-sm">By {tutorial.author}</div>
                            <Button variant="ghost" size="sm" className="gap-1 group" asChild>
                              <Link href={`/tutorials/${tutorial.id}`}>
                                Start Learning
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg">
                Load More Tutorials
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Learning Paths</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Follow these curated learning paths to master specific aspects of inventory management.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Product Management Mastery</h3>
                <p className="text-muted-foreground mb-4">
                  Learn how to effectively manage products, categories, and variants in your inventory.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Setting Up Product Categories (15 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Managing Product Variants (20 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Product Bundling Strategies (25 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Advanced Product Attributes (15 min)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>1.5 hours total</span>
                  <span>•</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.8/5</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full" asChild>
                  <Link href="/tutorials/paths/product-management">Start Learning Path</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Inventory Analytics & Reporting</h3>
                <p className="text-muted-foreground mb-4">
                  Master the reporting tools to gain actionable insights from your inventory data.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Dashboard Customization (10 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Creating Custom Reports (25 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Inventory KPI Tracking (20 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Data Export & Integration (15 min)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>1.2 hours total</span>
                  <span>•</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.9/5</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full" asChild>
                  <Link href="/tutorials/paths/analytics">Start Learning Path</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Supply Chain Optimization</h3>
                <p className="text-muted-foreground mb-4">
                  Learn how to streamline your supply chain and optimize order management.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Supplier Management (15 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Purchase Order Automation (20 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Lead Time Optimization (15 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Multi-location Fulfillment (25 min)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>1.3 hours total</span>
                  <span>•</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.7/5</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full" asChild>
                  <Link href="/tutorials/paths/supply-chain">Start Learning Path</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Need Personalized Training?</h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Our team can provide custom training sessions tailored to your specific business needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/request-demo">Request a Demo</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  size="lg"
                  asChild
                >
                  <Link href="/support">Contact Support</Link>
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
                  alt="Training Session"
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
