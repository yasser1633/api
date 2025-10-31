import * as React from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";

const Sales = () => {
  const [paymentInvoice, setPaymentInvoice] = React.useState(null);

  const salesData = useLiveQuery(async () => {
    const invoices = await db.saleInvoices.orderBy("invoiceDate").reverse().toArray();
    const customers = await db.customers.toArray();
    const customersMap = new Map(customers.map((c) => [c.id, c.name]));

    return invoices.map((invoice) => ({
      ...invoice,
      customerName: customersMap.get(invoice.customerId) || "عميل محذوف",
    }));
  }, []);

  const handleDeleteInvoice = async (invoiceId: number | undefined) => {
    if (!invoiceId) return;
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟ سيتم حذف جميع الدفعات المرتبطة وتحديث رصيد العميل وإرجاع الكميات للمخزون.")) {
      try {
        await db.transaction("rw", db.saleInvoices, db.saleInvoiceItems, db.customers, db.cashTransactions, db.items, async () => {
          const invoiceToDelete = await db.saleInvoices.get(invoiceId);
          if (!invoiceToDelete) {
            throw new Error("Invoice not found");
          }

          // Revert item stock quantities
          const itemsToRevert = await db.saleInvoiceItems.where({ invoiceId: invoiceId }).toArray();
          for (const item of itemsToRevert) {
            if (item.itemId) {
              await db.items.where({ id: item.itemId }).modify(i => {
                i.quantity += item.quantity;
              });
            }
          }

          // Revert customer balance
          const customer = await db.customers.get(invoiceToDelete.customerId);
          if (customer) {
            const outstandingAmount = invoiceToDelete.total - invoiceToDelete.paidAmount;
            const newBalance = customer.balance - outstandingAmount;
            await db.customers.update(invoiceToDelete.customerId, { balance: newBalance });
          }

          // Delete associated cash transactions
          await db.cashTransactions.where({ partyType: 'customer', partyId: invoiceToDelete.customerId })
            .and(item => item.description.includes(`INV-${invoiceToDelete.id?.toString().padStart(3, '0')}`))
            .delete();

          // Delete invoice items and the invoice itself
          await db.saleInvoiceItems.where({ invoiceId: invoiceId }).delete();
          await db.saleInvoices.delete(invoiceId);
        });
        showSuccess("تم حذف الفاتورة بنجاح.");
      } catch (error) {
        console.error("Failed to delete invoice:", error);
        showError("حدث خطأ أثناء حذف الفاتورة.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المبيعات</h1>
        <Button asChild size="sm" className="h-8 gap-1">
          <Link to="/sales/new">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              فاتورة جديدة
            </span>
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>فواتير المبيعات</CardTitle>
          <CardDescription>
            إدارة فواتير المبيعات الخاصة بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجمالي (ر.س)</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData ? (
                salesData.length > 0 ? (
                  salesData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link to={`/sales/${invoice.id}`} className="hover:underline">
                          INV-{invoice.id?.toString().padStart(3, "0")}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        {format(invoice.invoiceDate, "PPP", { locale: arSA })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                           className={
                            invoice.status === "مدفوعة"
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : invoice.status === "مدفوعة جزئياً"
                              ? "bg-yellow-400 text-black hover:bg-yellow-500"
                              : ""
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        {invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/sales/${invoice.id}`}>عرض</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/sales/${invoice.id}/edit`}>تعديل</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentInvoice(invoice)}
                              disabled={invoice.status === 'مدفوعة'}
                            >
                              تسجيل دفعة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      لا يوجد فواتير. ابدأ بإضافة فاتورة جديدة.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <RecordPaymentDialog 
        invoice={paymentInvoice}
        invoiceType="sale"
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
      />
    </div>
  );
};

export default Sales;