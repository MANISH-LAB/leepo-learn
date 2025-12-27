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
  DollarSign
} from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Node } from "../../utils/sharedData";
import * as db from "../../utils/supabase/database";
import { supabase } from "../../utils/supabase/client";

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
        const { data, error } = await supabase
          .from('pricing_config')
          .select('config_key, config_value')
          .eq('is_active', true);

        if (error) throw error;

        if (data) {
          const subjectPriceConfig = data.find(c => c.config_key === 'subject_price');
          const yearPriceConfig = data.find(c => c.config_key === 'year_price');

          if (subjectPriceConfig) setSubjectPrice(subjectPriceConfig.config_value);
          if (yearPriceConfig) setYearPrice(yearPriceConfig.config_value);
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
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
  const handlePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1500);
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden gap-0 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#fffdf5]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 border-b-2 border-black">
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
                <div className="text-3xl font-black">${totalPrice}</div>
                <div className="text-xs font-bold">Total</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
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
        Full Year Access: <strong className="font-black">${YEAR_PRICE}</strong> per year
      </span>
    </li>

    <li className="flex items-center gap-2">
      <span className="h-2 w-2 bg-black rounded-full shrink-0"></span>
      <span>
        Individual Subject: <strong className="font-black">${SUBJECT_PRICE}</strong> per subject
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
                                    <div className="text-2xl font-black text-green-600">${YEAR_PRICE}</div>
                                    {year.subjects.length > 0 && (
                                      <div className="text-xs text-slate-600 font-bold">
                                        Save ${year.subjects.length * SUBJECT_PRICE - YEAR_PRICE}
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
                                          <span className="text-sm font-black text-blue-600">${SUBJECT_PRICE}</span>
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
                        <ul className="text-sm text-green-800 ml-4 space-y-1 font-medium">
                          {Array.from(selectedYears).map(yearId => {
                            const year = years.find(y => y.id === yearId);
                            return <li key={yearId} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-green-600 rounded-full"></span>
                              {year?.title} - ${YEAR_PRICE}
                            </li>;
                          })}
                        </ul>
                      </div>
                    )}
                    {selectedSubjects.size > 0 && selectedYears.size < years.length && (
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-black">
                        <p className="font-black text-blue-900 mb-2">Individual Subjects ({selectedSubjects.size - (selectedYears.size * (years[0]?.subjects.length || 0))}):</p>
                        <ul className="text-sm text-blue-800 ml-4 space-y-1 font-medium">
                          {Array.from(selectedSubjects).filter(subId => {
                            // Only show subjects that aren't part of a full year purchase
                            return !Array.from(selectedYears).some(yearId => {
                              const year = years.find(y => y.id === yearId);
                              return year?.subjects.some(s => s.id === subId);
                            });
                          }).map(subId => {
                            const subject = years.flatMap(y => y.subjects).find(s => s.id === subId);
                            return subject ? <li key={subId} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
                              {subject.title} - ${SUBJECT_PRICE}
                            </li> : null;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Separator className="my-4 bg-black h-0.5" />
                  <div className="flex justify-between items-center bg-yellow-300 p-4 rounded-lg border-2 border-black">
                    <span className="font-black text-xl">Total:</span>
                    <span className="text-3xl font-black text-black">${totalPrice}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                <CardContent className="p-6">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-black">
                    <p className="text-slate-700 text-sm font-medium">
                      Payment integration coming soon. For now, this is a demo.
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
        <div className="border-t-2 border-black p-6 bg-[#fffdf5]">
          <div className="flex justify-between items-center">
            {step === "selection" && (
              <Button
                variant="outline"
                onClick={() => setStep("degree")}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold"
              >
                Back to Degrees
              </Button>
            )}
            {step === "payment" && (
              <Button
                variant="outline"
                onClick={() => setStep("selection")}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold"
              >
                Back to Selection
              </Button>
            )}

            <div className="flex gap-3 ml-auto">
              {step !== "success" && (
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold"
                >
                  Cancel
                </Button>
              )}

              {step === "selection" && (
                <Button
                  onClick={() => setStep("payment")}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {step === "payment" && (
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="bg-green-600 text-black hover:bg-green-700 hover:text-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] font-bold disabled:opacity-50"
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
