import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function RefundPolicy() {
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
          <h1 className="text-5xl font-black tracking-tight">Cancellation & Refund Policy</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Last updated: December 27, 2025
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 p-3 rounded-lg border-2 border-black">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-3">Quick Summary</h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                We offer a <span className="font-bold">7-day money-back guarantee</span> on all purchases.
                If you're not satisfied with your purchase, you can request a full refund within 7 days of purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-black mb-4">1. Refund Eligibility</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">1.1 7-Day Money-Back Guarantee</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              You are eligible for a full refund if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>You request a refund within <strong>7 days</strong> of your purchase date</li>
              <li>You have not violated our Terms and Conditions</li>
              <li>You have not been banned or suspended for misconduct</li>
              <li>Your account is in good standing</li>
            </ul>

            <h3 className="text-2xl font-bold mb-3 mt-6">1.2 Non-Refundable Situations</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              Refunds will NOT be provided in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Requests made after the 7-day refund window</li>
              <li>Account termination due to violation of Terms and Conditions</li>
              <li>Abuse of the refund policy (multiple refund requests)</li>
              <li>Promotional or discounted purchases (unless required by law)</li>
              <li>After completing more than 80% of purchased content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">2. How to Request a Refund</h2>

            <div className="bg-blue-50 rounded-xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 border-2 border-black">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Email Us</h4>
                    <p className="text-slate-700">
                      Send an email to <a href="mailto:info@leepo.ai" className="text-blue-600 font-bold underline">info@leepo.ai</a> with
                      the subject line "Refund Request"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 border-2 border-black">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Provide Details</h4>
                    <p className="text-slate-700">
                      Include your registered email, order/transaction ID, and reason for refund
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 border-2 border-black">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Await Response</h4>
                    <p className="text-slate-700">
                      We'll review your request and respond within 2-3 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 border-2 border-black">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Receive Refund</h4>
                    <p className="text-slate-700">
                      If approved, refunds are processed within 5-7 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">3. Refund Processing</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">3.1 Processing Time</h3>
            <div className="bg-white rounded-lg p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 p-3 rounded-lg border-2 border-black">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Timeline</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li><strong>Review:</strong> 2-3 business days to review your request</li>
                    <li><strong>Processing:</strong> 5-7 business days to process approved refunds</li>
                    <li><strong>Bank Credit:</strong> Additional 3-5 business days for bank processing</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 mt-6">3.2 Refund Method</h3>
            <p className="text-slate-700 leading-relaxed">
              Refunds will be credited to the original payment method used for the purchase. If the original payment method
              is no longer available, please contact us to arrange an alternative refund method.
            </p>

            <h3 className="text-2xl font-bold mb-3 mt-6">3.3 Partial Refunds</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              In some cases, we may offer partial refunds:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>If significant content has been consumed (20-80% completion)</li>
              <li>For technical issues that affected only part of your access period</li>
              <li>As a goodwill gesture in exceptional circumstances</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">4. Cancellation Policy</h2>

            <h3 className="text-2xl font-bold mb-3 mt-6">4.1 Cancelling Subscriptions</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              Currently, we offer one-time purchases rather than recurring subscriptions. Once purchased:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Per Subject access is lifetime - no cancellation needed</li>
              <li>Full Year access is valid until course completion</li>
              <li>Access automatically expires upon graduation or course completion</li>
            </ul>

            <h3 className="text-2xl font-bold mb-3 mt-6">4.2 Account Deletion</h3>
            <p className="text-slate-700 leading-relaxed">
              You may request account deletion at any time by emailing{" "}
              <a href="mailto:info@leepo.ai" className="text-blue-600 font-bold underline">info@leepo.ai</a>.
              Account deletion does not automatically trigger a refund. Refund eligibility is based on our refund policy above.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">5. Technical Issues</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              If you experience technical problems:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Contact our support team at <a href="mailto:info@leepo.ai" className="text-blue-600 font-bold underline">info@leepo.ai</a> immediately</li>
              <li>Provide details about the issue (screenshots, error messages, etc.)</li>
              <li>We will work to resolve the issue within 48 hours</li>
              <li>If we cannot resolve the issue, you may be eligible for a refund regardless of the 7-day window</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">6. Dispute Resolution</h2>
            <p className="text-slate-700 leading-relaxed">
              If you're not satisfied with our refund decision, you may escalate your concern by replying to our response
              email. We will review escalated cases within 5 business days and provide a final decision.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">7. Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to modify this policy at any time. Changes will be posted on this page with an updated
              "Last updated" date. Purchases made before changes take effect will be subject to the policy in effect at the
              time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4">8. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For refund requests or questions about this policy:
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
              <p className="font-bold text-lg mb-2">Email:</p>
              <a href="mailto:info@leepo.ai" className="text-yellow-300 font-bold text-xl underline">info@leepo.ai</a>
              <p className="mt-4 text-sm opacity-90">
                Subject line for refunds: "Refund Request"
              </p>
            </div>
          </section>

          {/* Important Notice */}
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 p-3 rounded-lg border-2 border-black">
                <AlertCircle className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Important Notice</h3>
                <p className="text-slate-700">
                  This refund policy is designed to be fair to both students and Leepo Learn. We're committed to providing
                  quality education and excellent customer service. If you have any concerns, please don't hesitate to
                  reach out to us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
