import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, Target, Award } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "John Ariphios Daka",
      role: "Chief Executive Officer",
      bio: "With over 10 years of experience in inventory management systems, John leads our strategic vision.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Mitchell Pariva",
      role: "Chief Technology Officer",
      bio: "Mitchell oversees all technical aspects of our platform, ensuring scalability and performance.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Agrippa Karuru",
      role: "Head of Product",
      bio: "Agrippa works closely with clients to understand their needs and translate them into product features.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Ngonidzashe Gambakwe",
      role: "Lead Developer",
      bio: "Ngonidzashe leads our development team, implementing innovative solutions for complex inventory challenges.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Tinotenda Maunganidze",
      role: "Customer Success Manager",
      bio: "Tinotenda ensures our clients get the most value from our platform through training and support.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About Our Company</h1>
              <p className="text-muted-foreground md:text-xl">
                We're on a mission to simplify inventory management for small and medium enterprises, providing powerful
                tools that are easy to use and affordable.
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Company office"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                <Target className="h-4 w-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">Empowering SMEs with Smart Inventory Solutions</h2>
              <p className="text-muted-foreground md:text-lg">
                Our mission is to provide small and medium enterprises with powerful, yet easy-to-use inventory
                management tools that help them optimize their operations, reduce costs, and grow their businesses.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                <Award className="h-4 w-4" />
                <span>Our Vision</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">Transforming Inventory Management</h2>
              <p className="text-muted-foreground md:text-lg">
                We envision a world where every business, regardless of size, has access to enterprise-grade inventory
                management capabilities that drive efficiency, accuracy, and growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-1 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                <span>Our Values</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What We Stand For</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our core values guide everything we do, from product development to customer service.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Innovation</h3>
                <p className="text-muted-foreground">
                  We constantly seek new and better ways to solve inventory challenges for our clients.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Simplicity</h3>
                <p className="text-muted-foreground">
                  We believe powerful tools should also be simple to use and understand.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Reliability</h3>
                <p className="text-muted-foreground">
                  Our clients depend on our system to run their businesses, and we take that responsibility seriously.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Our Team</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Meet the People Behind Our Success</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our diverse team brings together expertise in technology, business operations, and customer service.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Inventory Management?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of SMEs who have simplified their inventory processes with our platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/#contact">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
