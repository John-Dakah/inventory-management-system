import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Users, Heart, GraduationCap, Coffee, Globe, Clock, Leaf } from "lucide-react"

export default function CareersPage() {
  const jobOpenings = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description:
        "We're looking for an experienced Full Stack Developer to join our engineering team and help build the next generation of our inventory management platform.",
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Hybrid",
      type: "Full-time",
      description:
        "Join our design team to create intuitive and beautiful user experiences for our inventory management platform.",
    },
    {
      title: "Customer Success Specialist",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description:
        "Help our customers get the most out of our platform through training, support, and relationship building.",
    },
    {
      title: "Sales Development Representative",
      department: "Sales",
      location: "Remote",
      type: "Full-time",
      description:
        "Drive new business opportunities and help SMEs discover how our platform can transform their inventory management.",
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Hybrid",
      type: "Full-time",
      description:
        "Lead the development of new features and improvements to our platform based on customer feedback and market research.",
    },
    {
      title: "QA Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Ensure the quality and reliability of our platform through manual and automated testing.",
    },
  ]

  const benefits = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Remote-First Culture",
      description: "Work from anywhere in the world with our distributed team.",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Flexible Hours",
      description: "We focus on results, not when you work. Set your own schedule.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Comprehensive Healthcare",
      description: "Full medical, dental, and vision coverage for you and your dependents.",
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Generous PTO",
      description: "Take the time you need to rest and recharge with our unlimited vacation policy.",
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Learning & Development",
      description: "Annual budget for courses, conferences, and books to help you grow.",
    },
    {
      icon: <Coffee className="h-8 w-8" />,
      title: "Team Retreats",
      description: "Twice-yearly company retreats to connect, collaborate, and celebrate.",
    },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Team</h1>
              <p className="text-muted-foreground md:text-xl">
                We're building the future of inventory management for SMEs, and we're looking for talented people to
                join us on this journey.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <a href="#openings">View Open Positions</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact">Contact Recruiting</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Team collaboration"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Our Culture</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What It's Like to Work Here</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We've built a culture based on trust, collaboration, and continuous learning.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Remote-First</h3>
                <p className="text-muted-foreground">
                  We believe great work can happen anywhere. Our team is distributed across multiple countries and time
                  zones.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Ownership Mentality</h3>
                <p className="text-muted-foreground">
                  Everyone at our company is empowered to make decisions and take ownership of their work.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Customer Obsession</h3>
                <p className="text-muted-foreground">
                  We're deeply committed to understanding our customers' needs and building solutions that make their
                  lives easier.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Continuous Learning</h3>
                <p className="text-muted-foreground">
                  We encourage curiosity and provide resources for professional development and growth.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Work-Life Balance</h3>
                <p className="text-muted-foreground">
                  We believe in sustainable pace and encourage our team to take time to recharge.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold">Diversity & Inclusion</h3>
                <p className="text-muted-foreground">
                  We're committed to building a diverse team and creating an inclusive environment where everyone can
                  thrive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-1 text-sm font-medium">
                <Heart className="h-4 w-4" />
                <span>Benefits & Perks</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">We Take Care of Our Team</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We offer competitive compensation and benefits to support our team members' wellbeing and growth.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-2 rounded-full bg-muted">{benefit.icon}</div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section id="openings" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                <Briefcase className="h-4 w-4" />
                <span>Open Positions</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our Growing Team</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We're always looking for talented people to join our team. Check out our current openings below.
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-12">
            <TabsList className="grid w-full grid-cols-4 md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="engineering">Engineering</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6">
                {jobOpenings.map((job, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                              {job.department}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                              {job.location}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                              {job.type}
                            </span>
                          </div>
                          <p className="mt-4 text-muted-foreground">{job.description}</p>
                        </div>
                        <Button className="md:self-start">Apply Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="engineering" className="mt-6">
              <div className="grid gap-6">
                {jobOpenings
                  .filter((job) => job.department === "Engineering")
                  .map((job, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.department}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.location}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.type}
                              </span>
                            </div>
                            <p className="mt-4 text-muted-foreground">{job.description}</p>
                          </div>
                          <Button className="md:self-start">Apply Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="design" className="mt-6">
              <div className="grid gap-6">
                {jobOpenings
                  .filter((job) => job.department === "Design")
                  .map((job, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.department}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.location}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.type}
                              </span>
                            </div>
                            <p className="mt-4 text-muted-foreground">{job.description}</p>
                          </div>
                          <Button className="md:self-start">Apply Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="business" className="mt-6">
              <div className="grid gap-6">
                {jobOpenings
                  .filter((job) => ["Sales", "Customer Success", "Product"].includes(job.department))
                  .map((job, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.department}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.location}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {job.type}
                              </span>
                            </div>
                            <p className="mt-4 text-muted-foreground">{job.description}</p>
                          </div>
                          <Button className="md:self-start">Apply Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Don't See the Right Fit?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We're always looking for talented people to join our team. Send us your resume and we'll keep you in
                mind for future openings.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/contact">Send Your Resume</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Recruiting</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
