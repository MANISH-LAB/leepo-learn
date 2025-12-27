import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function ContactUs() {
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
          <h1 className="text-5xl font-black tracking-tight">Contact Us</h1>
          <p className="text-xl text-muted-foreground font-medium">
            We're here to help! Reach out to us anytime
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-blue-500 p-4 rounded-lg border-2 border-black w-fit mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-3">Email Us</h2>
            <p className="text-slate-700 mb-4">
              Send us an email and we'll get back to you within 24 hours
            </p>
            <a
              href="mailto:info@leepo.ai"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
            >
              Send Email
            </a>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-purple-500 p-4 rounded-lg border-2 border-black w-fit mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-3">Support</h2>
            <p className="text-slate-700 mb-4">
              For technical support and queries about courses
            </p>
            <a
              href="mailto:info@leepo.ai?subject=Support Request"
              className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
            >
              Get Support
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Response Time */}
          <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg border-2 border-black">
                <Clock className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Response Time</h3>
                <p className="text-slate-600">
                  We typically respond to all queries within 24 hours during business days
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg border-2 border-black">
                <MapPin className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Location</h3>
                <p className="text-slate-600">
                  Based in India, serving engineering students nationwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-yellow-50 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">How do I reset my password?</h3>
              <p className="text-slate-700">
                You can reset your password by logging in with Google or email. If you face any issues,
                contact us at info@leepo.ai
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Can I get a refund?</h3>
              <p className="text-slate-700">
                Yes! We offer refunds within 7 days of purchase if you're not satisfied.
                Check our <a href="/refund-policy" className="text-blue-600 font-bold underline">Refund Policy</a> for details.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">How do I access premium content?</h3>
              <p className="text-slate-700">
                Click the "Upgrade" button in the navigation bar and choose a plan that suits you.
                You'll get instant access after payment.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Do you offer group/college discounts?</h3>
              <p className="text-slate-700">
                Yes! For bulk purchases and college partnerships, email us at info@leepo.ai
                with your requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-white">
          <h2 className="text-3xl font-black mb-3">Still Have Questions?</h2>
          <p className="text-lg mb-6 opacity-90">
            Don't hesitate to reach out. We're always happy to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@leepo.ai"
              className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-lg"
            >
              Send an Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
