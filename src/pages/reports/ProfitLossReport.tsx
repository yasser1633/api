import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Loader2, Printer, TrendingUp, TrendingDown, Scale } from "lucide-react";

const ProfitLossReport = () => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of the year
    to: new Date(),
  });

  const reportData = useLiveQuery(async () => {
    if (!dateRange?.from) return null;

    const from = dateRange.from;
    const to = dateRange.to ? addDays(dateRange.to, 1) : addDays(from, 1);

    const salesInvoices = await db.saleInvoices
      .where("invoiceDate")
      .between(from, to, true, true)
      .toArray();
    
    const purchaseInvoices = await db.purchaseInvoices
      .where("invoiceDate")
      .between(from, to, true, true)
      .toArray();

    const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const netProfit = totalSales - totalPurchases;

    return { totalSales, totalPurchases, netProfit };
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print-hidden">
        <h1 className="text-2xl font-bold">تقرير الأرباح والخسائر</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ملخص الأرباح والخسائر</CardTitle>
          <CardDescription>
            الفترة من {dateRange?.from ? format(dateRange.from, "PPP", { locale: arSA }) : "-"} إلى {dateRange?.to ? format(dateRange.to, "PPP", { locale: arSA }) : "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportData ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإيرادات (المبيعات)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalSales.toFixed(2)} ر.س</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي التكاليف (المشتريات)</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalPurchases.toFixed(2)} ر.س</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">صافي الربح / الخسارة</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.netProfit.toFixed(2)} ر.س
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;