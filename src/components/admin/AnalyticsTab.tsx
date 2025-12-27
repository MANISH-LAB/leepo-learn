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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { fetchAdminStats, fetchRecentPurchases, Purchase } from "../../utils/supabase/database";
import { Badge } from "../ui/badge";

export function AnalyticsTab() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalPurchases: 0,
    activeNow: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);

        // Fetch stats and recent purchases using direct fetch API
        const [statsData, purchasesData] = await Promise.all([
          fetchAdminStats(),
          fetchRecentPurchases(10)
        ]);

        setStats(statsData);
        setRecentPayments(purchasesData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full min-h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Revenue analytics coming soon</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No recent payments
                    </TableCell>
                  </TableRow>
                ) : (
                  recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.user_name || 'Unknown User'}
                        <div className="text-xs text-muted-foreground">
                          {formatDate(payment.purchased_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === "success" ? "default" : "destructive"}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
