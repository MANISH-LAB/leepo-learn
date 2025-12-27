import { useNavigate } from "react-router-dom";
import { GraduationCap, Target, Users, Zap, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function AboutUs() {
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
          <h1 className="text-5xl font-black tracking-tight">About Leepo Learn</h1>
          <p className="text-xl text-muted-foreground font-medium">
            Revolutionizing engineering education through AI-powered learning
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 p-3 rounded-lg border-2 border-black">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-3">Our Mission</h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                At Leepo Learn, we're on a mission to make quality engineering education accessible to every student.
                We believe that learning should be engaging, personalized, and effective. Our AI-powered platform
                adapts to each student's pace, helping them master complex engineering concepts with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="space-y-4">
          <h2 className="text-3xl font-black">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-purple-100 p-3 rounded-lg border-2 border-black w-fit mb-4">
                <GraduationCap className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="text-xl font-black mb-2">Comprehensive Curriculum</h3>
              <p className="text-slate-600">
                Complete engineering course coverage from first year to final year, with video lectures,
                interactive content, and practice problems.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-yellow-100 p-3 rounded-lg border-2 border-black w-fit mb-4">
                <Zap className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-black mb-2">AI-Powered Learning</h3>
              <p className="text-slate-600">
                Our intelligent system tracks your progress and adapts to your learning style,
                providing personalized recommendations and instant doubt resolution.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-green-100 p-3 rounded-lg border-2 border-black w-fit mb-4">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-black mb-2">Community Support</h3>
              <p className="text-slate-600">
                Join thousands of engineering students learning together, sharing knowledge,
                and supporting each other's academic journey.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-red-100 p-3 rounded-lg border-2 border-black w-fit mb-4">
                <Target className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-black mb-2">Track Progress</h3>
              <p className="text-slate-600">
                Monitor your learning journey with detailed analytics, streak tracking,
                and achievement badges to keep you motivated.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-yellow-50 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-6">Why Choose Leepo Learn?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="bg-yellow-400 p-1 rounded border border-black mt-1">
                <div className="h-2 w-2 bg-black rounded-full" />
              </div>
              <p className="text-lg text-slate-700">
                <span className="font-bold">Designed for Engineering Students:</span> Content specifically tailored
                for CSE, ECE, and other engineering branches
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-yellow-400 p-1 rounded border border-black mt-1">
                <div className="h-2 w-2 bg-black rounded-full" />
              </div>
              <p className="text-lg text-slate-700">
                <span className="font-bold">Learn at Your Own Pace:</span> Access course materials 24/7
                and learn whenever it suits you
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-yellow-400 p-1 rounded border border-black mt-1">
                <div className="h-2 w-2 bg-black rounded-full" />
              </div>
              <p className="text-lg text-slate-700">
                <span className="font-bold">Affordable Education:</span> Quality learning without breaking the bank
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-yellow-400 p-1 rounded border border-black mt-1">
                <div className="h-2 w-2 bg-black rounded-full" />
              </div>
              <p className="text-lg text-slate-700">
                <span className="font-bold">Continuous Updates:</span> Course content regularly updated to match
                latest university syllabi
              </p>
            </li>
          </ul>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-white">
          <h2 className="text-3xl font-black mb-3">Want to Learn More?</h2>
          <p className="text-lg mb-6 opacity-90">
            Get in touch with us for any questions or support
          </p>
          <a
            href="/contact"
            className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-lg"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
