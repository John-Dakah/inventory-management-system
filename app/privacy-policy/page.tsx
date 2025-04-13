import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 12, 2025"

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-1 text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Privacy Policy</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                This Privacy Policy describes how we collect, use, and share your personal information when you use our
                inventory management system.
              </p>
              <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">1. Information We Collect</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">1.1 Personal Information</h3>
                <p className="text-muted-foreground">We may collect the following types of personal information:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Contact information (such as name, email address, phone number, and business address)</li>
                  <li>Account credentials (such as username and password)</li>
                  <li>Payment information (such as credit card details and billing address)</li>
                  <li>Business information (such as company name, size, and industry)</li>
                  <li>User preferences and settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">1.2 Usage Information</h3>
                <p className="text-muted-foreground">
                  We automatically collect certain information about your use of our platform, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Log data (such as IP address, browser type, pages visited, and time spent)</li>
                  <li>Device information (such as device type, operating system, and unique device identifiers)</li>
                  <li>Location information (such as general location based on IP address)</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Providing and maintaining our services</li>
                <li>Processing transactions and managing your account</li>
                <li>Personalizing your experience</li>
                <li>Communicating with you about our services, updates, and promotional offers</li>
                <li>Responding to your inquiries and providing customer support</li>
                <li>Improving our services and developing new features</li>
                <li>Ensuring the security and integrity of our platform</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">3. How We Share Your Information</h2>
              <p className="text-muted-foreground">
                We may share your information with the following categories of third parties:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Service providers who perform services on our behalf (such as payment processors, cloud hosting
                  providers, and customer support tools)
                </li>
                <li>
                  Business partners with whom we offer co-branded services or engage in joint marketing activities
                </li>
                <li>Professional advisors (such as lawyers, accountants, and insurers)</li>
                <li>Government authorities or other third parties when required by law or to protect our rights</li>
                <li>Any other party with your consent</li>
              </ul>
              <p className="text-muted-foreground">We do not sell your personal information to third parties.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">4. Your Rights and Choices</h2>
              <p className="text-muted-foreground">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Accessing, correcting, or deleting your personal information</li>
                <li>Restricting or objecting to our use of your personal information</li>
                <li>Receiving a copy of your personal information in a structured, machine-readable format</li>
                <li>Withdrawing your consent at any time (where our processing is based on your consent)</li>
                <li>Opting out of marketing communications</li>
                <li>Disabling cookies and similar technologies</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section
                below.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission
                over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">6. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to fulfill the purposes for which we
                collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                When determining the appropriate retention period, we consider the amount, nature, and sensitivity of
                the personal information, the potential risk of harm from unauthorized use or disclosure, and the
                purposes for which we process the information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our services are not directed to children under the age of 16, and we do not knowingly collect personal
                information from children under 16. If you believe we have collected personal information from a child
                under 16, please contact us, and we will take steps to delete such information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">8. International Data Transfers</h2>
              <p className="text-muted-foreground">
                We may transfer your personal information to countries other than the country in which you reside. These
                countries may have different data protection laws than your country of residence. When we transfer your
                personal information internationally, we take appropriate safeguards to ensure that your information
                receives an adequate level of protection.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">9. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                requirements. We will notify you of any material changes by posting the updated Privacy Policy on our
                website and updating the "Last Updated" date. We encourage you to review this Privacy Policy
                periodically.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices,
                please contact us at:
              </p>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>privacy@example.com</span>
                    </div>
                    <p>123 Main Street, Suite 100</p>
                    <p>Anytown, ST 12345</p>
                    <p>United States</p>
                  </div>
                </CardContent>
              </Card>
              <p className="text-muted-foreground">We will respond to your request within a reasonable timeframe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Have Questions About Our Privacy Practices?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                We're committed to transparency and protecting your privacy. Contact our team for any questions or
                concerns.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/#contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
