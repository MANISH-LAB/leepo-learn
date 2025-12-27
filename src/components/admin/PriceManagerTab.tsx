import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import * as db from "../../utils/supabase/database";
import { toast } from "sonner";
import { Node } from "../../utils/sharedData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DollarSign, Tag, Percent, Plus, Trash2, Save, Loader2, Settings } from "lucide-react";
import { supabase } from "../../utils/supabase/client";

interface PriceManagerTabProps {
  courseData: Node[];
}

interface PricingConfig {
  id: string;
  config_key: string;
  config_value: number;
  description: string;
  currency: string;
}

export function PriceManagerTab({ courseData }: PriceManagerTabProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [price, setPrice] = useState("99.00");
  const [currency, setCurrency] = useState("USD");

  // Global pricing config
  const [pricingConfig, setPricingConfig] = useState<PricingConfig[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [subjectPrice, setSubjectPrice] = useState("5");
  const [yearPrice, setYearPrice] = useState("30");

  // Extract all YEAR nodes from course data
  const getYearNodes = (nodes: Node[]): Node[] => {
    let years: Node[] = [];
    nodes.forEach(node => {
      if (node.type === "YEAR") {
        years.push(node);
      }
      if (node.children) {
        years = years.concat(getYearNodes(node.children));
      }
    });
    return years;
  };

  const yearNodes = getYearNodes(courseData);

  // Load global pricing config
  useEffect(() => {
    async function loadPricingConfig() {
      setIsLoadingConfig(true);
      try {
        const { data, error } = await supabase
          .from('pricing_config')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        if (data) {
          setPricingConfig(data);
          const subjectPriceConfig = data.find(c => c.config_key === 'subject_price');
          const yearPriceConfig = data.find(c => c.config_key === 'year_price');

          if (subjectPriceConfig) setSubjectPrice(subjectPriceConfig.config_value.toString());
          if (yearPriceConfig) setYearPrice(yearPriceConfig.config_value.toString());
        }
      } catch (error) {
        console.error('Error loading pricing config:', error);
        toast.error('Failed to load pricing configuration');
      } finally {
        setIsLoadingConfig(false);
      }
    }

    loadPricingConfig();
  }, []);

  // Load pricing data on mount
  useEffect(() => {
    async function loadPricing() {
      const pricingData = await Promise.all(
        yearNodes.map(async (year) => {
          const pricing = await db.getPricing(year.id);
          return {
            id: year.id,
            year: year.title,
            price: pricing.price,
            currency: pricing.currency,
            active: true,
          };
        })
      );
      setPlans(pricingData);
    }

    if (yearNodes.length > 0) {
      loadPricing();
    }
  }, [courseData]);

  const [discounts, setDiscounts] = useState([
    { id: 1, code: "EARLYBIRD", type: "percent", value: 15, uses: 45, status: "active" },
    { id: 2, code: "STUDENT100", type: "fixed", value: 100, uses: 12, status: "active" },
  ]);

  const handleUpdateGlobalPricing = async () => {
    setIsLoadingConfig(true);
    try {
      const subjectPriceValue = parseFloat(subjectPrice);
      const yearPriceValue = parseFloat(yearPrice);

      if (isNaN(subjectPriceValue) || subjectPriceValue <= 0) {
        throw new Error("Invalid subject price");
      }
      if (isNaN(yearPriceValue) || yearPriceValue <= 0) {
        throw new Error("Invalid year price");
      }

      // Update both pricing configs
      const { error: subjectError } = await supabase
        .from('pricing_config')
        .update({ config_value: subjectPriceValue })
        .eq('config_key', 'subject_price');

      if (subjectError) throw subjectError;

      const { error: yearError } = await supabase
        .from('pricing_config')
        .update({ config_value: yearPriceValue })
        .eq('config_key', 'year_price');

      if (yearError) throw yearError;

      toast.success("Global pricing updated successfully!");
    } catch (error: any) {
      console.error("Error updating global pricing:", error);
      toast.error(error.message || "Failed to update global pricing");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedYearId) {
      toast.error("Please select a year");
      return;
    }

    setIsLoading(true);
    try {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Invalid price");
      }

      const success = await db.updatePricing(selectedYearId, priceValue, currency);

      if (!success) {
        throw new Error("Failed to update pricing");
      }

      // Update local state
      setPlans(prev =>
        prev.map(p =>
          p.id === selectedYearId
            ? { ...p, price: priceValue, currency }
            : p
        )
      );

      toast.success("Pricing updated successfully");
    } catch (error: any) {
      console.error("Error updating price:", error);
      toast.error(error.message || "Failed to update pricing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Pricing Configuration */}
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
          <CardTitle className="flex items-center gap-2 font-black text-xl">
            <Settings className="h-6 w-6" />
            Global Pricing Configuration
          </CardTitle>
          <CardDescription className="font-medium">
            Set default prices for subjects and full year access (used in Payment Modal)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-bold">Individual Subject Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">$</span>
                <Input
                  className="pl-8 border-2 border-black font-bold text-lg"
                  placeholder="5.00"
                  value={subjectPrice}
                  onChange={(e) => setSubjectPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Price charged for each individual subject when not buying full year
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold">Full Year Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">$</span>
                <Input
                  className="pl-8 border-2 border-black font-bold text-lg"
                  placeholder="30.00"
                  value={yearPrice}
                  onChange={(e) => setYearPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Flat price for full year access (all subjects included)
              </p>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 border-2 border-black rounded-lg p-4">
            <h4 className="font-black text-sm mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Pricing Model:
            </h4>
            <ul className="text-sm space-y-1 text-slate-700 font-medium">
              <li>• Individual Subject: <strong className="text-blue-600">${subjectPrice}</strong> each</li>
              <li>• Full Year Access: <strong className="text-green-600">${yearPrice}</strong> (all subjects)</li>
              <li>• Students save money by purchasing full year</li>
            </ul>
          </div>

          <Button
            onClick={handleUpdateGlobalPricing}
            disabled={isLoadingConfig}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] font-bold"
          >
            {isLoadingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" /> Update Global Pricing
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing Configuration */}
        <div className="space-y-6">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tuition Pricing
            </CardTitle>
            <CardDescription>Manage annual and monthly costs for each course year.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
               <div className="space-y-2">
                 <Label>Select Year to Update</Label>
                 <Select value={selectedYearId} onValueChange={(value) => {
                   setSelectedYearId(value);
                   const plan = plans.find(p => p.id === value);
                   if (plan) {
                     setPrice(plan.price.toString());
                     setCurrency(plan.currency);
                   }
                 }}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Year" />
                   </SelectTrigger>
                   <SelectContent>
                     {yearNodes.map(year => (
                       <SelectItem key={year.id} value={year.id}>
                         {year.title}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <Separator />

               <div className="space-y-2">
                 <Label>Currency</Label>
                 <Select value={currency} onValueChange={setCurrency}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="USD">USD ($)</SelectItem>
                     <SelectItem value="EUR">EUR (€)</SelectItem>
                     <SelectItem value="GBP">GBP (£)</SelectItem>
                     <SelectItem value="INR">INR (₹)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label>Price</Label>
                 <div className="relative">
                   <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                     {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}
                   </span>
                   <Input
                     className="pl-9"
                     placeholder="0.00"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     type="number"
                     step="0.01"
                   />
                 </div>
               </div>

               <Button className="w-full" onClick={handleUpdatePrice} disabled={isLoading || !selectedYearId}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 <Save className="mr-2 h-4 w-4" /> Update Pricing
               </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Active Price Plans</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No pricing data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.year}</TableCell>
                        <TableCell>
                          {plan.currency === "USD" ? "$" : plan.currency === "EUR" ? "€" : plan.currency === "GBP" ? "£" : "₹"}
                          {plan.price}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={plan.active ? "default" : "secondary"} className="text-xs">
                            {plan.active ? "Active" : "Draft"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Management */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Discount Codes
            </CardTitle>
            <CardDescription>Create and manage promotional codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Input placeholder="New Code (e.g. SUMMER2024)" className="uppercase" />
              <Select defaultValue="percent">
                 <SelectTrigger className="w-[110px]">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="percent">% Off</SelectItem>
                    <SelectItem value="fixed">Flat Off</SelectItem>
                 </SelectContent>
              </Select>
              <Input placeholder="Value" className="w-[80px]" type="number" />
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-mono font-bold">{discount.code}</TableCell>
                    <TableCell>
                       <Badge variant="outline">
                         {discount.type === "percent" ? `${discount.value}%` : `$${discount.value}`}
                       </Badge>
                    </TableCell>
                    <TableCell>{discount.uses}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Global Settings */}
        <Card>
           <CardHeader>
              <CardTitle className="text-base">Payment Settings</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                    <Label className="text-base">Allow Installments</Label>
                    <p className="text-xs text-muted-foreground">Students can pay monthly</p>
                 </div>
                 <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                    <Label className="text-base">Tax Inclusive</Label>
                    <p className="text-xs text-muted-foreground">Prices include VAT/GST</p>
                 </div>
                 <Switch defaultChecked />
              </div>
           </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
