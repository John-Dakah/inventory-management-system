import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LifeBuoy,
  MessageSquare,
  Phone,
  Mail,
  FileQuestion,
  BookOpen,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Search,
} from "lucide-react"

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "You can reset your password by clicking on the 'Forgot Password' link on the login page. You will receive an email with instructions to reset your password. If you don't receive the email, please check your spam folder or contact our support team.",
    },
    {
      question: "Can I use the system on mobile devices?",
      answer:
        "Yes, our inventory management system is fully responsive and works on all devices including smartphones and tablets. We also offer dedicated mobile apps for iOS and Android for an optimized mobile experience.",
    },
    {
      question: "How do I set up multiple warehouses?",
      answer:
        "To set up multiple warehouses, go to Settings > Locations > Add New Location. You can define different warehouses, assign inventory to specific locations, and track stock levels across all your facilities.",
    },
    {
      question: "How can I import my existing inventory data?",
      answer:
        "We provide several ways to import your data. You can use our CSV/Excel import tool, connect via API, or request our team to assist with data migration. For large datasets, we recommend scheduling a call with our support team for guidance.",
    },
    {
      question: "Does the system integrate with my e-commerce platform?",
      answer:
        "Yes, we integrate with major e-commerce platforms including Shopify, WooCommerce, Magento, BigCommerce, and Amazon. You can find all available integrations in the Integrations section of your dashboard.",
    },
    {
      question: "How do I generate reports?",
      answer:
        "You can generate reports by navigating to the Reports section in your dashboard. We offer various pre-built reports for inventory levels, sales, purchases, and more. You can also create custom reports based on your specific requirements.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We offer multiple support channels including email, live chat, and phone support. Our standard support hours are Monday to Friday, 9 AM to 6 PM EST. Premium support plans include extended hours and dedicated support representatives.",
    },
    {
      question: "How secure is my data?",
      answer:
        "We take security seriously. Your data is encrypted both in transit and at rest. We use industry-standard security practices, regular backups, and maintain SOC 2 compliance. For more details, please refer to our Security page.",
    },
  ]

  const supportPlans = [
    {
      title: "Basic Support",
      description: "Included with all subscriptions",
      features: [
        "Email support (24-48 hour response)",
        "Knowledge base access",
        "Community forum access",
        "Regular business hours",
      ],
      icon: <LifeBuoy className="h-6 w-6" />,
      cta: "Contact Support",
      link: "#contact-form",
    },
    {
      title: "Premium Support",
      description: "Enhanced support for growing businesses",
      features: [
        "Priority email support (8-12 hour response)",
        "Live chat support",
        "Phone support during business hours",
        "Extended hours (Mon-Sat)",
      ],
      icon: <Zap className="h-6 w-6" />,
      cta: "Upgrade Support",
      link: "/pricing",
      highlight: true,
    },
    {
      title: "Enterprise Support",
      description: "Dedicated support for large organizations",
      features: [
        "Dedicated support representative",
        "24/7 emergency support",
        "Custom training sessions",
        "Quarterly account reviews",
      ],
      icon: <Shield className="h-6 w-6" />,
      cta: "Contact Sales",
      link: "/contact",
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
                <LifeBuoy className="h-4 w-4" />
                <span>Support Center</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">How Can We Help You Today?</h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                Find answers to your questions, get help with issues, or contact our support team.
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
                <h3 className="text-xl font-bold">Search for Help</h3>
                <p className="text-sm text-muted-foreground">Find answers quickly by searching our knowledge base.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search for help..." className="pl-9" />
                  </div>
                  <Button>Search</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Support Options</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Choose the support option that works best for you. We're here to help you succeed.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
              <CardHeader className="p-6 pb-3 flex flex-col items-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3 text-center">
                <p className="text-muted-foreground">
                  Chat with our support team in real-time for immediate assistance.
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-center">
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start Chat
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-6 pb-3 flex flex-col items-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Phone Support</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3 text-center">
                <p className="text-muted-foreground">Speak directly with our support specialists for complex issues.</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-center">
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Support
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-6 pb-3 flex flex-col items-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Email Support</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3 text-center">
                <p className="text-muted-foreground">
                  Send us a detailed description of your issue for thorough assistance.
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-center">
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="#contact-form">
                    <Mail className="h-4 w-4" />
                    Email Us
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-6 pb-3 flex flex-col items-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileQuestion className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3 text-center">
                <p className="text-muted-foreground">Browse our comprehensive documentation and self-help resources.</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-center">
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="/documentation">
                    <BookOpen className="h-4 w-4" />
                    View Articles
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Plans */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Support Plans</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Choose the support plan that best fits your business needs.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {supportPlans.map((plan, index) => (
              <Card
                key={index}
                className={`overflow-hidden ${
                  plan.highlight
                    ? "border-primary shadow-lg relative before:absolute before:inset-0 before:-z-10 before:bg-primary/5 before:rounded-xl"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <CardHeader className="p-6 pb-3 flex flex-col items-center">
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                      plan.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}
                  >
                    {plan.icon}
                  </div>
                  <CardTitle className="text-center">{plan.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="p-6 pt-3">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-center">
                  <Button variant={plan.highlight ? "default" : "outline"} className="w-full" asChild>
                    <Link href={plan.link}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto">
                Find quick answers to common questions about our inventory management system.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="flex justify-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href="/documentation">View All FAQs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                <Mail className="h-4 w-4" />
                <span>Get in Touch</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">Contact Our Support Team</h2>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
              </p>

              <div className="grid gap-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">support@example.com</p>
                    <p className="text-sm text-muted-foreground">We aim to respond within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Available Monday-Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Support Hours</h3>
                    <p className="text-sm text-muted-foreground">Standard: Monday-Friday, 9 AM - 6 PM EST</p>
                    <p className="text-sm text-muted-foreground">Premium: Monday-Saturday, 8 AM - 8 PM EST</p>
                    <p className="text-sm text-muted-foreground">Enterprise: 24/7 Emergency Support</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Send a Support Request</h3>
                <Tabs defaultValue="technical" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                  </TabsList>
                  <TabsContent value="technical" className="space-y-4 pt-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Name
                          </label>
                          <Input id="name" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input id="email" type="email" placeholder="Your email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input id="subject" placeholder="Brief description of your issue" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Please provide details about your technical issue"
                          rows={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="attachment" className="text-sm font-medium">
                          Attachment (optional)
                        </label>
                        <Input id="attachment" type="file" />
                        <p className="text-xs text-muted-foreground">Upload screenshots or relevant files (max 10MB)</p>
                      </div>
                      <Button className="w-full">Submit Support Request</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="billing" className="space-y-4 pt-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name-billing" className="text-sm font-medium">
                            Name
                          </label>
                          <Input id="name-billing" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email-billing" className="text-sm font-medium">
                            Email
                          </label>
                          <Input id="email-billing" type="email" placeholder="Your email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="account" className="text-sm font-medium">
                          Account ID
                        </label>
                        <Input id="account" placeholder="Your account ID" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="billing-issue" className="text-sm font-medium">
                          Billing Issue
                        </label>
                        <select
                          id="billing-issue"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select an issue</option>
                          <option value="payment">Payment Problem</option>
                          <option value="invoice">Invoice Question</option>
                          <option value="refund">Refund Request</option>
                          <option value="subscription">Subscription Change</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message-billing" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea
                          id="message-billing"
                          placeholder="Please provide details about your billing issue"
                          rows={5}
                        />
                      </div>
                      <Button className="w-full">Submit Billing Request</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="general" className="space-y-4 pt-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name-general" className="text-sm font-medium">
                            Name
                          </label>
                          <Input id="name-general" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email-general" className="text-sm font-medium">
                            Email
                          </label>
                          <Input id="email-general" type="email" placeholder="Your email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject-general" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input id="subject-general" placeholder="Subject of your inquiry" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message-general" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea id="message-general" placeholder="How can we help you?" rows={5} />
                      </div>
                      <Button className="w-full">Submit Inquiry</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Need More Personalized Help?</h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Schedule a one-on-one demo or training session with our product specialists.
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
                  <Link href="/tutorials">View Tutorials</Link>
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

