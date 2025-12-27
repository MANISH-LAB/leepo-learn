import { useState, useEffect } from "react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { supabase } from "../../utils/supabase/client";
import { apiClient } from "../../utils/api/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

interface EnrollmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (user: any) => void;
  initialStep?: number;
}

export function EnrollmentWizard({ open, onOpenChange, onComplete, initialStep = 1 }: EnrollmentWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    degree: "",
    year: "",
    passingYear: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  // Reset step when dialog closes or initialStep changes
  useEffect(() => {
    if (!open) {
      setStep(initialStep);
      setLoading(false);
    }
  }, [open, initialStep]);

  // Load current user data if they're logged in
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("EnrollmentWizard: Loading user data for", session.user.email);
        setCurrentUserId(session.user.id);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        console.log("EnrollmentWizard: Profile data", profile);

        if (profile) {
          // Pre-fill form with any existing data
          setFormData(prev => ({
            ...prev,
            name: profile.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
            email: profile.email || session.user.email || "",
            college: profile.college || "",
            degree: profile.degree || "",
            year: profile.current_year || "",
            passingYear: profile.passing_year || "",
          }));

          // Check if profile is complete (has all required fields)
          const isProfileComplete = profile.full_name && profile.college && profile.degree && profile.current_year;

          // If clicking upgrade and profile is complete, go straight to payment
          if (initialStep === 3 && isProfileComplete) {
            console.log("EnrollmentWizard: Profile complete, going to payment");
            setStep(3);
          }
          // If user is logged in (OAuth) but profile incomplete, skip to step 2
          else if (initialStep === 1 && !isProfileComplete) {
            console.log("EnrollmentWizard: Profile incomplete, skipping to step 2 (Complete Profile)");
            setStep(2);
          }
          // If profile is complete but user somehow ended up at step 1, skip to payment
          else if (initialStep === 1 && isProfileComplete) {
            console.log("EnrollmentWizard: Profile complete, skipping to payment");
            setStep(3);
          }
          else if (initialStep > 1) {
            console.log(`EnrollmentWizard: Using initialStep ${initialStep}`);
            setStep(initialStep);
          }
        } else {
          // No profile yet but user is authenticated - skip to step 2
          // Unless initialStep is explicitly set to 3 (shouldn't happen without profile)
          console.log("EnrollmentWizard: No profile, skipping to step 2");
          setFormData(prev => ({
            ...prev,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
            email: session.user.email || "",
          }));
          if (initialStep === 1 || initialStep === 3) {
            setStep(2);
          } else {
            setStep(initialStep);
          }
        }
      }
    }
    if (open) {
      loadUserData();
    }
  }, [open]);

  const handleNext = async () => {
    if (step === 2) {
      // Save profile data to database after step 2
      setLoading(true);
      try {
        if (currentUserId) {
          console.log('📝 Saving profile data via API:', {
            userId: currentUserId,
            name: formData.name,
            college: formData.college,
            degree: formData.degree,
            year: formData.year,
            passingYear: formData.passingYear
          });

          // Get user email for upsert
          const { data: { session } } = await supabase.auth.getSession();
          const userEmail = session?.user?.email || formData.email;

          // Upsert profile via API (create or update)
          const response = await apiClient.upsertProfile({
            id: currentUserId,
            email: userEmail,
            full_name: formData.name,
            college: formData.college,
            degree: formData.degree,
            current_year: formData.year,
            passing_year: formData.passingYear,
          });

          console.log('✅ API Response:', response);

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to update profile');
          }

          const updatedProfile = response.data;

          // Update parent component with user data
          onComplete({
            id: updatedProfile.id,
            name: updatedProfile.full_name,
            email: updatedProfile.email,
            avatar: updatedProfile.avatar_url,
            college: updatedProfile.college,
            degree: updatedProfile.degree,
            year: updatedProfile.current_year,
            passingYear: updatedProfile.passing_year,
            role: updatedProfile.role,
          });

          // Move to payment/enrollment step
          toast.success("Profile saved! Choose a plan to unlock premium content.");
          setStep(3);
        }
      } catch (error: any) {
        console.error("❌ Error saving profile:", error);
        toast.error(`Failed to save profile: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Payment step - process payment and save purchase
      setLoading(true);
      try {
        if (currentUserId && formData.degree && formData.year) {
          console.log('💳 Processing payment for:', {
            userId: currentUserId,
            degree: formData.degree,
            year: formData.year
          });

          // TODO: In production, integrate actual payment gateway here
          // For now, we'll simulate successful payment

          // Find the YEAR node from hierarchy via API
          const yearResponse = await apiClient.findYearNode(formData.degree, formData.year);

          console.log('🔍 Year node response:', yearResponse);

          let yearNodeId = null;
          if (yearResponse.success && yearResponse.data) {
            yearNodeId = yearResponse.data.id;
            console.log('✅ Found year node:', yearNodeId);
          } else {
            // Create a placeholder for demo purposes
            console.log("⚠️ Year node not found, using demo purchase");
            yearNodeId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID
          }

          console.log('💾 Saving purchase via API with yearNodeId:', yearNodeId);

          // Save purchase via API
          const purchaseResponse = await apiClient.createPurchase({
            user_id: currentUserId,
            year_node_id: yearNodeId,
            amount: 4999,
            currency: 'INR',
            payment_provider: 'demo',
            transaction_id: `txn_${Date.now()}`,
          });

          console.log('✅ Purchase API response:', purchaseResponse);

          if (!purchaseResponse.success) {
            throw new Error(purchaseResponse.error || 'Failed to create purchase');
          }

          toast.success(`Successfully enrolled in ${formData.degree} - Year ${formData.year}!`);
          onOpenChange(false);
          setStep(1);
        } else {
          toast.error("Please complete your profile first");
        }
      } catch (error: any) {
        console.error("❌ Error processing payment:", error);
        toast.error(error.message || "Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = async () => {
    // Skip payment and complete profile
    setLoading(true);
    try {
      if (currentUserId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.name,
            college: formData.college,
            degree: formData.degree,
            current_year: formData.year,
            passing_year: formData.passingYear,
          })
          .eq('id', currentUserId);

        if (error) throw error;

        const { data: updatedProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId);

        const updatedProfile = updatedProfiles && updatedProfiles.length > 0 ? updatedProfiles[0] : null;

        if (updatedProfile) {
          onComplete({
            id: updatedProfile.id,
            name: updatedProfile.full_name,
            email: updatedProfile.email,
            avatar: updatedProfile.avatar_url,
            college: updatedProfile.college,
            degree: updatedProfile.degree,
            year: updatedProfile.current_year,
            passingYear: updatedProfile.passing_year,
            role: updatedProfile.role,
          });
          onOpenChange(false);
          setStep(1);
          toast.success("Welcome! Profile setup complete.");
        }
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] transition-all bg-white placeholder:text-slate-400 font-medium";
  const labelClass = "text-sm font-bold text-black mb-1.5 block";
  const primaryBtnClass = "h-11 w-full bg-black text-white hover:bg-slate-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-base";
  const secondaryBtnClass = "h-11 bg-white text-black hover:bg-slate-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-base";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#fffdf5] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2 border-b-2 border-black bg-yellow-50">
          <DialogTitle className="text-2xl font-black text-black">
            {step === 1 && "Student Portal"}
            {step === 2 && "Complete Your Profile"}
            {step === 3 && "Unlock Full Access"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-600">
            {step === 1 && "Sign up or sign in to access your dashboard."}
            {step === 2 && "Tell us about yourself and your academic details."}
            {step === 3 && "Choose a plan to continue."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 py-6">
            {/* Step 1: Auth */}
            {step === 1 && (
                <Tabs value={authMode} onValueChange={(v: any) => setAuthMode(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-auto bg-transparent p-0 gap-4">
                        <TabsTrigger 
                            value="signup" 
                            className="h-10 data-[state=active]:bg-yellow-300 data-[state=active]:text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=inactive]:bg-white data-[state=inactive]:shadow-none data-[state=inactive]:translate-x-[1px] data-[state=inactive]:translate-y-[1px] font-bold"
                        >
                            Sign Up
                        </TabsTrigger>
                        <TabsTrigger 
                            value="signin" 
                            className="h-10 data-[state=active]:bg-yellow-300 data-[state=active]:text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=inactive]:bg-white data-[state=inactive]:shadow-none data-[state=inactive]:translate-x-[1px] data-[state=inactive]:translate-y-[1px] font-bold"
                        >
                            Sign In
                        </TabsTrigger>
                    </TabsList>
                    <div className="space-y-4">
                        {authMode === "signup" && (
                            <div className="grid gap-1">
                                <Label className={labelClass}>Full Name</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe" 
                                    className={inputClass}
                                />
                            </div>
                        )}
                        <div className="grid gap-1">
                            <Label className={labelClass}>Email</Label>
                            <Input 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="john@example.com" 
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label className={labelClass}>Password</Label>
                            <Input 
                                type="password"
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••" 
                                className={inputClass}
                            />
                        </div>
                        
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t-2 border-black/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#fffdf5] px-2 text-slate-500 font-bold">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className={secondaryBtnClass + " w-full flex items-center justify-center gap-2"}
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: `${window.location.origin}/courses`,
                                        }
                                    });
                                    if (error) throw error;
                                } catch (error: any) {
                                    console.error('Google sign in error:', error);
                                    toast.error(error.message || 'Failed to sign in with Google');
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                        >
                             <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  fill="#4285F4"
                                />
                                <path
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  fill="#34A853"
                                />
                                <path
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  fill="#FBBC05"
                                />
                                <path
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  fill="#EA4335"
                                />
                                <path d="M1 1h22v22H1z" fill="none" />
                             </svg>
                             Google
                        </Button>
                    </div>
                </Tabs>
            )}

            {/* Step 2: Student Profile */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="grid gap-1">
                        <Label className={labelClass}>Full Name</Label>
                        <Input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="John Doe" 
                            className={inputClass}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label className={labelClass}>College Name</Label>
                        <Input 
                            value={formData.college} 
                            onChange={e => setFormData({...formData, college: e.target.value})}
                            placeholder="Institute of Technology" 
                            className={inputClass}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label className={labelClass}>Branch / Degree</Label>
                        <Select onValueChange={(v) => setFormData({...formData, degree: v})}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                                <SelectItem value="ME">Mechanical Engineering</SelectItem>
                                <SelectItem value="EE">Electrical Engineering</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                             <Label className={labelClass}>Passing Year</Label>
                             <Input 
                                value={formData.passingYear} 
                                onChange={e => setFormData({...formData, passingYear: e.target.value})}
                                placeholder="2028" 
                                className={inputClass}
                             />
                        </div>
                        <div className="grid gap-1">
                             <Label className={labelClass}>Current Year</Label>
                             <Select onValueChange={(v) => setFormData({...formData, year: v})}>
                                 <SelectTrigger className={inputClass}>
                                     <SelectValue placeholder="Select Year" />
                                 </SelectTrigger>
                                 <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                     <SelectItem value="1">1st Year</SelectItem>
                                     <SelectItem value="2">2nd Year</SelectItem>
                                     <SelectItem value="3">3rd Year</SelectItem>
                                     <SelectItem value="4">4th Year</SelectItem>
                                 </SelectContent>
                             </Select>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
                <div className="space-y-4">
                    {/* Course Selection - Editable */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-600 rounded-lg space-y-3">
                        <h4 className="font-bold text-sm text-blue-900">Select Course to Unlock</h4>

                        <div className="grid gap-3">
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-blue-900">Degree Program</Label>
                                <Select value={formData.degree} onValueChange={value => setFormData({...formData, degree: value})}>
                                    <SelectTrigger className="h-10 border-2 border-blue-600 bg-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] font-medium">
                                        <SelectValue placeholder="Select degree" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="B.Tech CSE">B.Tech CSE</SelectItem>
                                        <SelectItem value="B.Tech IT">B.Tech IT</SelectItem>
                                        <SelectItem value="B.Tech ECE">B.Tech ECE</SelectItem>
                                        <SelectItem value="B.Tech ME">B.Tech ME</SelectItem>
                                        <SelectItem value="B.Tech CE">B.Tech CE</SelectItem>
                                        <SelectItem value="BCA">BCA</SelectItem>
                                        <SelectItem value="MCA">MCA</SelectItem>
                                        <SelectItem value="M.Tech CSE">M.Tech CSE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-blue-900">Academic Year</Label>
                                <Select value={formData.year} onValueChange={value => setFormData({...formData, year: value})}>
                                    <SelectTrigger className="h-10 border-2 border-blue-600 bg-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] font-medium">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1st Year</SelectItem>
                                        <SelectItem value="2">2nd Year</SelectItem>
                                        <SelectItem value="3">3rd Year</SelectItem>
                                        <SelectItem value="4">4th Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-2 border-t-2 border-blue-300">
                            <p className="text-blue-700 font-bold text-base">₹4,999 / year</p>
                            <p className="text-xs text-blue-600 mt-1">Full access to all courses, materials & assessments</p>
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <Label className={labelClass}>Card Number</Label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                            <Input
                                value={formData.cardNumber}
                                onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                                className={`${inputClass} pl-9`}
                                placeholder="0000 0000 0000 0000"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                            <Label className={labelClass}>Expiry</Label>
                            <Input
                                value={formData.expiry}
                                onChange={e => setFormData({...formData, expiry: e.target.value})}
                                placeholder="MM/YY"
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label className={labelClass}>CVC</Label>
                            <Input
                                value={formData.cvc}
                                onChange={e => setFormData({...formData, cvc: e.target.value})}
                                placeholder="123"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-md border-2 border-green-700 font-bold">
                         <CheckCircle2 className="h-5 w-5 fill-green-200" />
                         <span>Secure 256-bit SSL Encrypted Payment</span>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter className="p-6 pt-2 bg-slate-50 border-t-2 border-black flex items-center justify-between sm:justify-between gap-2">
          {step > 1 && step !== 2 ? (
             <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading} className={secondaryBtnClass + " flex-1"}>Back</Button>
          ) : <div className="flex-1"></div>}

          {step === 2 && (
             <Button onClick={handleNext} disabled={loading} className={primaryBtnClass + " flex-[2]"}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {loading ? "Saving..." : "Continue"}
             </Button>
          )}

          {step === 3 && (
             <>
               <Button variant="ghost" onClick={handleSkip} disabled={loading} className="flex-1 font-bold text-slate-500 hover:text-black hover:bg-transparent underline decoration-2 underline-offset-4">
                   Skip for Now
               </Button>
               <Button onClick={handleNext} disabled={loading} className={primaryBtnClass + " flex-[2]"}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Pay & Enroll
               </Button>
             </>
          )}

          {step === 1 && (
            <Button onClick={handleNext} disabled={loading} className={primaryBtnClass + " flex-[2]"}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authMode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
