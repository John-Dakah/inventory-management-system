import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  BookOpen,
  Play,
  Database,
  Settings,
  ShoppingCart,
  BarChart,
  Users,
  Truck,
  ArrowUp,
  Calendar,
  CheckCircle,
  Building,
  Bell,
  AlertTriangle,
  AlertCircle,
  Package,
  MoreHorizontal,
  Smartphone,
  Shirt,
  Utensils,
  Eye,
  Workflow,
} from "lucide-react"

export default function RequestDemoPage() {
  const features = [
    {
      title: "Product Management",
      description: "Organize and track your products with ease",
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
    },
    {
      title: "Inventory Control",
      description: "Real-time tracking of stock levels across locations",
      icon: <Database className="h-6 w-6 text-primary" />,
    },
    {
      title: "Order Management",
      description: "Streamline your order fulfillment process",
      icon: <Truck className="h-6 w-6 text-primary" />,
    },
    {
      title: "Reporting & Analytics",
      description: "Gain insights with powerful reporting tools",
      icon: <BarChart className="h-6 w-6 text-primary" />,
    },
    {
      title: "Multi-location Support",
      description: "Manage inventory across multiple warehouses",
      icon: <Building className="h-6 w-6 text-primary" />,
    },
    {
      title: "User Management",
      description: "Control access with role-based permissions",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
  ]

  const testimonials = [
    {
      quote:
        "The demo was incredibly helpful in showing us how the system could adapt to our specific needs. We were able to implement it across our 5 warehouse locations within weeks.",
      author: "Sarah Johnson",
      role: "Operations Director",
      company: "Global Retail Solutions",
    },
    {
      quote:
        "After seeing the demo, we knew this was the inventory solution we needed. The implementation was smooth, and the support team was there every step of the way.",
      author: "Michael Chen",
      role: "Supply Chain Manager",
      company: "Innovative Manufacturing Co.",
    },
    {
      quote:
        "The personalized demo addressed all our concerns about migrating from our legacy system. The transition was seamless, and we've seen a 30% improvement in efficiency.",
      author: "Priya Patel",
      role: "IT Director",
      company: "Sunrise Distributors",
    },
  ]

  const demoSteps = [
    {
      number: "01",
      title: "Schedule Your Demo",
      description: "Select a convenient time for a personalized demonstration.",
    },
    {
      number: "02",
      title: "Needs Assessment",
      description: "We'll discuss your specific inventory management challenges.",
    },
    {
      number: "03",
      title: "Customized Demo",
      description: "See how our platform addresses your unique requirements.",
    },
    {
      number: "04",
      title: "Q&A Session",
      description: "Get answers to all your questions from our product experts.",
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
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span>Schedule a Demo</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                See Our Inventory Management System in Action
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                Experience how our platform can streamline your inventory processes, reduce costs, and help your
                business grow with a personalized demonstration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <a href="#demo-form">Schedule Your Demo</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/documentation">Explore Documentation</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-primary/10"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-primary/20"></div>
                <div className="absolute top-1/2 right-6 w-12 h-12 rounded-full bg-primary/15"></div>
                <div className="absolute bottom-6 left-20 w-10 h-10 rounded-full bg-primary/10"></div>
              </div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="w-full h-full max-w-[500px] mx-auto relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
                      <Play className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="w-full h-full rounded-lg overflow-hidden shadow-xl border border-border">
                    <div className="bg-card p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs font-medium">Inventory Management Dashboard</div>
                      <div className="w-4"></div>
                    </div>
                    <div className="relative w-full" style={{ height: "calc(100% - 40px)" }}>
                      <div className="absolute inset-0 transition-opacity duration-1000 opacity-100 animate-fade-in-out">
                        <Image
                          src="/placeholder.svg?height=300&width=500&text=Dashboard+View"
                          alt="Dashboard Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 transition-opacity duration-1000 opacity-0 animate-fade-in-out-delay-1">
                        <Image
                          src="/placeholder.svg?height=300&width=500&text=Inventory+Analytics"
                          alt="Analytics Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 transition-opacity duration-1000 opacity-0 animate-fade-in-out-delay-2">
                        <Image
                          src="/placeholder.svg?height=300&width=500&text=Product+Management"
                          alt="Product Management Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 transition-opacity duration-1000 opacity-0 animate-fade-in-out-delay-3">
                        <Image
                          src="/placeholder.svg?height=300&width=500&text=Order+Processing"
                          alt="Order Processing Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Preview */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Interactive Demo Preview</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Get a glimpse of what you'll see during your personalized demo. Explore our intuitive interface and
                powerful features.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-center">
            <div className="relative h-[500px] rounded-xl overflow-hidden border border-border shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-transparent z-10"></div>

              {/* Dashboard Preview */}
              <div className="absolute inset-0 p-6">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold">Inventory Dashboard</h3>
                        <p className="text-xs text-muted-foreground">Real-time overview of your inventory</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Settings className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-card p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium">Total Products</div>
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1 animate-count-up">1,248</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" /> 12% from last month
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium">Low Stock Items</div>
                        <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1 animate-count-up-delay-1">42</div>
                      <div className="text-xs text-amber-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" /> Requires attention
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium">Pending Orders</div>
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <ShoppingCart className="h-3 w-3 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1 animate-count-up-delay-2">86</div>
                      <div className="text-xs text-blue-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 23 due today
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow grid grid-cols-2 gap-6">
                    <div className="bg-card p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Inventory Value</h4>
                        <select className="text-xs bg-transparent border-none">
                          <option>Last 30 days</option>
                        </select>
                      </div>
                      <div className="h-[180px] relative">
                        <div className="absolute bottom-0 left-0 w-full h-[120px] flex items-end">
                          <div className="w-[8.3%] h-[40%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar"></div>
                          <div className="w-[8.3%] h-[60%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-1"></div>
                          <div className="w-[8.3%] h-[50%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-2"></div>
                          <div className="w-[8.3%] h-[70%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-3"></div>
                          <div className="w-[8.3%] h-[65%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-4"></div>
                          <div className="w-[8.3%] h-[80%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-5"></div>
                          <div className="w-[8.3%] h-[90%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-6"></div>
                          <div className="w-[8.3%] h-[85%] bg-primary/20 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-7"></div>
                          <div className="w-[8.3%] h-[100%] bg-primary rounded-t-sm mx-[0.4%] animate-grow-bar-delay-8"></div>
                          <div className="w-[8.3%] h-[95%] bg-primary/80 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-9"></div>
                          <div className="w-[8.3%] h-[90%] bg-primary/60 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-10"></div>
                          <div className="w-[8.3%] h-[95%] bg-primary/40 rounded-t-sm mx-[0.4%] animate-grow-bar-delay-11"></div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Apr 1</span>
                        <span>Apr 30</span>
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Top Categories</h4>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Electronics</span>
                              <span className="font-medium">32%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full animate-grow-width"
                                style={{ width: "32%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                            <Shirt className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Apparel</span>
                              <span className="font-medium">28%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full animate-grow-width-delay-1"
                                style={{ width: "28%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                            <Utensils className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Home & Kitchen</span>
                              <span className="font-medium">24%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600 rounded-full animate-grow-width-delay-2"
                                style={{ width: "24%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Books & Media</span>
                              <span className="font-medium">16%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full animate-grow-width-delay-3"
                                style={{ width: "16%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Experience the Full System</h3>
                <p className="text-muted-foreground">
                  During your personalized demo, you'll get to explore all aspects of our inventory management system
                  with a product specialist guiding you through features relevant to your business.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Interactive Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      See real-time inventory data and actionable insights at a glance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Explore powerful reporting tools that help you make data-driven decisions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Workflow className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Streamlined Workflows</h4>
                    <p className="text-sm text-muted-foreground">
                      See how our system automates routine tasks and improves efficiency.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Mobile Capabilities</h4>
                    <p className="text-sm text-muted-foreground">
                      Access your inventory system from anywhere, on any device.
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <a href="#demo-form">Schedule Your Interactive Demo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Discover What Our System Can Do</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                During your personalized demo, you'll see how our inventory management system can transform your
                operations.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Process */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">What to Expect</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Our demo process is designed to give you a comprehensive understanding of how our system can address
                your specific inventory challenges.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {demoSteps.map((step, index) => (
              <Card
                key={index}
                className="overflow-hidden h-full relative bg-gradient-to-br from-primary/5 to-transparent"
              >
                <div className="absolute top-4 left-4 text-3xl font-bold text-primary/20">{step.number}</div>
                <CardContent className="p-6 pt-12">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">What Our Customers Say</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Hear from businesses that have transformed their inventory management after seeing our demo.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4 text-4xl text-primary">"</div>
                  <p className="text-muted-foreground flex-grow mb-4 italic">{testimonial.quote}</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section id="demo-form" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span>30-Minute Demo</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">Schedule Your Personalized Demo</h2>
              <p className="text-muted-foreground">
                Fill out the form to schedule a personalized demonstration of our inventory management system. Our
                product specialists will tailor the demo to your specific business needs.
              </p>

              <div className="grid gap-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized to Your Business</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll customize the demo to address your specific inventory challenges.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">No Pressure Environment</h3>
                    <p className="text-sm text-muted-foreground">
                      Our demos are educational, not high-pressure sales presentations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Expert Product Specialists</h3>
                    <p className="text-sm text-muted-foreground">
                      Our demo team has deep knowledge of inventory management best practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Request a Demo</h3>
                <Tabs defaultValue="business" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                  </TabsList>
                  <TabsContent value="business" className="space-y-4 pt-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="first-name" className="text-sm font-medium">
                            First Name
                          </label>
                          <Input id="first-name" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="last-name" className="text-sm font-medium">
                            Last Name
                          </label>
                          <Input id="last-name" placeholder="Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Work Email
                        </label>
                        <Input id="email" type="email" placeholder="john.doe@company.com" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium">
                          Company Name
                        </label>
                        <Input id="company" placeholder="Acme Inc." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="job-title" className="text-sm font-medium">
                            Job Title
                          </label>
                          <Input id="job-title" placeholder="Inventory Manager" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="company-size" className="text-sm font-medium">
                            Company Size
                          </label>
                          <select
                            id="company-size"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select size</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="501+">501+ employees</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="industry" className="text-sm font-medium">
                          Industry
                        </label>
                        <select
                          id="industry"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select industry</option>
                          <option value="retail">Retail</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="wholesale">Wholesale</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          What are your main inventory challenges?
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Please share your specific inventory management needs and challenges"
                          rows={3}
                        />
                      </div>
                      <Button className="w-full">Schedule Demo</Button>
                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our{" "}
                        <Link href="/privacy-policy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="personal" className="space-y-4 pt-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="first-name-personal" className="text-sm font-medium">
                            First Name
                          </label>
                          <Input id="first-name-personal" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="last-name-personal" className="text-sm font-medium">
                            Last Name
                          </label>
                          <Input id="last-name-personal" placeholder="Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email-personal" className="text-sm font-medium">
                          Email
                        </label>
                        <Input id="email-personal" type="email" placeholder="john.doe@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone-personal" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input id="phone-personal" type="tel" placeholder="+1 (555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="interest" className="text-sm font-medium">
                          Primary Interest
                        </label>
                        <select
                          id="interest"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select interest</option>
                          <option value="small-business">Small Business Solution</option>
                          <option value="personal-use">Personal Use</option>
                          <option value="learning">Learning About Inventory Management</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message-personal" className="text-sm font-medium">
                          What would you like to see in the demo?
                        </label>
                        <Textarea
                          id="message-personal"
                          placeholder="Please share what aspects of inventory management you're most interested in"
                          rows={3}
                        />
                      </div>
                      <Button className="w-full">Schedule Demo</Button>
                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our{" "}
                        <Link href="/privacy-policy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Common questions about our demo process and inventory management system.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How long is the demo?</h3>
                <p className="text-muted-foreground">
                  Our standard demo is 30 minutes, but we can adjust based on your needs and questions. We recommend
                  setting aside 45 minutes to allow for Q&A.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Is the demo personalized?</h3>
                <p className="text-muted-foreground">
                  Yes, we tailor each demo to your specific industry, business size, and inventory challenges. We'll
                  focus on the features most relevant to your needs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Who should attend the demo?</h3>
                <p className="text-muted-foreground">
                  We recommend including decision-makers and team members who will be using the system, such as
                  inventory managers, operations staff, and IT personnel.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What happens after the demo?</h3>
                <p className="text-muted-foreground">
                  After the demo, we'll provide a recording and additional resources. If you're interested in moving
                  forward, we'll discuss next steps including pricing, implementation, and training.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Can I get a trial after the demo?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 14-day free trial after the demo so you can explore the system with your team and test
                  it with your own data.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How much does the system cost?</h3>
                <p className="text-muted-foreground">
                  Pricing depends on your business size, feature requirements, and number of users. During the demo,
                  we'll discuss your needs and provide transparent pricing information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Ready to Transform Your Inventory Management?</h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Schedule your personalized demo today and see how our system can streamline your operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" asChild>
                  <a href="#demo-form">Schedule Your Demo</a>
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  size="lg"
                  asChild
                >
                  <Link href="/documentation">Explore Documentation</Link>
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
                  src="/dash.png ?height=200&width=400"
                  alt="Inventory Dashboard"
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
