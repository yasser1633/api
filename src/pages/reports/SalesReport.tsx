import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Loader2, Printer } from "lucide-react";

const SalesReport = () => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const salesData = useLiveQuery(async () => {
    if (!dateRange?.from) return { invoices: [], total: 0 };

    const from = dateRange.from;
    const to = dateRange.to ? addDays(dateRange.to, 1) : addDays(from, 1);

    const invoices = await db.saleInvoices
      .where("invoiceDate")
      .between(from, to, true, true)
      .reverse()
      .toArray();
      
    const customers = await db.customers.toArray();
    const customersMap = new Map(customers.map((c) => [c.id, c.name]));

    const detailedInvoices = invoices.map(invoice => ({
      ...invoice,
      customerName: customersMap.get(invoice.customerId) || "عميل محذوف",
    }));

    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);

    return { invoices: detailedInvoices, total };
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print-hidden">
        <h1 className="text-2xl font-bold">تقرير المبيعات</h1>
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
          <CardTitle>ملخص المبيعات</CardTitle>
          <CardDescription>
            الفترة من {dateRange?.from ? format(dateRange.from, "PPP", { locale: arSA }) : "-"} إلى {dateRange?.to ? format(dateRange.to, "PPP", { locale: arSA }) : "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>إجمالي المبيعات</CardDescription>
                <CardTitle className="text-3xl">{salesData?.total.toFixed(2) || "0.00"} ر.س</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>عدد الفواتير</CardDescription>
                <CardTitle className="text-3xl">{salesData?.invoices.length || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجمالي (ر.س)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData ? (
                salesData.invoices.length > 0 ? (
                  salesData.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>INV-{invoice.id?.toString().padStart(3, "0")}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{format(invoice.invoiceDate, "PPP", { locale: arSA })}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
                      <TableCell className="text-left font-mono">{invoice.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا توجد فواتير في هذا النطاق الزمني.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReport;