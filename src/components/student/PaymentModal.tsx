import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  CheckCircle2,
  CreditCard,
  Sparkles,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Package,
  Calendar,
  DollarSign,
  ShieldCheck,
  Info
} from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Node } from "../../utils/sharedData";
import * as db from "../../utils/supabase/database";
import { createSubscription } from "../../utils/supabase/database";
import { useIsMobile } from "../ui/use-mobile";
import { Price } from "../ui/Price";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (purchasedItems: PurchasedAccess) => void;
  degreeTitle: string;
  yearNode: Node | null;
}

export interface PurchasedAccess {
  type: 'subjects' | 'year' | 'years';
  degreeId: string;
  yearIds: string[];
  subjectIds: string[];
  totalPrice: number;
}

type SelectionStep = "degree" | "selection" | "payment" | "success";

interface DegreeOption {
  id: string;
  title: string;
}

interface YearData {
  id: string;
  title: string;
  subjects: Node[];
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  degreeTitle,
  yearNode,
}: PaymentModalProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<SelectionStep>("degree");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  // Degree selection
  const [degrees, setDegrees] = useState<DegreeOption[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<DegreeOption | null>(null);

  // Year and subject selection
  const [years, setYears] = useState<YearData[]>([]);
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

  // Pricing from database
  const [SUBJECT_PRICE, setSubjectPrice] = useState(5);
  const [YEAR_PRICE, setYearPrice] = useState(30);

  // Calculate total price
  // Count full years at $30 each
  // Count only individual subjects (not part of a full year) at $5 each
  const totalPrice = (() => {
    let total = selectedYears.size * YEAR_PRICE;

    // Count subjects that are NOT part of a fully selected year
    selectedSubjects.forEach(subjectId => {
      const isPartOfSelectedYear = Array.from(selectedYears).some(yearId => {
        const year = years.find(y => y.id === yearId);
        return year?.subjects.some(s => s.id === subjectId);
      });

      if (!isPartOfSelectedYear) {
        total += SUBJECT_PRICE;
      }
    });

    return total;
  })();

  // Load pricing from database
  useEffect(() => {
    const loadPricing = async () => {
      try {
        console.log('💰 Loading pricing config...');
        const data = await db.getPricingConfig();

        console.log('💰 Pricing config data:', data);

        if (data && data.length > 0) {
          const subjectPriceConfig = data.find((c: any) => c.config_key === 'subject_price');
          const yearPriceConfig = data.find((c: any) => c.config_key === 'year_price');

          console.log('💰 Subject price config:', subjectPriceConfig);
          console.log('💰 Year price config:', yearPriceConfig);

          if (subjectPriceConfig) {
            setSubjectPrice(Number(subjectPriceConfig.config_value));
            console.log('💰 Set subject price to:', subjectPriceConfig.config_value);
          }
          if (yearPriceConfig) {
            setYearPrice(Number(yearPriceConfig.config_value));
            console.log('💰 Set year price to:', yearPriceConfig.config_value);
          }
        }
      } catch (error) {
        console.error('❌ Error loading pricing:', error);
        // Keep default values if loading fails
      }
    };

    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  // Load degrees on modal open
  useEffect(() => {
    if (isOpen) {
      loadDegrees();
    }
  }, [isOpen]);

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep("degree");
      setSelectedDegree(null);
      setSelectedYears(new Set());
      setSelectedSubjects(new Set());
      setYears([]);
    }
  }, [isOpen]);

  const loadDegrees = async () => {
    try {
      const degreeNodes = await db.fetchDegrees();
      setDegrees(degreeNodes.map(d => ({ id: d.id, title: d.title })));

      // If only one degree, auto-select it
      if (degreeNodes.length === 1) {
        handleDegreeSelect(degreeNodes[0]);
      }
    } catch (error) {
      console.error("Error loading degrees:", error);
    }
  };

  const handleDegreeSelect = async (degree: DegreeOption) => {
    setSelectedDegree(degree);
    setLoadingYears(true);

    try {
      // Fetch years for this degree
      const yearNodes = await db.fetchYearsForDegree(degree.id);

      // Fetch subjects for each year
      const yearsWithSubjects = await Promise.all(
        yearNodes.map(async (year) => {
          const subjects = await db.fetchSubjectsForYear(year.id);
          return {
            id: year.id,
            title: year.title,
            subjects,
          };
        })
      );

      setYears(yearsWithSubjects);
      setStep("selection");
    } catch (error) {
      console.error("Error loading years:", error);
    } finally {
      setLoadingYears(false);
    }
  };

  // Handle full year toggle
  const toggleYear = (yearId: string) => {
    const newSelectedYears = new Set(selectedYears);
    const year = years.find(y => y.id === yearId);

    if (newSelectedYears.has(yearId)) {
      // Unselecting year - remove year and its subjects
      newSelectedYears.delete(yearId);
      const newSelectedSubjects = new Set(selectedSubjects);
      year?.subjects.forEach(s => newSelectedSubjects.delete(s.id));
      setSelectedSubjects(newSelectedSubjects);
    } else {
      // Selecting year - add year and all its subjects
      newSelectedYears.add(yearId);
      const newSelectedSubjects = new Set(selectedSubjects);
      year?.subjects.forEach(s => newSelectedSubjects.add(s.id));
      setSelectedSubjects(newSelectedSubjects);
    }
    setSelectedYears(newSelectedYears);
  };

  // Handle individual subject toggle
  const toggleSubject = (yearId: string, subjectId: string) => {
    const newSelectedSubjects = new Set(selectedSubjects);
    const year = years.find(y => y.id === yearId);

    if (newSelectedSubjects.has(subjectId)) {
      newSelectedSubjects.delete(subjectId);
      // If unchecking a subject from a fully selected year, uncheck the year too
      if (selectedYears.has(yearId)) {
        const newSelectedYears = new Set(selectedYears);
        newSelectedYears.delete(yearId);
        setSelectedYears(newSelectedYears);
      }
    } else {
      newSelectedSubjects.add(subjectId);
      // Check if all subjects in this year are now selected
      const allSubjectsSelected = year?.subjects.every(s =>
        newSelectedSubjects.has(s.id)
      );
      if (allSubjectsSelected) {
        const newSelectedYears = new Set(selectedYears);
        newSelectedYears.add(yearId);
        setSelectedYears(newSelectedYears);
      }
    }
    setSelectedSubjects(newSelectedSubjects);
  };

  // Handle payment
  const handlePayment = async () => {
    console.log('🎯 PAY BUTTON CLICKED - Razorpay Integration');
    setIsLoading(true);

    try {
      // WORKAROUND: Get session directly from localStorage to avoid hanging
      console.log('📝 Step 1: Getting user from localStorage...');

      // Read session from localStorage directly (Supabase stores it here)
      const supabaseAuthKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
      console.log('🔑 Looking for key:', supabaseAuthKey);

      const storedSession = localStorage.getItem(supabaseAuthKey);
      console.log('💾 Stored session exists:', !!storedSession);

      if (!storedSession) {
        console.error('❌ No stored session - user not logged in');
        alert('Please log in to continue with payment');
        setIsLoading(false);
        return;
      }

      let sessionData;
      try {
        sessionData = JSON.parse(storedSession);
        console.log('✅ Session parsed successfully');
      } catch (parseError) {
        console.error('❌ Failed to parse session:', parseError);
        alert('Session error. Please try logging out and back in.');
        setIsLoading(false);
        return;
      }

      const user = sessionData?.user;
      console.log('👤 User from localStorage:', user?.email || 'No user');

      if (!user) {
        console.error('❌ No user in session');
        alert('Please log in to continue with payment');
        setIsLoading(false);
        return;
      }

      // Create Razorpay order
      console.log('📝 Step 2: Creating Razorpay order...', { amount: totalPrice, currency: 'USD' });
      const orderResponse = await fetch('http://localhost:3010/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'USD',
        }),
      });

      console.log('📡 Order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('❌ Order creation failed:', errorText);
        throw new Error('Failed to create order: ' + errorText);
      }

      const orderData = await orderResponse.json();
      console.log('✅ Order created:', orderData);
      const { orderId, amount, currency } = orderData;

      // Razorpay Checkout options
      console.log('📝 Step 3: Opening Razorpay checkout...');
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Leepo Learn',
        description: `${selectedYears.size > 0 ? 'Year' : 'Subject'} Purchase - ${selectedDegree?.title || ''}`,
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful - verify and save
          console.log('💳 PAYMENT HANDLER CALLED - Razorpay response:', response);

          try {
            setIsLoading(true);
            console.log('🔄 Setting loading to true');

            // Verify payment signature
            console.log('📝 Step 4: Verifying payment signature...');
            console.log('🔑 Payment details:', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature?.substring(0, 20) + '...'
            });

            const verifyResponse = await fetch('http://localhost:3010/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            console.log('📡 Verification response status:', verifyResponse.status);
            const verification = await verifyResponse.json();
            console.log('✅ Verification result:', verification);

            if (verification.success && verification.verified) {
              console.log('✅ Payment verified successfully!');

              // Save subscription to database via backend API
              console.log('💾 Step 5: Saving subscription to database via backend...');
              const subscriptionData = {
                user_id: user.id,
                purchase_type: selectedYears.size > 0 ? (selectedYears.size > 1 ? 'years' : 'year') : 'subject',
                degree_id: selectedDegree?.id,
                degree_title: selectedDegree?.title,
                year_ids: Array.from(selectedYears),
                subject_ids: Array.from(selectedSubjects),
                total_price: totalPrice,
                payment_status: 'completed',
                payment_method: 'razorpay',
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
              };
              console.log('📦 Subscription data:', subscriptionData);

              const subscriptionResponse = await fetch('http://localhost:3010/api/subscriptions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscriptionData),
              });

              console.log('📡 Subscription response status:', subscriptionResponse.status);
              const subscriptionResult = await subscriptionResponse.json();
              console.log('💾 Subscription result:', subscriptionResult);

              if (subscriptionResult.success && subscriptionResult.subscription) {
                console.log('🎉 SUCCESS! Moving to success screen');
                setStep("success");
              } else {
                console.error('❌ Subscription creation failed:', subscriptionResult.error);
                alert('Payment successful but failed to save subscription. Please contact support.');
              }
            } else {
              console.error('❌ Payment verification failed:', verification);
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('💥 Payment handler error:', error);
            console.error('💥 Error stack:', (error as Error).stack);
            alert('Payment verification failed. Please contact support with order ID: ' + response.razorpay_order_id);
          } finally {
            console.log('🔄 Setting loading to false');
            setIsLoading(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      // Close PaymentModal before opening Razorpay to avoid blocking interaction
      console.log('🚪 Closing PaymentModal to allow Razorpay interaction...');
      onClose();

      // Open Razorpay Checkout
      console.log('🚀 Opening Razorpay...');
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      console.log('✅ Razorpay opened successfully!');

    } catch (error) {
      console.error('❌ PAYMENT ERROR:', error);
      alert('Failed to initiate payment. Please try again. Error: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === "success" && selectedDegree) {
      const purchasedAccess: PurchasedAccess = {
        type: selectedYears.size > 0 ? (selectedYears.size > 1 ? 'years' : 'year') : 'subjects',
        degreeId: selectedDegree.id,
        yearIds: Array.from(selectedYears),
        subjectIds: Array.from(selectedSubjects),
        totalPrice,
      };
      onSuccess(purchasedAccess);
    }
    onClose();
  };

  const canProceed = selectedYears.size > 0 || selectedSubjects.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? 'fixed inset-0 top-0 left-0 w-screen h-screen max-w-none rounded-none m-0 translate-x-0 translate-y-0' : 'sm:max-w-[900px] max-h-[90vh]'} p-0 overflow-hidden gap-0 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#fffdf5]`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 ${isMobile ? 'p-4' : 'p-6'} border-b-2 border-black`}>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-black flex items-center gap-2 text-black">
                <Sparkles className="h-6 w-6 text-black" />
                {step === "degree" && "Choose Your Degree"}
                {step === "selection" && "Select Your Content"}
                {step === "payment" && "Payment Details"}
                {step === "success" && "Purchase Complete!"}
              </DialogTitle>
              <DialogDescription className="text-black mt-2 font-bold opacity-80">
                {step === "degree" && "Select which degree you want to access"}
                {step === "selection" && `${selectedDegree?.title || ""} - Choose years or individual subjects`}
                {step === "payment" && "Secure payment processing"}
                {step === "success" && "You now have access to your selected content"}
              </DialogDescription>
            </div>
            {(step === "selection" || step === "payment") && (
              <div className="text-right bg-yellow-400 text-black px-4 py-2 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Price
                  amountUSD={totalPrice}
                  className="text-3xl font-black"
                  convertedClassName="text-xs"
                />
                <div className="text-xs font-bold">Total</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className={`${isMobile ? 'p-4' : 'p-6'} overflow-y-auto`} style={{ maxHeight: isMobile ? 'calc(100vh - 180px)' : 'calc(90vh - 280px)' }}>
          {/* STEP 1: Degree Selection */}
          {step === "degree" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-slate-700 mb-4 font-medium text-lg">
                Choose the degree program you want to access:
              </p>
              {degrees.map((degree) => (
                <Card
                  key={degree.id}
                  className="border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
                  onClick={() => handleDegreeSelect(degree)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-black">
                          <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl">{degree.title}</h3>
                          <p className="text-sm text-slate-600 font-medium">
                            Full access to all years and subjects
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-black" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 2: Year/Subject Selection */}
          {step === "selection" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {loadingYears ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              ) : years.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No content available yet</p>
                  <p className="text-sm text-muted-foreground">
                    Content is being prepared for {selectedDegree?.title}
                  </p>
                </div>
              ) : (
                <>
                <div className="bg-yellow-300 border-2 border-black rounded-xl px-5 py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
  <h3 className="font-black text-slate-900 mb-3 text-lg flex items-center gap-2 ml-2">
    <DollarSign className="h-5 w-5" />
    Pricing:
  </h3>

  {/* FIX: Added padding-left with inline style to ensure bullet points move away from left edge */}
  <ul className="text-sm text-slate-800 space-y-2 font-medium list-none" style={{ paddingLeft: '2rem' }}>

    <li className="flex items-center gap-2">
      <span className="h-2 w-2 bg-black rounded-full shrink-0"></span>
      <span>
        Full Year Access: <strong className="font-black inline-flex items-center gap-1">
          <Price amountUSD={YEAR_PRICE} className="font-black" convertedClassName="text-xs" />
        </strong> per year
        <span className="ml-1 text-xs font-bold text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-400">
          Only <Price amountUSD={YEAR_PRICE / 12} className="font-bold" convertedClassName="text-[10px]" />/month
        </span>
      </span>
    </li>

    <li className="flex items-center gap-2">
      <span className="h-2 w-2 bg-black rounded-full shrink-0"></span>
      <span>
        Individual Subject: <strong className="font-black inline-flex items-center gap-1">
          <Price amountUSD={SUBJECT_PRICE} className="font-black" convertedClassName="text-xs" />
        </strong> per subject
        <span className="ml-1 text-xs font-bold text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-400">
          Just <Price amountUSD={SUBJECT_PRICE / 12} className="font-bold" convertedClassName="text-[10px]" />/month
        </span>
      </span>
    </li>

    <li className="flex items-center gap-2">
      <span className="h-2 w-2 bg-black rounded-full shrink-0"></span>
      <span>
        Mix and match from different years!
      </span>
    </li>

  </ul>
</div>

                  {years.map((year) => {
                    const isYearSelected = selectedYears.has(year.id);
                    const selectedSubjectsInYear = year.subjects.filter(s =>
                      selectedSubjects.has(s.id)
                    ).length;

                    return (
                      <Card
                        key={year.id}
                        className={`border-2 border-black transition-all ${
                          isYearSelected
                            ? 'bg-green-100 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.8)]'
                            : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                        }`}
                      >
                        <CardContent className="p-6">
                          {/* Full Year Option */}
                          <div className="flex items-start gap-4 mb-4 relative">
                            <Checkbox
                              id={`year-${year.id}`}
                              checked={isYearSelected}
                              onCheckedChange={() => toggleYear(year.id)}
                              className="mt-1 h-5 w-5 border-2 border-black data-[state=checked]:bg-white data-[state=checked]:border-black data-[state=checked]:text-blue-600"
                            />
                            <div className="flex-1">
                              <label htmlFor={`year-${year.id}`} className="cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center border-2 border-black">
                                      <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="font-black text-lg flex items-center gap-2">
                                        {year.title} - Full Year
                                        {isYearSelected && (
                                          <CheckCircle2 className="h-6 w-6 text-green-600 fill-green-100" />
                                        )}
                                      </h3>
                                      <Badge className="bg-green-600 text-blue-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold mt-1">Best Value</Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Price
                                      amountUSD={YEAR_PRICE}
                                      className="text-2xl font-black text-green-600"
                                      convertedClassName="text-xs text-slate-600"
                                    />
                                    {year.subjects.length > 0 && (
                                      <div className="text-xs text-slate-600 font-bold mt-1">
                                        Save <Price amountUSD={year.subjects.length * SUBJECT_PRICE - YEAR_PRICE} className="font-bold" convertedClassName="text-[10px]" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-2 font-medium">
                                  Access all {year.subjects.length} subjects in {year.title}
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* Individual Subjects */}
                          {year.subjects.length > 0 && (
                            <>
                              <Separator className="my-4 bg-black h-0.5" />
                              <div className="space-y-3">
                                <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Or select individual subjects ({selectedSubjectsInYear}/{year.subjects.length} selected)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {year.subjects.map((subject) => {
                                    const isSubjectSelected = selectedSubjects.has(subject.id);
                                    return (
                                      <div
                                        key={subject.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 border-black transition-all ${
                                          isSubjectSelected
                                            ? 'bg-blue-100 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]'
                                            : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                        }`}
                                      >
                                        <Checkbox
                                          id={`subject-${subject.id}`}
                                          checked={isSubjectSelected}
                                          onCheckedChange={() => toggleSubject(year.id, subject.id)}
                                          className="h-4 w-4 border-2 border-black data-[state=checked]:bg-white data-[state=checked]:border-black data-[state=checked]:text-blue-600"
                                        />
                                        <label
                                          htmlFor={`subject-${subject.id}`}
                                          className="flex-1 cursor-pointer flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-bold flex items-center gap-1">
                                              {subject.title}
                                              {isSubjectSelected && (
                                                <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-100" />
                                              )}
                                            </span>
                                          </div>
                                          <Price
                                            amountUSD={SUBJECT_PRICE}
                                            className="text-sm font-black text-blue-600"
                                            convertedClassName="text-xs text-slate-600"
                                          />
                                        </label>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === "payment" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardContent className="p-6">
                  <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    {selectedYears.size > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-black">
                        <p className="font-black text-green-900 mb-2">Full Years ({selectedYears.size}):</p>
                        <ul className="text-sm text-green-800 ml-4 space-y-2 font-medium">
                          {Array.from(selectedYears).map(yearId => {
                            const year = years.find(y => y.id === yearId);
                            return <li key={yearId}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 bg-green-600 rounded-full"></span>
                                  <span>{year?.title}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-black"><Price amountUSD={YEAR_PRICE} className="font-black" convertedClassName="text-[10px]" />/year</div>
                                  <div className="text-xs text-green-600 font-bold">Just <Price amountUSD={YEAR_PRICE / 12} className="font-bold" convertedClassName="text-[10px]" />/month</div>
                                </div>
                              </div>
                            </li>;
                          })}
                        </ul>
                      </div>
                    )}
                    {selectedSubjects.size > 0 && selectedYears.size < years.length && (
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-black">
                        <p className="font-black text-blue-900 mb-2">Individual Subjects ({selectedSubjects.size - (selectedYears.size * (years[0]?.subjects.length || 0))}):</p>
                        <ul className="text-sm text-blue-800 ml-4 space-y-2 font-medium">
                          {Array.from(selectedSubjects).filter(subId => {
                            // Only show subjects that aren't part of a full year purchase
                            return !Array.from(selectedYears).some(yearId => {
                              const year = years.find(y => y.id === yearId);
                              return year?.subjects.some(s => s.id === subId);
                            });
                          }).map(subId => {
                            const subject = years.flatMap(y => y.subjects).find(s => s.id === subId);
                            return subject ? <li key={subId}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
                                  <span>{subject.title}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-black"><Price amountUSD={SUBJECT_PRICE} className="font-black" convertedClassName="text-[10px]" />/year</div>
                                  <div className="text-xs text-blue-600 font-bold">Just <Price amountUSD={SUBJECT_PRICE / 12} className="font-bold" convertedClassName="text-[10px]" />/month</div>
                                </div>
                              </div>
                            </li> : null;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Separator className="my-4 bg-black h-0.5" />
                  <div className="bg-yellow-300 p-4 rounded-lg border-2 border-black">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-xl">Total:</span>
                      <div className="text-right">
                        <Price
                          amountUSD={totalPrice}
                          className="text-3xl font-black text-black"
                          convertedClassName="text-xs"
                        />
                        <div className="text-sm font-bold text-yellow-900 mt-1">
                          Only ${(totalPrice / 12).toFixed(2)}/month
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-400 -mx-4 -mb-4 mt-3 px-4 py-2 rounded-b-md border-t-2 border-black">
                      <p className="text-xs font-bold text-yellow-900 text-center">
                        💡 Pay once, access for the full year - Best value!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardContent className="p-6">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </h3>
                  <div className="bg-green-400 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                    <p className="text-black text-sm font-black mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      Secure Payment via Razorpay
                    </p>
                    <p className="text-black text-xs font-bold">
                      Click "Pay" below to complete your purchase using Razorpay's secure checkout. You can pay with credit/debit cards, UPI, net banking, and wallets.
                    </p>
                  </div>
                  <div className="bg-yellow-300 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-black text-xs font-bold flex items-center gap-2">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>Prices shown in local currency are estimates. All payments are processed in USD at current exchange rates.</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === "success" && (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500 p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle2 className="h-20 w-20 text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-3xl font-black">Payment Successful!</h3>
              <p className="text-slate-700 font-medium text-lg">
                You now have access to your selected content
              </p>
              <div className="bg-gradient-to-br from-green-100 to-yellow-100 border-2 border-black rounded-xl p-6 text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
                <p className="font-black text-slate-900 mb-3 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  What's included:
                </p>
                <ul className="text-sm text-slate-800 space-y-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                    {selectedYears.size} Full Year{selectedYears.size !== 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                    {selectedSubjects.size} Total Subject{selectedSubjects.size !== 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                    Unlimited Access
                  </li>
                </ul>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className={`border-t-2 border-black ${isMobile ? 'p-4' : 'p-6'} bg-[#fffdf5]`}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
            {step === "selection" && (
              <Button
                variant="outline"
                onClick={() => setStep("degree")}
                className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold ${isMobile ? 'w-full h-12' : ''}`}
              >
                Back to Degrees
              </Button>
            )}
            {step === "payment" && (
              <Button
                variant="outline"
                onClick={() => setStep("selection")}
                className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold ${isMobile ? 'w-full h-12' : ''}`}
              >
                Back to Selection
              </Button>
            )}

            <div className={`flex gap-3 ${isMobile ? 'w-full flex-col' : 'ml-auto'}`}>
              {step !== "success" && (
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold ${isMobile ? 'w-full h-12' : ''}`}
                >
                  Cancel
                </Button>
              )}

              {step === "selection" && (
                <Button
                  onClick={() => setStep("payment")}
                  disabled={!canProceed}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] font-bold disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'w-full h-12' : ''}`}
                >
                  Continue to Payment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {step === "payment" && (
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className={`bg-green-600 text-black hover:bg-green-700 hover:text-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] font-bold disabled:opacity-50 ${isMobile ? 'w-full h-12' : ''}`}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ${totalPrice}
                    </>
                  )}
                </Button>
              )}

              {step === "success" && (
                <Button
                  onClick={handleClose}
                  className="bg-yellow-400 text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-300 font-black text-lg px-8"
                >
                  Start Learning
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
