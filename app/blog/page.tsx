import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock, ArrowRight, BookOpen } from "lucide-react"

export default function BlogPage() {
  const featuredPosts = [
    {
      id: 1,
      title: "5 Inventory Management Strategies to Reduce Costs",
      excerpt: "Learn how to optimize your inventory management process to reduce costs and improve efficiency.",
      category: "Strategies",
      author: "John Daka",
      date: "April 10, 2025",
      readTime: "5 min read",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      id: 2,
      title: "How to Implement Just-in-Time Inventory for Small Businesses",
      excerpt: "A step-by-step guide to implementing JIT inventory management in your small business.",
      category: "Guides",
      author: "Mitchell Pariva",
      date: "April 5, 2025",
      readTime: "8 min read",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      id: 3,
      title: "The Future of Inventory Management: AI and Automation",
      excerpt: "Discover how artificial intelligence and automation are transforming inventory management.",
      category: "Technology",
      author: "Agrippa Karuru",
      date: "March 28, 2025",
      readTime: "6 min read",
      image: "/placeholder.svg?height=600&width=800",
    },
  ]

  const recentPosts = [
    {
      id: 4,
      title: "Inventory Forecasting: Techniques for Accurate Predictions",
      excerpt: "Master the art of inventory forecasting with these proven techniques and tools.",
      category: "Forecasting",
      author: "Ngonidzashe Gambakwe",
      date: "April 8, 2025",
      readTime: "7 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 5,
      title: "How to Conduct an Effective Inventory Audit",
      excerpt: "A comprehensive guide to conducting inventory audits that improve accuracy and compliance.",
      category: "Guides",
      author: "Tinotenda Maunganidze",
      date: "April 3, 2025",
      readTime: "10 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 6,
      title: "Inventory KPIs Every Business Should Track",
      excerpt: "Learn which key performance indicators are essential for monitoring inventory health.",
      category: "Metrics",
      author: "John Daka",
      date: "March 30, 2025",
      readTime: "6 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 7,
      title: "Sustainable Inventory Practices for Eco-Conscious Businesses",
      excerpt: "Implement environmentally friendly inventory management practices without sacrificing efficiency.",
      category: "Sustainability",
      author: "Mitchell Pariva",
      date: "March 25, 2025",
      readTime: "8 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 8,
      title: "Inventory Management for Seasonal Businesses",
      excerpt: "Strategies for managing inventory fluctuations in businesses with seasonal demand.",
      category: "Strategies",
      author: "Agrippa Karuru",
      date: "March 20, 2025",
      readTime: "7 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 9,
      title: "How to Choose the Right Inventory Management Software",
      excerpt: "A buyer's guide to selecting the inventory management solution that fits your business needs.",
      category: "Technology",
      author: "Ngonidzashe Gambakwe",
      date: "March 15, 2025",
      readTime: "9 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  const categories = ["All", "Strategies", "Guides", "Technology", "Forecasting", "Metrics", "Sustainability"]

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                <span>Blog & Insights</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Inventory Management Insights & Best Practices
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                Discover the latest trends, strategies, and tips to optimize your inventory management and grow your
                business.
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
                <h3 className="text-xl font-bold">Subscribe to Our Newsletter</h3>
                <p className="text-sm text-muted-foreground">
                  Get the latest inventory management insights delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="Enter your email" type="email" className="max-w-lg flex-1" />
                  <Button>Subscribe</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Featured Articles</h2>
              <p className="text-muted-foreground">Our most popular and informative content on inventory management.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 lg:gap-8 w-full">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden group">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Badge className="absolute top-4 left-4 z-10">{post.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center">
                    <div className="text-sm">By {post.author}</div>
                    <Button variant="ghost" size="sm" className="gap-1 group" asChild>
                      <Link href={`/blog/${post.id}`}>
                        Read More
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

      {/* Blog Posts */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">Latest Articles</h2>
                <p className="text-muted-foreground">Browse our latest content on inventory management.</p>
              </div>
              <div className="w-full md:w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search articles..." className="pl-9 w-full" />
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
                  {recentPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden group">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge className="absolute top-4 left-4 z-10">{post.category}</Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex justify-between items-center">
                        <div className="text-sm">By {post.author}</div>
                        <Button variant="ghost" size="sm" className="gap-1 group" asChild>
                          <Link href={`/blog/${post.id}`}>
                            Read More
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
                    {recentPosts
                      .filter((post) => post.category === category)
                      .map((post) => (
                        <Card key={post.id} className="overflow-hidden group">
                          <div className="relative aspect-video overflow-hidden">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <Badge className="absolute top-4 left-4 z-10">{post.category}</Badge>
                          </div>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <span>{post.date}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readTime}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                          </CardContent>
                          <CardFooter className="p-6 pt-0 flex justify-between items-center">
                            <div className="text-sm">By {post.author}</div>
                            <Button variant="ghost" size="sm" className="gap-1 group" asChild>
                              <Link href={`/blog/${post.id}`}>
                                Read More
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
                Load More Articles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Ready to Optimize Your Inventory?</h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Join thousands of businesses that have transformed their inventory management with our platform.
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
                  src="/placeholder.svg?height=200&width=400"
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
