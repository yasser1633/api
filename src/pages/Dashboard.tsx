import { useLiveQuery } from "dexie-react-hooks";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { arSA } from "date-fns/locale";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DollarSign, Users, Truck, Wallet, Loader2 } from "lucide-react";

const Dashboard = () => {
  const data = useLiveQuery(async () => {
    const saleInvoices = await db.saleInvoices.toArray();
    const customers = await db.customers.toArray();
    const suppliers = await db.suppliers.toArray();
    const cashTransactions = await db.cashTransactions.toArray();

    const totalRevenue = saleInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalReceivables = customers
      .filter((c) => c.balance > 0)
      .reduce((sum, c) => sum + c.balance, 0);
    const totalPayables = suppliers
      .filter((s) => s.balance > 0)
      .reduce((sum, s) => sum + s.balance, 0);
    const cashBalance = cashTransactions.reduce((acc, t) => {
      return t.type === "in" ? acc + t.amount : acc - t.amount;
    }, 0);

    // Chart data for the last 6 months
    const monthlySales = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const total = saleInvoices
        .filter(inv => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd)
        .reduce((sum, inv) => sum + inv.total, 0);

      return {
        name: format(date, "MMM", { locale: arSA }),
        total: total,
      };
    }).reverse();

    return {
      totalRevenue,
      totalReceivables,
      totalPayables,
      cashBalance,
      monthlySales,
    };
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">لوحة التحكم</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الإيرادات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalRevenue.toFixed(2)} ر.س
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المستحقات على العملاء
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalReceivables.toFixed(2)} ر.س
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المستحقات للموردين
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalPayables.toFixed(2)} ر.س
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رصيد الصندوق</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.cashBalance.toFixed(2)} ر.س
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>نظرة عامة على المبيعات</CardTitle>
            <CardDescription>
              إجمالي المبيعات خلال آخر ٦ أشهر.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlySales}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000} ألف`}
                  />
                   <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent 
                      formatter={(value) => `${Number(value).toFixed(2)} ر.س`}
                    />}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;