import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, DollarSign, Loader2, PlusCircle, Trash2 } from "lucide-react";
import CashTransactionDialog from "@/components/CashTransactionDialog";
import { showError, showSuccess } from "@/utils/toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


const Cash = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<'in' | 'out'>('in');

  const transactions = useLiveQuery(() => 
    db.cashTransactions.orderBy("date").reverse().toArray()
  , []);

  const balance = useLiveQuery(async () => {
    const allTransactions = await db.cashTransactions.toArray();
    const totalIn = allTransactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = allTransactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalIn - totalOut;
  }, []);

  const handleOpenDialog = (type: 'in' | 'out') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: number | undefined, hasParty: boolean) => {
    if (!transactionId) return;
    if (hasParty) {
      showError("لا يمكن حذف معاملة مرتبطة بفاتورة من هذه الصفحة.");
      return;
    }
    if (confirm("هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await db.cashTransactions.delete(transactionId);
        showSuccess("تم حذف المعاملة بنجاح.");
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        showError("حدث خطأ أثناء حذف المعاملة.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رصيد الخزينة الحالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance !== undefined ? `${balance.toFixed(2)} ر.س` : <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
            <p className="text-xs text-muted-foreground">
              الرصيد الفعلي في الخزينة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">حركة الخزينة</h1>
        <div className="flex gap-2">
          <Button size="sm" className="h-8 gap-1" variant="outline" onClick={() => handleOpenDialog('out')}>
            <ArrowUp className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              سحب جديد
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenDialog('in')}>
            <ArrowDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              إيداع جديد
            </span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
          <CardDescription>
            جميع المعاملات النقدية الواردة والصادرة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-left">المبلغ (ر.س)</TableHead>
                <TableHead><span className="sr-only">إجراءات</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions ? (
                transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(tx.date, "PPP", { locale: arSA })}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'in' ? 'default' : 'destructive'} className={tx.type === 'in' ? 'bg-green-600 hover:bg-green-700' : ''}>
                          {tx.type === 'in' ? 'وارد' : 'صادر'}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className={`text-left font-mono ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {!tx.partyId && (
                           <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTransaction(tx.id, !!tx.partyId)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">حذف</span>
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا توجد معاملات.
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

      <CashTransactionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
      />
    </div>
  );
};

export default Cash;