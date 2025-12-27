import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import {
  Sparkles,
  Zap,
  BrainCircuit,
  GraduationCap,
  Users,
  ArrowRight,
  Star,
  Quote,
  BookOpen,
  PlayCircle,
  Gamepad2,
  FileText,
  Headphones,
  Layers,
  Mail
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import exampleImage from "figma:asset/ca49d76f6d521037dd45917687381b170b9d3628.png";
import jamesWuImage from "figma:asset/cab67e1811baca1d1a37b386dbc98ad974cc9273.png";
import sarahJenkinsImage from "figma:asset/03e235e522a26b0ef38f572b89f2020af063d9f4.png";
import davidChenImage from "figma:asset/123d86b5d250f951a0d31d9f8ae64b58d8fbd00a.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactOpen(false);
    toast.success("Message sent! We'll get back to you shortly.");
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] font-sans selection:bg-yellow-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-20 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
             <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="300" cy="300" r="300" fill="#FFD700" />
             </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="bg-yellow-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
                    🚀 Leepo Learn - AI Learning Platform
                </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              From <span className="text-orange-500 underline decoration-wavy decoration-4 underline-offset-4">Spark</span> to <br/>
              Fire of <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Innovation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Ace your engineering exams, understand complex concepts, and build the future. 
              Join millions of students transforming their ideas into reality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
               <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="h-16 px-8 text-xl font-bold rounded-xl bg-blue-600 text-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
               >
                  Get Started Now <ArrowRight className="ml-2 h-6 w-6" />
               </Button>
               <Button 
                  size="lg" 
                  onClick={onLogin}
                  variant="outline"
                  className="h-16 px-8 text-xl font-bold rounded-xl bg-white text-slate-900 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
               >
                  Log In
               </Button>
            </div>
            
            <div className="pt-12 flex items-center justify-center gap-2 animate-in fade-in duration-1000 delay-500">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                             <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                    ))}
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold">
                        +1M
                    </div>
                </div>
                <div className="text-sm font-semibold text-slate-600">
                    Trusted by <span className="text-blue-600 font-bold">1 Million+</span> Future Engineers
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-y-2 border-black">
         <div className="container mx-auto px-4">
             <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black">Everything You Need to Excel</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                    We've packed every tool you need into one powerful platform.
                </p>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                    {
                        icon: BookOpen,
                        color: "bg-pink-500",
                        bgClass: "bg-pink-50",
                        shadowClass: "shadow-[8px_8px_0px_0px_#db2777] hover:shadow-[4px_4px_0px_0px_#db2777]",
                        title: "Topic Informatica",
                        description: "Deep dive into every topic with comprehensive, structured information designed for clarity."
                    },
                    {
                        icon: PlayCircle,
                        color: "bg-purple-500",
                        bgClass: "bg-purple-50",
                        shadowClass: "shadow-[8px_8px_0px_0px_#9333ea] hover:shadow-[4px_4px_0px_0px_#9333ea]",
                        title: "Concept Videos",
                        description: "Intuition-building animated videos that clear concepts faster than any textbook."
                    },
                    {
                        icon: Gamepad2,
                        color: "bg-cyan-500",
                        bgClass: "bg-cyan-50",
                        shadowClass: "shadow-[8px_8px_0px_0px_#0891b2] hover:shadow-[4px_4px_0px_0px_#0891b2]",
                        title: "Visual Playground",
                        description: "Don't just read about it. Interact with 3D models and simulations in our playground."
                    },
                    {
                        icon: FileText,
                        color: "bg-orange-500",
                        bgClass: "bg-orange-50",
                        shadowClass: "shadow-[8px_8px_0px_0px_#ea580c] hover:shadow-[4px_4px_0px_0px_#ea580c]",
                        title: "Smart Notes",
                        description: "Downloadable high-quality notes and PDFs for offline revision and exam prep."
                    },
                    {
                        icon: Headphones,
                        color: "bg-green-500",
                        bgClass: "bg-green-50",
                        shadowClass: "shadow-[8px_8px_0px_0px_#16a34a] hover:shadow-[4px_4px_0px_0px_#16a34a]",
                        title: "Audio Learning",
                        description: "Listen to lectures in the background while you commute or workout. Learning never stops."
                    },
                    {
                        icon: Layers,
                        color: "bg-yellow-500",
                        bgClass: "bg-yellow-50",
                        shadowClass: "shadow-[8px_8px_0px_0px_#ca8a04] hover:shadow-[4px_4px_0px_0px_#ca8a04]",
                        title: "All Engineering Subjects",
                        description: "From Computer Science to Mechanical, access a complete library of engineering disciplines."
                    }
                 ].map((feature, i) => (
                    <div key={i} className={`group ${feature.bgClass} rounded-2xl p-8 border-2 border-black ${feature.shadowClass} hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}>
                        <div className={`h-14 w-14 ${feature.color} rounded-xl flex items-center justify-center border-2 border-black mb-6 group-hover:rotate-6 transition-transform`}>
                            <feature.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                        <p className="text-lg text-slate-700 font-medium">
                            {feature.description}
                        </p>
                    </div>
                 ))}
             </div>
         </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-yellow-50 overflow-hidden">
          <div className="container mx-auto px-4 mb-12 text-center">
              <h2 className="text-4xl font-black mb-4">Loved by Students Everywhere</h2>
              <div className="h-2 w-24 bg-black mx-auto rounded-full"></div>
          </div>
          
          <div className="relative">
              {/* Marquee effect would go here, but for now a static grid */}
              <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-lg font-medium mb-6">"This platform literally saved my degree. The visualizations make everything click instantly!"</p>
                      <div className="flex items-center gap-3">
                          <img src="https://i.pravatar.cc/100?img=32" className="h-10 w-10 rounded-full border border-black" alt="Sarah" />
                          <div>
                              <div className="font-bold">Rana</div>
                              <div className="text-xs text-muted-foreground">Computer Science & Engineering</div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hidden md:block">
                      <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-lg font-medium mb-6">"Leepo Learn made GATE prep actually enjoyable. The AI videos are game-changing!"</p>
                      <div className="flex items-center gap-3">
                          <img src="https://i.pravatar.cc/100?img=11" className="h-10 w-10 rounded-full border border-black" alt="Mike" />
                          <div>
                              <div className="font-bold">Mike T.</div>
                              <div className="text-xs text-muted-foreground">Civil Engineering</div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hidden lg:block">
                      <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-lg font-medium mb-6">"The community features are amazing. I found my study group here."</p>
                      <div className="flex items-center gap-3">
                          <img src="https://i.pravatar.cc/100?img=5" className="h-10 w-10 rounded-full border border-black" alt="Alex" />
                          <div>
                              <div className="font-bold">Alex R.</div>
                              <div className="text-xs text-muted-foreground">Electrical Engineering</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* About Us & Team */}
      <section className="py-24 bg-white border-t-2 border-black">
          <div className="container mx-auto px-4">
              {/* About Us */}
              <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                 <div className="lg:w-1/2 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black">About Us</h2>
                    <p className="text-xl text-slate-700 font-medium leading-relaxed">
                       Our mission is to create a world of better problem solvers.
                    </p>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                       We help engineers master quantitative and technical skills. On our platform, you're learning by doing—there are no boring lectures, and everything is interactive. Our courses are a delightful experience of guided discovery, designed to improve your ability to think and reason from first principles.
                    </p>
                 </div>
                 <div className="lg:w-1/2 relative">
                    <div className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden bg-white aspect-video md:aspect-square flex items-center justify-center">
                       <div className="relative w-full h-full flex items-center justify-center">
                           {/* Abstract Shapes */}
                           <Zap className="absolute top-10 left-10 h-12 w-12 text-black fill-yellow-400 -rotate-12 animate-in fade-in zoom-in duration-700 delay-300" strokeWidth={2.5} />
                           <Star className="absolute bottom-12 right-12 h-10 w-10 text-black fill-pink-400 rotate-12 animate-in fade-in zoom-in duration-700 delay-500" strokeWidth={2.5} />
                           <div className="absolute top-1/2 right-8 h-6 w-6 bg-blue-400 border-2 border-black rounded-full animate-in fade-in zoom-in duration-700 delay-700"></div>
                           <div className="absolute bottom-20 left-16 h-4 w-4 bg-green-400 border-2 border-black rotate-45 animate-in fade-in zoom-in duration-700 delay-1000"></div>
                           <BrainCircuit className="absolute top-12 right-20 h-8 w-8 text-slate-300 opacity-50" />

                           {/* Main Image */}
                           <div className="relative z-10 w-full h-full flex items-center justify-center">
                               <div className="relative w-full h-full">
                                  <img 
                                      src="https://images.unsplash.com/photo-1507162728832-5b8fdb5f99fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMGlzb21ldHJpYyUyMHJvYm90JTIwbWFzY290JTIwZWR1Y2F0aW9uJTIwdGVjaG5vbG9neSUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NjUxOTI1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                                      alt="About Us Illustration" 
                                      className="relative z-20 w-full h-full object-contain p-8 mix-blend-multiply" 
                                  />
                                  <motion.div 
                                      className="absolute top-12 right-12 z-30 text-yellow-500"
                                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                  >
                                      <Zap className="w-10 h-10 fill-current" />
                                  </motion.div>
                                  <motion.div 
                                      className="absolute bottom-16 left-16 z-30 text-yellow-400"
                                      animate={{ opacity: [0, 1, 0], rotate: [0, 45, 0] }}
                                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                  >
                                      <Star className="w-8 h-8 fill-current" />
                                  </motion.div>
                                  <motion.div 
                                      className="absolute top-1/3 left-10 z-30 text-blue-400"
                                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.1, 0.9] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                  >
                                      <Sparkles className="w-8 h-8" />
                                  </motion.div>
                               </div>
                           </div>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Divider */}
              <div className="h-0.5 w-full bg-black mb-24 relative overflow-hidden"></div>

              {/* Team */}
              <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-16">Team</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {[
                        { name: "M kalyan", role: "Founder & CEO", img: "9" },
                        { name: "James Wu", role: "CTO", img: "11" },
                        { name: "Sarah Jenkins", role: "Head of Content", img: "5" },
                        { name: "David Chen", role: "Design Lead", img: "3" }
                      ].map((member) => (
                          <div key={member.name} className="text-center group">
                              <div className="relative inline-block mb-6">
                                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-black overflow-hidden bg-gray-100 relative z-10 mx-auto">
                                      <img src={member.name === "James Wu" ? jamesWuImage : member.name === "Sarah Jenkins" ? sarahJenkinsImage : member.name === "David Chen" ? davidChenImage : exampleImage} alt={member.name} className="w-full h-full object-cover p-1" />
                                  </div>
                                  <div className="absolute inset-0 rounded-full bg-blue-400 border-2 border-black transform translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"></div>
                              </div>
                              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                              <p className="text-slate-500 font-medium">{member.role}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-blue-600 text-white border-t-2 border-black">
          <div className="container mx-auto px-4 text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-black">Ready to build the future?</h2>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
                  Join the community of innovators today.
              </p>
              <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="h-20 px-10 text-2xl font-bold rounded-2xl bg-yellow-400 text-black border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-300 transition-all"
               >
                  Get Started For Free
               </Button>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white border-t-2 border-black">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-black text-xl text-white">
                  <GraduationCap className="h-6 w-6 text-blue-400" />
                  Leepo Learn
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  AI-powered learning platform for engineering students. Master your courses with confidence.
                </p>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:info@leepo.ai" className="text-sm hover:text-yellow-400 transition-colors font-medium">
                    info@leepo.ai
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-black text-lg mb-4 text-white">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/pricing" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/courses" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Browse Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-black text-lg mb-4 text-white">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/contact" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:info@leepo.ai" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Help & Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-black text-lg mb-4 text-white">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/privacy-policy" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-conditions" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link to="/refund-policy" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t-2 border-slate-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-400 text-sm font-medium">
                  © 2025 Leepo Learn. All rights reserved.
                </p>
                <p className="text-slate-500 text-sm">
                  Made with ❤️ for engineering students
                </p>
              </div>
            </div>
          </div>
      </footer>
    </div>
  );
}
