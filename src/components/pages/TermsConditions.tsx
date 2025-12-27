import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        {/* Back Button */}
        <div className="flex items-center mb-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 pb-8 border-b-4 border-black">
          <h1 className="text-5xl font-black tracking-tight">Terms & Conditions</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Last updated: December 27, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-black mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing and using Leepo Learn ("Platform", "Service", "we", "us", or "our"), you accept and agree to be
              bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">2. Description of Service</h2>
            <p className="text-slate-700 leading-relaxed">
              Leepo Learn is an online learning platform providing educational content for engineering students, including
              video lectures, interactive content, assessments, and progress tracking features. We reserve the right to modify,
              suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">3. User Registration and Account</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">3.1 Account Creation</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-2xl font-bold mb-3 mt-6">3.2 Eligibility</h3>
            <p className="text-slate-700 leading-relaxed">
              You must be at least 18 years old or enrolled in a college/university program to use this Service.
              By using the Platform, you represent and warrant that you meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">4. User Conduct</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Share your account credentials with others</li>
              <li>Download, copy, or distribute course content without permission</li>
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Interfere with or disrupt the Platform or servers</li>
              <li>Upload malicious code, viruses, or any harmful content</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use automated systems (bots, scrapers) to access the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">5. Subscriptions and Payments</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">5.1 Subscription Plans</h3>
            <p className="text-slate-700 leading-relaxed">
              We offer various subscription plans (Free, Per Subject, Full Year). Prices are displayed in Indian Rupees (₹)
              and are subject to change with notice.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">5.2 Payment Processing</h3>
            <p className="text-slate-700 leading-relaxed">
              All payments are processed securely through Razorpay. By making a purchase, you authorize us to charge your
              chosen payment method. You are responsible for ensuring your payment information is current and accurate.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">5.3 Subscription Period</h3>
            <p className="text-slate-700 leading-relaxed">
              Subject access is lifetime. Full Year access is valid for one academic year or until course completion.
              Access expires upon graduation or course completion, whichever comes first.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">5.4 Refunds</h3>
            <p className="text-slate-700 leading-relaxed">
              Please refer to our <a href="/refund-policy" className="text-blue-600 font-bold underline">Cancellation/Refund Policy</a> for
              detailed information about refunds.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">6. Intellectual Property Rights</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">6.1 Our Content</h3>
            <p className="text-slate-700 leading-relaxed">
              All content on the Platform, including but not limited to text, videos, graphics, logos, and software, is the
              property of Leepo Learn or its content suppliers and is protected by Indian and international copyright laws.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">6.2 License to Use</h3>
            <p className="text-slate-700 leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to access and use the Platform for personal,
              non-commercial educational purposes. This license does not include the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Download or copy content (except for offline viewing features where provided)</li>
              <li>Modify, distribute, or create derivative works</li>
              <li>Use content for commercial purposes</li>
              <li>Remove copyright or proprietary notices</li>
            </ul>

            <h3 className="text-2xl font-bold mb-3 mt-6">6.3 User Content</h3>
            <p className="text-slate-700 leading-relaxed">
              By submitting notes, questions, or other content to the Platform, you grant us a non-exclusive, worldwide,
              royalty-free license to use, modify, and display such content in connection with the Service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">7. Disclaimers and Limitation of Liability</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">7.1 "As Is" Service</h3>
            <p className="text-slate-700 leading-relaxed">
              The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied.
              We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">7.2 Educational Disclaimer</h3>
            <p className="text-slate-700 leading-relaxed">
              While we strive to provide accurate and high-quality educational content, we make no guarantees about academic
              outcomes, exam performance, or employment prospects resulting from use of the Platform.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">7.3 Limitation of Liability</h3>
            <p className="text-slate-700 leading-relaxed">
              To the fullest extent permitted by law, Leepo Learn shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
              or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">8. Indemnification</h2>
            <p className="text-slate-700 leading-relaxed">
              You agree to indemnify and hold harmless Leepo Learn, its affiliates, and their respective officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising
              from your violation of these Terms or your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">9. Termination</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion,
              without notice, for conduct that we believe:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Violates these Terms and Conditions</li>
              <li>Is harmful to other users or our business</li>
              <li>Exposes us to legal liability</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-3">
              Upon termination, your right to use the Platform will immediately cease. We are not obligated to provide refunds
              for terminations due to violations of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">10. Governing Law and Jurisdiction</h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from
              these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">11. Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the
              updated Terms on the Platform and updating the "Last updated" date. Your continued use of the Platform after
              changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">12. Severability</h2>
            <p className="text-slate-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or
              eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">13. Contact Information</h2>
            <p className="text-slate-700 leading-relaxed">
              For questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-black mt-4">
              <p className="font-bold text-lg mb-2">Email:</p>
              <a href="mailto:info@leepo.ai" className="text-blue-600 font-bold text-xl underline">info@leepo.ai</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
