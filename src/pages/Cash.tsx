import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import AddCashTransactionDialog from "@/components/AddCashTransactionDialog";

const Cash = () => {
  const transactions = useLiveQuery(() => 
    db.cashTransactions.orderBy("transactionDate").reverse().toArray()
  );

  const cashBalance = useLiveQuery(async () => {
    const allTransactions = await db.cashTransactions.toArray();
    return allTransactions.reduce((acc, t) => {
      return t.type === 'in' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الصندوق</h1>
        <AddCashTransactionDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الرصيد الحالي</CardTitle>
            <CardDescription>الرصيد النقدي المتوفر حالياً.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cashBalance?.toFixed(2) ?? '0.00'} ر.س
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>سجل الحركات</CardTitle>
          <CardDescription>قائمة بجميع حركات الصندوق.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الطرف</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-left">المبلغ (ر.س)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions ? (
                transactions.length > 0 ? (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(t.transactionDate, "PPP", { locale: arSA })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.type === 'in' ? 'default' : 'destructive'} className={t.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {t.type === 'in' ? <ArrowUpCircle className="ml-1 h-4 w-4" /> : <ArrowDownCircle className="ml-1 h-4 w-4" />}
                          {t.type === 'in' ? 'قبض' : 'صرف'}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.partyName}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className={`text-left font-semibold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا توجد حركات. ابدأ بإضافة حركة جديدة.
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

export default Cash;