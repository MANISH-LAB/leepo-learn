import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function PrivacyPolicy() {
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
          <h1 className="text-5xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Last updated: December 27, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-black mb-4">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              Welcome to Leepo Learn ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our learning platform at leepo.ai (the "Platform").
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">2. Information We Collect</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              When you register for an account, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Name and email address</li>
              <li>College/University name</li>
              <li>Degree program and current year</li>
              <li>Profile picture (if provided via Google OAuth)</li>
              <li>Payment information (processed securely through Razorpay)</li>
            </ul>

            <h3 className="text-2xl font-bold mb-3 mt-6">2.2 Usage Information</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              We automatically collect certain information when you use our Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Course progress and completion data</li>
              <li>Learning streaks and XP points</li>
              <li>Video watch time and interaction data</li>
              <li>Quiz and assessment scores</li>
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Provide, maintain, and improve our Platform</li>
              <li>Process your transactions and manage subscriptions</li>
              <li>Track your learning progress and provide personalized recommendations</li>
              <li>Send you important updates about your account and courses</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to improve our content and features</li>
              <li>Detect and prevent fraud or unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information with:
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">4.1 Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Razorpay:</strong> Payment processing</li>
              <li><strong>Google:</strong> OAuth authentication (if you choose to sign in with Google)</li>
            </ul>

            <h3 className="text-2xl font-bold mb-3 mt-6">4.2 Legal Requirements</h3>
            <p className="text-slate-700 leading-relaxed">
              We may disclose your information if required by law or in response to valid legal requests from
              public authorities.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">5. Data Security</h2>
            <p className="text-slate-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Encryption of data in transit using HTTPS/SSL</li>
              <li>Secure authentication using industry-standard protocols</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal data on a need-to-know basis</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-3">
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">6. Your Rights and Choices</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
              <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-3">
              To exercise these rights, please contact us at <a href="mailto:info@leepo.ai" className="text-blue-600 font-bold underline">info@leepo.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-slate-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Platform and store certain information.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do
              not accept cookies, you may not be able to use some portions of our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">8. Third-Party Links</h2>
            <p className="text-slate-700 leading-relaxed">
              Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these
              external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">9. Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed">
              Our Platform is intended for college students (typically 18+ years). We do not knowingly collect personal
              information from children under 18. If you believe we have collected information from a child, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">10. Data Retention</h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal
              obligations. When you delete your account, we will delete or anonymize your personal data within 90 days,
              except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy
              Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">12. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
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
