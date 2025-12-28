import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Price } from "../ui/Price";

export function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-12">
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
          <h1 className="text-5xl font-black tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground font-medium">
            Choose the plan that works best for you
          </p>
          <p className="text-sm text-slate-500 font-medium bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 inline-block">
            💡 Prices shown in local currency are estimates. All payments are processed in USD.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="bg-gray-100 p-3 rounded-lg border-2 border-black w-fit mb-4">
              <Sparkles className="h-6 w-6 text-gray-700" />
            </div>
            <h2 className="text-3xl font-black mb-2">Free</h2>
            <div className="mb-6">
              <span className="text-5xl font-black">₹0</span>
              <span className="text-muted-foreground font-medium">/forever</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Access to free course content</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Limited video lectures</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Basic progress tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Community access</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/courses')}
              className="w-full bg-gray-200 text-black px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold mt-4"
            >
              Get Started
            </button>
          </div>

          {/* Subject Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="bg-black p-3 rounded-lg border-2 border-black w-fit mb-4">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-black mb-2">Per Subject</h2>
            <div className="mb-6">
              <Price
                amountUSD={5}
                className="text-5xl font-black"
                convertedClassName="text-sm"
              />
              <span className="text-muted-foreground font-medium ml-1">/subject</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Full access to one subject</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">All video lectures</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Interactive content</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Detailed analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Lifetime access</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/courses')}
              className="w-full bg-black text-white px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-gray-800 transition-all font-bold mt-4"
            >
              Choose Subjects
            </button>
          </div>

          {/* Full Year Plan - Recommended */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border-4 border-purple-600 shadow-[8px_8px_0px_0px_rgba(147,51,234,1)] flex flex-col relative pt-12">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-purple-600 text-white px-4 py-1 rounded-full border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                RECOMMENDED
              </div>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg border-2 border-black w-fit mb-4">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2">Full Year</h2>
            <div className="mb-6">
              <Price
                amountUSD={30}
                className="text-5xl font-black"
                convertedClassName="text-sm"
              />
              <span className="text-muted-foreground font-medium ml-1">/year</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">All subjects for your year</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Complete video library</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Interactive playground</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700 font-bold">Save 80% vs individual subjects!</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/courses')}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-purple-700 transition-all font-bold mt-4"
            >
              Get Full Access
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-6 text-center">What's Included</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-4 px-4 font-black">Feature</th>
                  <th className="text-center py-4 px-4 font-black">Free</th>
                  <th className="text-center py-4 px-4 font-black">Per Subject</th>
                  <th className="text-center py-4 px-4 font-black">Full Year</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Video Lectures</td>
                  <td className="text-center py-4 px-4 text-slate-500">Limited</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Interactive Content</td>
                  <td className="text-center py-4 px-4 text-slate-500">-</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Progress Tracking</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Advanced Analytics</td>
                  <td className="text-center py-4 px-4 text-slate-500">-</td>
                  <td className="text-center py-4 px-4 text-slate-500">-</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Priority Support</td>
                  <td className="text-center py-4 px-4 text-slate-500">-</td>
                  <td className="text-center py-4 px-4 text-slate-500">-</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-yellow-50 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-6">Pricing FAQs</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Can I upgrade from subject plan to full year?</h3>
              <p className="text-slate-700">
                Yes! Contact us and we'll adjust the pricing based on what you've already purchased.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Do you offer student discounts?</h3>
              <p className="text-slate-700">
                Our prices are already student-friendly! For bulk/college purchases, email info@leepo.ai
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-700">
                We accept UPI, cards, net banking, and all major payment methods through Razorpay.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Is there a money-back guarantee?</h3>
              <p className="text-slate-700">
                Yes! We offer a 7-day refund policy if you're not satisfied. See our{" "}
                <a href="/refund-policy" className="text-blue-600 font-bold underline">Refund Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
