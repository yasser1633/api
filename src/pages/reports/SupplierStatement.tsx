import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Printer } from "lucide-react";

interface ReportTransaction {
  date: Date;
  type: string;
  details: string;
  debit: number;  // Payment to supplier (decreases our liability)
  credit: number; // Purchase invoice (increases our liability)
  balance: number;
}

const SupplierStatement = () => {
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<string | undefined>();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const suppliers = useLiveQuery(() => db.suppliers.toArray());

  const reportData = useLiveQuery(async () => {
    if (!selectedSupplierId || !dateRange?.from) return null;

    const supplierId = parseInt(selectedSupplierId);
    const from = startOfDay(dateRange.from);
    const to = dateRange.to ? startOfDay(addDays(dateRange.to, 1)) : startOfDay(addDays(from, 1));

    // 1. Calculate Opening Balance
    const invoicesBefore = await db.purchaseInvoices.where("supplierId").equals(supplierId).and(i => i.invoiceDate < from).toArray();
    const paymentsBefore = await db.cashTransactions.where({ partyType: 'supplier', partyId: supplierId }).and(t => t.date < from).toArray();
    const totalPurchasedBefore = invoicesBefore.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaidBefore = paymentsBefore.reduce((sum, t) => sum + t.amount, 0);
    let runningBalance = totalPurchasedBefore - totalPaidBefore;
    const openingBalance = runningBalance;

    // 2. Get Transactions within the date range
    const invoicesInPeriod = await db.purchaseInvoices.where("supplierId").equals(supplierId).and(i => i.invoiceDate >= from && i.invoiceDate < to).toArray();
    const paymentsInPeriod = await db.cashTransactions.where({ partyType: 'supplier', partyId: supplierId }).and(t => t.date >= from && t.date < to).toArray();

    const combined = [
      ...invoicesInPeriod.map(inv => ({ date: inv.invoiceDate, type: 'invoice', obj: inv })),
      ...paymentsInPeriod.map(p => ({ date: p.date, type: 'payment', obj: p }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // 3. Process transactions and calculate running balance
    const transactions: ReportTransaction[] = [];
    for (const item of combined) {
      if (item.type === 'invoice') {
        const inv = item.obj as any;
        runningBalance += inv.total;
        transactions.push({
          date: inv.invoiceDate,
          type: "فاتورة مشتريات",
          details: `PUR-${inv.id.toString().padStart(3, '0')}`,
          debit: 0,
          credit: inv.total,
          balance: runningBalance,
        });
      } else {
        const payment = item.obj as any;
        runningBalance -= payment.amount;
        transactions.push({
          date: payment.date,
          type: "دفعة",
          details: payment.description,
          debit: payment.amount,
          credit: 0,
          balance: runningBalance,
        });
      }
    }
    
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);

    return { openingBalance, transactions, closingBalance: runningBalance, totalDebit, totalCredit };
  }, [selectedSupplierId, dateRange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 print-hidden">
        <h1 className="text-2xl font-bold">كشف حساب مورد</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Select onValueChange={setSelectedSupplierId} value={selectedSupplierId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="اختر موردًا" />
            </SelectTrigger>
            <SelectContent>
              {suppliers?.map(s => <SelectItem key={s.id} value={s.id!.toString()}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Button size="sm" variant="outline" onClick={() => window.print()} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>كشف حساب {suppliers?.find(s => s.id === parseInt(selectedSupplierId || '0'))?.name || ''}</CardTitle>
          <CardDescription>
            الفترة من {dateRange?.from ? format(dateRange.from, "PPP", { locale: arSA }) : "-"} إلى {dateRange?.to ? format(dateRange.to, "PPP", { locale: arSA }) : "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedSupplierId ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">الرجاء اختيار مورد لعرض كشف الحساب.</div>
          ) : reportData ? (
            <>
              <div className="grid gap-4 md:grid-cols-4 mb-4 text-center">
                  <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">الرصيد الافتتاحي</div>
                      <div className="text-xl font-bold">{reportData.openingBalance.toFixed(2)} ر.س</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">إجمالي الدفعات (مدين)</div>
                      <div className="text-xl font-bold text-green-600">{reportData.totalDebit.toFixed(2)} ر.س</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">إجمالي الفواتير (دائن)</div>
                      <div className="text-xl font-bold text-red-600">{reportData.totalCredit.toFixed(2)} ر.س</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">الرصيد الختامي</div>
                      <div className="text-xl font-bold">{reportData.closingBalance.toFixed(2)} ر.س</div>
                  </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التفاصيل</TableHead>
                    <TableHead className="text-left">مدين (له)</TableHead>
                    <TableHead className="text-left">دائن (عليه)</TableHead>
                    <TableHead className="text-left">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.transactions.length > 0 ? (
                    reportData.transactions.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(tx.date, "P", { locale: arSA })}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>{tx.details}</TableCell>
                        <TableCell className="text-left font-mono text-green-600">{tx.debit > 0 ? tx.debit.toFixed(2) : '-'}</TableCell>
                        <TableCell className="text-left font-mono text-red-600">{tx.credit > 0 ? tx.credit.toFixed(2) : '-'}</TableCell>
                        <TableCell className="text-left font-mono">{tx.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">لا توجد حركات لهذا المورد في الفترة المحددة.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
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

export default SupplierStatement;