import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subMonths, startOfMonth } from "date-fns";
import { arSA } from "date-fns/locale";
import { Loader2 } from "lucide-react";

const DashboardChart = () => {
  const chartData = useLiveQuery(async () => {
    const data: { [key: string]: { name: string; sales: number; purchases: number } } = {};
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, "yyyy-MM");
      const monthName = format(date, "MMM yyyy", { locale: arSA });
      data[monthKey] = { name: monthName, sales: 0, purchases: 0 };
    }

    const salesInvoices = await db.saleInvoices
      .where("invoiceDate")
      .aboveOrEqual(sixMonthsAgo)
      .toArray();

    const purchaseInvoices = await db.purchaseInvoices
      .where("invoiceDate")
      .aboveOrEqual(sixMonthsAgo)
      .toArray();

    salesInvoices.forEach(inv => {
      const monthKey = format(inv.invoiceDate, "yyyy-MM");
      if (data[monthKey]) {
        data[monthKey].sales += inv.total;
      }
    });

    purchaseInvoices.forEach(inv => {
      const monthKey = format(inv.invoiceDate, "yyyy-MM");
      if (data[monthKey]) {
        data[monthKey].purchases += inv.total;
      }
    });

    return Object.values(data).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [value.toFixed(2) + ' ر.س', '']}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Legend />
        <Bar dataKey="sales" name="المبيعات" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="purchases" name="المشتريات" fill="#dc2626" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DashboardChart;