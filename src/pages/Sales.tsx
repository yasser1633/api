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

const Sales = () => {
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
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟ سيتم تحديث رصيد العميل.")) {
      try {
        await db.transaction("rw", db.saleInvoices, db.saleInvoiceItems, db.customers, async () => {
          const invoiceToDelete = await db.saleInvoices.get(invoiceId);
          if (!invoiceToDelete) {
            throw new Error("Invoice not found");
          }

          // 1. Revert customer balance (Decrease what they owe us)
          await db.customers.update(invoiceToDelete.customerId, {
            balance: db.customers.get(invoiceToDelete.customerId).then(c => (c?.balance || 0) - invoiceToDelete.total)
          });

          // 2. Delete invoice items
          await db.saleInvoiceItems.where({ invoiceId: invoiceId }).delete();

          // 3. Delete invoice
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
                        INV-{invoice.id?.toString().padStart(3, "0")}
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        {format(invoice.invoiceDate, "PPP", { locale: arSA })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "مدفوعة"
                              ? "default"
                              : invoice.status === "غير مدفوعة"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            invoice.status === "مدفوعة"
                              ? "bg-green-600 text-white hover:bg-green-700"
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
                            <DropdownMenuItem>عرض</DropdownMenuItem>
                            <DropdownMenuItem>تعديل</DropdownMenuItem>
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
    </div>
  );
};

export default Sales;