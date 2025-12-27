import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-4 border-black mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-black text-xl">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              Leepo Learn
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              AI-powered learning platform for engineering students. Master your courses with confidence.
            </p>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4" />
              <a href="mailto:info@leepo.ai" className="text-sm hover:text-blue-600 transition-colors font-medium">
                info@leepo.ai
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-black text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-black text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:info@leepo.ai" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-black text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-black">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm font-medium">
              © {currentYear} Leepo Learn. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made with ❤️ for engineering students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
