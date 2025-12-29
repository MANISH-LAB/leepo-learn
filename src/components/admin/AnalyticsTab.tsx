import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { StatsCard } from "./StatsCard";
import { Users, CreditCard, Activity, DollarSign, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { fetchAdminStats, fetchRecentPurchases, Purchase } from "../../utils/supabase/database";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type TimePeriod = '7days' | '1month' | '1year' | 'all';
type ChartType = 'bar' | 'line' | 'area';

export function AnalyticsTab() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalPurchases: 0,
    activeNow: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Purchase[]>([]);
  const [allPayments, setAllPayments] = useState<Purchase[]>([]);
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7days');
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);

        // Fetch stats, recent purchases (15 for table), and ALL purchases for chart
        const [statsData, recentData, allData] = await Promise.all([
          fetchAdminStats(),
          fetchRecentPurchases(15), // Fetch 15 for recent sales table
          fetchRecentPurchases(1000) // Fetch many for chart data
        ]);

        setStats(statsData);
        setRecentPayments(recentData);
        setAllPayments(allData);

        // Generate chart data based on time period
        const chartData = generateChartData(timePeriod, allData);
        setRevenueData(chartData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [timePeriod]);

  const generateChartData = (period: TimePeriod, payments: Purchase[]) => {
    const now = new Date();
    let dates: string[] = [];
    let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    switch (period) {
      case '7days':
        dates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });
        dateFormat = { month: 'short', day: 'numeric' };
        break;

      case '1month':
        dates = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });
        dateFormat = { month: 'short', day: 'numeric' };
        break;

      case '1year':
        // Show last 12 months
        dates = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        });
        dateFormat = { month: 'short', year: 'numeric' };
        break;

      case 'all':
        // Group by month from first payment to now
        if (payments.length === 0) return [];

        const firstPaymentDate = new Date(
          Math.min(...payments.map(p => new Date(p.purchased_at).getTime()))
        );
        const monthsDiff =
          (now.getFullYear() - firstPaymentDate.getFullYear()) * 12 +
          (now.getMonth() - firstPaymentDate.getMonth()) + 1;

        dates = Array.from({ length: monthsDiff }, (_, i) => {
          const date = new Date(firstPaymentDate);
          date.setMonth(firstPaymentDate.getMonth() + i);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        });
        dateFormat = { month: 'short', year: 'numeric' };
        break;
    }

    // Calculate revenue by date
    const revenueByDate: Record<string, number> = {};

    payments.forEach((payment: Purchase) => {
      if (payment.status !== 'success') return;

      const paymentDate = new Date(payment.purchased_at);
      let dateKey: string;

      if (period === '1year' || period === 'all') {
        // Group by month
        dateKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Group by day
        dateKey = paymentDate.toISOString().split('T')[0];
      }

      if (dates.includes(dateKey)) {
        revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + payment.amount;
      }
    });

    // Format chart data
    return dates.map(dateKey => {
      let displayDate: string;

      if (period === '1year' || period === 'all') {
        // Parse YYYY-MM format
        const [year, month] = dateKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        displayDate = date.toLocaleDateString('en-US', dateFormat);
      } else {
        // Parse YYYY-MM-DD format
        displayDate = new Date(dateKey).toLocaleDateString('en-US', dateFormat);
      }

      return {
        date: displayDate,
        revenue: revenueByDate[dateKey] || 0
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
    <div className="space-y-4">
      {/* Stats Row */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            description={`From ${stats.totalPurchases} purchases`}
            icon={DollarSign}
          />
          <StatsCard
            title="Total Users"
            value={`${stats.totalUsers}`}
            description="Registered students"
            icon={Users}
          />
          <StatsCard
            title="Course Purchases"
            value={`${stats.totalPurchases}`}
            description="Successful transactions"
            icon={CreditCard}
          />
          <StatsCard
            title="Active Now"
            value={`${stats.activeNow}`}
            description="Users online"
            icon={Activity}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Revenue Overview</CardTitle>
              <div className="flex items-center gap-3">
                {/* Chart Type Selector */}
                <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                  <SelectTrigger className="w-[140px]" size="sm">
                    <SelectValue placeholder="Chart Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>

                {/* Time Period Filters */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={timePeriod === '7days' ? 'default' : 'outline'}
                    onClick={() => setTimePeriod('7days')}
                  >
                    7 Days
                  </Button>
                  <Button
                    size="sm"
                    variant={timePeriod === '1month' ? 'default' : 'outline'}
                    onClick={() => setTimePeriod('1month')}
                  >
                    1 Month
                  </Button>
                  <Button
                    size="sm"
                    variant={timePeriod === '1year' ? 'default' : 'outline'}
                    onClick={() => setTimePeriod('1year')}
                  >
                    1 Year
                  </Button>
                  <Button
                    size="sm"
                    variant={timePeriod === 'all' ? 'default' : 'outline'}
                    onClick={() => setTimePeriod('all')}
                  >
                    All Time
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full min-h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : revenueData.length > 0 && revenueData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium">No revenue data yet</p>
                    <p className="text-sm mt-2">Complete your first sale to see analytics</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales Table */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales (Last 15)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent payments
              </div>
            ) : (
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.user_name || 'Unknown User'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.user_email || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.degree_title || payment.purchase_type || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
