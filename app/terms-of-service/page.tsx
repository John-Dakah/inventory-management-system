import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Mail } from "lucide-react"

export default function TermsOfServicePage() {
  const lastUpdated = "April 12, 2025"

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-1 text-sm font-medium">
                <FileText className="h-4 w-4" />
                <span>Legal</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Terms of Service</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Please read these terms carefully before using our inventory management system.
              </p>
              <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using our inventory management system (the "Service"), you agree to be bound by these
                Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p className="text-muted-foreground">
                We may modify these Terms at any time. If we make changes, we will provide notice by updating the "Last
                Updated" date at the top of these Terms and by posting the new Terms on our website. Your continued use
                of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Our Service provides inventory management tools for small and medium enterprises. The Service includes
                features such as inventory tracking, order management, reporting, and analytics.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time,
                with or without notice. We will not be liable to you or any third party for any modification,
                suspension, or discontinuation of the Service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">3. User Accounts</h2>
              <p className="text-muted-foreground">
                To use certain features of the Service, you must create an account. You agree to provide accurate,
                current, and complete information during the registration process and to update such information to keep
                it accurate, current, and complete.
              </p>
              <p className="text-muted-foreground">
                You are responsible for safeguarding your account credentials and for all activities that occur under
                your account. You agree to notify us immediately of any unauthorized use of your account or any other
                breach of security.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to disable any user account at any time if, in our opinion, you have failed to
                comply with these Terms or if we suspect unauthorized or fraudulent use of your account.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">4. Subscription and Payment</h2>
              <p className="text-muted-foreground">
                Some features of the Service require a paid subscription. By subscribing to the Service, you agree to
                pay the applicable fees as they become due.
              </p>
              <p className="text-muted-foreground">
                All fees are exclusive of taxes, which you are responsible for paying. Fees are non-refundable except as
                required by law or as explicitly stated in these Terms.
              </p>
              <p className="text-muted-foreground">
                We may change our fees at any time. If we increase fees for a subscription you have already purchased,
                we will notify you at least 30 days in advance. If you do not agree to the fee increase, you may cancel
                your subscription before the fee increase takes effect.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">5. User Content</h2>
              <p className="text-muted-foreground">
                The Service allows you to upload, store, and share content such as inventory data, product information,
                and user settings ("User Content"). You retain all rights in your User Content.
              </p>
              <p className="text-muted-foreground">
                By uploading User Content to the Service, you grant us a worldwide, non-exclusive, royalty-free license
                to use, reproduce, modify, adapt, publish, translate, and distribute your User Content solely for the
                purpose of providing and improving the Service.
              </p>
              <p className="text-muted-foreground">
                You represent and warrant that: (i) you own your User Content or have the right to use it and grant us
                the rights and license as provided in these Terms, and (ii) your User Content does not violate the
                privacy rights, publicity rights, intellectual property rights, or any other rights of any person.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">6. Prohibited Conduct</h2>
              <p className="text-muted-foreground">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service for any illegal purpose or in violation of any laws or regulations</li>
                <li>Violate or infringe other people's intellectual property, privacy, or other rights</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to the Service or other user accounts</li>
                <li>Use any automated means or interface not provided by us to access the Service</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Transmit any viruses, worms, defects, Trojan horses, or other items of a destructive nature</li>
                <li>Use the Service to send unsolicited communications or advertisements</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are owned by us and are protected by
                international copyright, trademark, patent, trade secret, and other intellectual property or proprietary
                rights laws.
              </p>
              <p className="text-muted-foreground">
                These Terms do not grant you any right, title, or interest in the Service, our trademarks, logos, or
                other intellectual property.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-muted-foreground">
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED,
                OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL
                COMPONENTS.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE,
                GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS
                OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT
                OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR
                CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY,
                WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">10. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to defend, indemnify, and hold us harmless from and against any claims, liabilities, damages,
                losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out
                of or in any way connected with your access to or use of the Service or your violation of these Terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">11. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach these Terms.
              </p>
              <p className="text-muted-foreground">
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your
                account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground">
                Any dispute arising from or relating to these Terms or your use of the Service shall be subject to the
                exclusive jurisdiction of the courts in [Your Jurisdiction].
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">13. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed
                and interpreted to accomplish the objectives of such provision to the greatest extent possible under
                applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">14. Entire Agreement</h2>
              <p className="text-muted-foreground">
                These Terms constitute the entire agreement between you and us regarding the Service and supersede all
                prior and contemporaneous written or oral agreements between you and us.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter">15. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at:
              </p>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>johnariphiosd@gmail.com</span>
                    </div>
                    <p>Chinhoi, Zimbabwe</p>
                    <p>Zimbabwe</p>
                    <p>+263 786 053 315</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Have Questions About Our Terms?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Our team is here to help you understand our terms and answer any questions you may have.
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
