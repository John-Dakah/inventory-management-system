
"use client"
import React from "react";

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger,DialogTitle } from "@/components/ui/dialog"
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Package2Icon,
  FileTextIcon,
  PuzzleIcon,
  HeadphonesIcon,
  Mail,
  Phone,
  MapPin,
  TwitterIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  SmartphoneIcon,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  Search,
  ShoppingCart,
  Truck,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Star,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { WavyBackground } from "@/components/ui/wavy-background"
import { SparklesCore } from "@/components/ui/sparkles"
import { FloatingNavbar } from "@/components/ui/floating-navbar"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { TracingBeam } from "@/components/ui/tracing-beam"

import { Progress } from "@/components/ui/progress"



export default function LandingPage() {
  const router = useRouter()
  const [demoOpen, setDemoOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const autoplayRef = useRef(null)

  const handleGetStarted = () => {
    router.push("/login")
  }

  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Testimonials",
      link: "#testimonials",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ]

  const features = [
    {
      title: "Real-time Tracking",
      description: "Monitor your inventory levels across multiple locations in real-time.",
      icon: <EyeIcon className="h-10 w-10" />,
    },
    {
      title: "Low Stock Alerts",
      description: "Receive notifications when inventory items are running low.",
      icon: <BellIcon className="h-10 w-10" />,
    },
    {
      title: "Comprehensive Reporting",
      description: "Generate detailed reports on stock, sales, and profitability.",
      icon: <BarChartIcon className="h-10 w-10" />,
    },
    {
      title: "Multi-location Support",
      description: "Manage inventory across multiple warehouses or stores.",
      icon: <MapPinIcon className="h-10 w-10" />,
    },
    {
      title: "Supplier Management",
      description: "Track supplier information, orders, and performance.",
      icon: <TruckIcon className="h-10 w-10" />,
    },
    {
      title: "Barcode Scanning",
      description: "Quickly scan items for efficient inventory management.",
      icon: <ScanIcon className="h-10 w-10" />,
    },
  ]

  const testimonials = [
    {
      quote:
        "This inventory system has transformed how we manage our stock. We've reduced errors by 75% and saved countless hours.",
      name: "John Ariphios Daka",
      title: "CEO, Zimspark Tech Solution.",
    },
    {
      quote:
        "The real-time tracking feature has been a game-changer for our multi-location business. I can't imagine going back to our old system.",
      name: "Agripa Karuru",
      title: "Retail Director,AgriHub.",
    },
    {
      quote:
        "The intuitive interface made training our staff incredibly easy. Even our non-technical employees picked it up quickly.",
      name: "Gambakwe Ngonidzashe",
      title: "HR Manager, ZFC  Ltd.",
    },
    {
      quote:
        "We've cut our stockouts by 90% since implementing this system. The low stock alerts are incredibly reliable.",
      name: "Tinotenda Maunganidze",
      title: "Inventory Specialist, Tafara Comp.",
    },
  ]

  const cardHoverItems = [
    {
      title: "Intuitive Dashboard",
      description: "Get a complete overview of your inventory with our easy-to-use dashboard.",
      icon: <LayoutDashboardIcon className="h-10 w-10 text-primary" />,
    },
    {
      title: "Mobile Access",
      description: "Manage your inventory on the go with our responsive mobile interface.",
      icon: <SmartphoneIcon className="h-10 w-10 text-primary" />,
    },
    {
      title: "Data Security",
      description: "Your inventory data is protected with enterprise-grade security measures.",
      icon: <ShieldCheckIcon className="h-10 w-10 text-primary" />,
    },
    {
      title: "Custom Reports",
      description: "Create tailored reports to meet your specific business needs.",
      icon: <FileTextIcon className="h-10 w-10 text-primary" />,
    },
    {
      title: "Integration Ready",
      description: "Seamlessly connect with your existing business tools and software.",
      icon: <PuzzleIcon className="h-10 w-10 text-primary" />,
    },
    {
      title: "24/7 Support",
      description: "Our dedicated support team is always available to help you.",
      icon: <HeadphonesIcon className="h-10 w-10 text-primary" />,
    },
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small businesses just getting started",
      features: ["Up to 1,000 inventory items", "2 user accounts", "Basic reporting", "Email support", "Mobile access"],
    },
    {
      name: "Professional",
      price: "$79",
      description: "Ideal for growing businesses with multiple products",
      features: [
        "Up to 10,000 inventory items",
        "10 user accounts",
        "Advanced reporting",
        "Priority email support",
        "API access",
        "Barcode scanning",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "For large businesses with complex inventory needs",
      features: [
        "Unlimited inventory items",
        "Unlimited user accounts",
        "Custom reporting",
        "24/7 phone support",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced analytics",
      ],
    },
  ]

  // Demo slideshow content
  const demoSlides = [
    {
      title: "Dashboard Overview",
      description: "Get a complete view of your inventory at a glance with our intuitive dashboard.",
      image: "/dashboard-demo.png",
      color: "from-blue-500 to-purple-500",
      icon: <LayoutDashboardIcon className="h-8 w-8" />,
      features: [
        { icon: <TrendingUp />, text: "Real-time metrics and KPIs" },
        { icon: <AlertCircle />, text: "Low stock alerts and notifications" },
        { icon: <BarChart3 />, text: "Visual data representation" },
      ],
      animation: "fade-right",
    },
    {
      title: "Inventory Management",
      description: "Easily add, edit, and track all your products across multiple locations.",
      image: "/inventory-demo.png",
      color: "from-green-500 to-emerald-500",
      icon: <Package2Icon className="h-8 w-8" />,
      features: [
        { icon: <Layers />, text: "Categorize and organize products" },
        { icon: <Search />, text: "Powerful search and filtering" },
        { icon: <Plus />, text: "Bulk import and export capabilities" },
      ],
      animation: "fade-up",
    },
    {
      title: "Order Processing",
      description: "Streamline your order fulfillment process from start to finish.",
      image: "/orders-demo.png",
      color: "from-orange-500 to-red-500",
      icon: <ShoppingCart className="h-8 w-8" />,
      features: [
        { icon: <CheckCircle2 />, text: "Automated order workflows" },
        { icon: <ArrowUpRight />, text: "Track order status in real-time" },
        { icon: <ArrowDownRight />, text: "Manage returns and exchanges" },
      ],
      animation: "fade-left",
    },
    {
      title: "Supplier Management",
      description: "Maintain relationships with suppliers and track purchase orders.",
      image: "/suppliers-demo.png",
      color: "from-purple-500 to-indigo-500",
      icon: <Truck className="h-8 w-8" />,
      features: [
        { icon: <Users />, text: "Supplier contact information" },
        { icon: <FileTextIcon />, text: "Purchase order tracking" },
        { icon: <TrendingUp />, text: "Supplier performance metrics" },
      ],
      animation: "fade-down",
    },
    {
      title: "Advanced Reporting",
      description: "Generate detailed reports to make data-driven decisions.",
      image: "/reports-demo.png",
      color: "from-cyan-500 to-blue-500",
      icon: <BarChart3 className="h-8 w-8" />,
      features: [
        { icon: <FileTextIcon />, text: "Customizable report templates" },
        { icon: <DownloadIcon />, text: "Export in multiple formats" },
        { icon: <CalendarIcon />, text: "Scheduled automated reports" },
      ],
      animation: "fade-right",
    },
  ]

  // Handle slideshow navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === demoSlides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? demoSlides.length - 1 : prev - 1))
  }

  // Autoplay functionality
  useEffect(() => {
    if (demoOpen && autoplay) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === demoSlides.length - 1 ? 0 : prev + 1))
      }, 5000)

      autoplayRef.current = interval
      return () => clearInterval(interval)
    } else if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }
  }, [demoOpen, autoplay])

  // Progress bar animation
  useEffect(() => {
    if (demoOpen && autoplay) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0
          }
          return prev + 1
        })
      }, 50)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [demoOpen, autoplay])

  // Progress bar reset on slide change
  useEffect(() => {
    setProgress(0)
  }, [demoOpen, autoplay]);

  return (
  <div className="flex flex-col min-h-screen">
  <FloatingNavbar navItems={navItems} />

  {/* Hero Section */}
  <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
    <WavyBackground className="w-full h-full absolute inset-0">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-50/80 to-blue-100/30 dark:from-blue-950/80 dark:to-blue-900/30" />
    </WavyBackground>

    <div className="container relative z-10 px-4 md:px-6 py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="flex flex-col items-center space-y-8 text-center">
        <div className="relative">
          <SparklesCore
            id="tsparticlesheading"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={30}
            className="w-full h-full absolute"
            particleColor="#2563eb"
          />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-300">
            Inventory Management System for SMEs
          </h1>
        </div>
        <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
          Streamline your inventory processes, reduce errors, and make data-driven decisions with our powerful yet
          simple inventory management solution.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
  <DialogTrigger asChild>
    <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full">
      Watch Demo
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden bg-transparent border-none">
    <DialogTitle className="sr-only">Inventory Pro Demo</DialogTitle>
    <div className="relative w-full h-full bg-background rounded-lg overflow-hidden shadow-2xl">
      {/* Animated background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0" />
        <div className="absolute top-0 left-0 w-full h-full">
          <SparklesCore
            id="tsparticlesdemo"
            background="transparent"
            minSize={0.4}
            maxSize={1.0}
            particleDensity={50}
            className="w-full h-full"
            particleColor="#2563eb"
          />
        </div>
      </div>

      {/* Demo content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Package2Icon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Inventory Pro Demo</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoplay"
                checked={autoplay}
                onChange={() => setAutoplay(!autoplay)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoplay" className="text-sm">Autoplay</label>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDemoOpen(false)}>
              Close Demo
            </Button>
          </div>
        </div>

        {/* Slideshow */}
        <div className="flex-1 overflow-hidden">
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full flex flex-col md:flex-row p-6 gap-6"
              >
                {/* Left side - Content */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className={`inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-r ${demoSlides[currentSlide].color} text-white mb-4`}>
                      {demoSlides[currentSlide].icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{demoSlides[currentSlide].title}</h3>
                    <p className="text-muted-foreground">{demoSlides[currentSlide].description}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 mb-8"
                  >
                    {demoSlides[currentSlide].features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {feature.icon}
                        </div>
                        <span>{feature.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="mt-auto">
                    <Button className="w-full" size="lg">
                      Try This Feature
                    </Button>
                  </div>
                </div>

                {/* Right side - Image/Visual */}
                <div className="w-full md:w-1/2 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Animated elements */}
                    <div className="absolute w-64 h-64 rounded-full bg-primary/5 animate-pulse" />
                    <div className="absolute w-48 h-48 rounded-full bg-secondary/5 animate-ping" style={{ animationDuration: '3s' }} />
                    {/* Floating icons */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: Math.random() * 200 - 100,
                          y: Math.random() * 200 - 100,
                          opacity: 0,
                          scale: 0
                        }}
                        animate={{
                          x: Math.random() * 300 - 150,
                          y: Math.random() * 300 - 150,
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 5 + Math.random() * 5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.5
                        }}
                        className="absolute"
                      >
                        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Main image/mockup */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative z-10 w-full max-w-md rounded-lg shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800"
                  >
                    <div className="w-full h-8 bg-gray-200 dark:bg-gray-800 flex items-center px-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 aspect-video relative overflow-hidden">
                      {/* Placeholder for actual screenshot */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <div className="text-center">
                          <Package2Icon className="h-16 w-16 mx-auto mb-4 text-primary" />
                          <h3 className="text-xl font-bold">{demoSlides[currentSlide].title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">Interactive Demo</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="p-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevSlide}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextSlide}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 mx-4">
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-sm text-muted-foreground">
              {currentSlide + 1} / {demoSlides.length}
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {demoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "bg-primary w-8" : "bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

        </div>
      </div>
    </div>

    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
      <ChevronRight className="h-8 w-8 rotate-90 text-gray-500" />
    </div>
  </section>

  {/* Features Section */}
  <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful Features</h2>
        <p className="mt-4 text-gray-500 md:text-xl dark:text-gray-400">
          Everything you need to manage your inventory efficiently
        </p>
      </div>

      <HoverEffect items={cardHoverItems} />

      <div className="mt-24">
        <TracingBeam>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8">How It Works</h3>

            <div className="space-y-12">
              <div className="relative pl-8 border-l-2 border-blue-500">
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  1
                </div>
                <h4 className="text-xl font-semibold mb-2">Set Up Your Inventory</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Import your existing inventory or start from scratch. Categorize your items, set up SKUs, and
                  define stock levels.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-blue-500">
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  2
                </div>
                <h4 className="text-xl font-semibold mb-2">Track Stock Movements</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Record all stock movements including purchases, sales, returns, and transfers between locations.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-blue-500">
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  3
                </div>
                <h4 className="text-xl font-semibold mb-2">Monitor and Analyze</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Get real-time insights into your inventory performance. Identify fast-moving items, dead stock,
                  and reorder points.
                </p>
              </div>

              <div className="relative pl-8">
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  4
                </div>
                <h4 className="text-xl font-semibold mb-2">Optimize and Grow</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Use data-driven insights to optimize your inventory levels, reduce costs, and grow your business.
                </p>
              </div>
            </div>
          </div>
        </TracingBeam>
      </div>
    </div>
  </section>

  {/* Testimonials Section */}
  <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Customers Say</h2>
        <p className="mt-4 text-gray-500 md:text-xl dark:text-gray-400">Trusted by businesses of all sizes</p>
      </div>

      <div className="mt-8">
        <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
      </div>
    </div>
  </section>

  {/* Why Choose Us Section */}
  <section className="w-full py-12 md:py-24 lg:py-32 relative">
    <BackgroundBeams className={undefined} />
    <div className="container px-4 md:px-6 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Our IMS?</h2>
      </div>
      <div className="max-w-3xl mx-auto">
        <TextGenerateEffect
          words="Our Inventory Management System is designed specifically for SMEs, offering a user-friendly interface, powerful features, and affordable pricing. With our system, you can reduce stockouts, minimize overstock situations, and make data-driven decisions to optimize your inventory and boost your bottom line. We understand the unique challenges faced by small and medium businesses, which is why we've created a solution that's both powerful and easy to use."
          className="text-center text-lg md:text-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold">Easy to Use</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Intuitive interface that requires minimal training. Get up and running in minutes, not days.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold">Affordable</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Flexible pricing plans that grow with your business. No hidden fees or long-term contracts.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold">Scalable</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Start small and scale as your business grows. Our system grows with you every step of the way.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* Pricing Section */}
  <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
        <p className="mt-4 text-gray-500 md:text-xl dark:text-gray-400">
          Choose the plan that's right for your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border ${
              plan.highlighted ? "border-blue-500 relative" : "border-gray-200"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                Highlighted
              </div>
            )}
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="ml-1 text-gray-500">/month</span>
            </div>
            <p className="mt-4 text-gray-500">{plan.description}</p>

            <ul className="mt-6 space-y-4">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`mt-8 w-full ${
                plan.highlighted
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              }`}
            >
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </div> {/* Added missing closing tag for container */}
  </section>

  {/* Contact Section */}
  <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
    <div className="container px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Contact us today to learn how our inventory management system can help your business thrive.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-500 mr-2" />
              <span>johnariphiosd@gmail.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-500 mr-2" />
              <span>+263 786 053 315</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-500 mr-2" />
              <span>Chinhoyi ,zw</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Your company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="How can we help you?" className="min-h-[120px]" />
            </div>
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  </section>

  {/* Footer */}
  <footer className="w-full py-6 bg-gray-100 dark:bg-gray-900 border-t">
    <div className="container px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-semibold text-lg mb-4">
            <Package2Icon className="h-6 w-6" />
            <span>Inventory Pro</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Streamlining inventory management for small and medium businesses since 2020.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="#features"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Integrations
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Roadmap
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/documentation" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/tutorials" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Tutorials
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/support" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/careers" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-8 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Inventory Pro. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <TwitterIcon className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <FacebookIcon className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <InstagramIcon className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <LinkedinIcon className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </div>
    </div>
  </footer>
</div>
)
  }

  function MountainIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    )
  }

  function BellIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    )
  }

  function BarChartIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    )
  }

  function EyeIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  function MapPinIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
  }

  function TruckIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 17h4V5H2v12h3" />
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L16 6h-4v11h3" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    )
  }



  function LayoutDashboardIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    )
  }

  function ShieldCheckIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }

  function DownloadIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
    )
  }

  function CalendarIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    )
  }
  function ScanIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
                  return (
                    <svg
                      {...props}
                      xmlns="http://www.w3.org/2000/svg" // Correct xmlns
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                      <line x1="7" x2="17" y1="12" y2="12" />
                    </svg>
                  );
                }

