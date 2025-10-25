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

const Purchases = () => {
  const purchasesData = useLiveQuery(async () => {
    const invoices = await db.purchaseInvoices.orderBy("invoiceDate").reverse().toArray();
    const suppliers = await db.suppliers.toArray();
    const suppliersMap = new Map(suppliers.map((s) => [s.id, s.name]));

    return invoices.map((invoice) => ({
      ...invoice,
      supplierName: suppliersMap.get(invoice.supplierId) || "مورد محذوف",
    }));
  }, []);

  const handleDeleteInvoice = async (invoiceId: number | undefined) => {
    if (!invoiceId) return;
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟ سيتم تحديث رصيد المورد.")) {
      try {
        await db.transaction("rw", db.purchaseInvoices, db.purchaseInvoiceItems, db.suppliers, async () => {
          const invoiceToDelete = await db.purchaseInvoices.get(invoiceId);
          if (!invoiceToDelete) {
            throw new Error("Invoice not found");
          }

          await db.suppliers.update(invoiceToDelete.supplierId, {
            balance: db.suppliers.get(invoiceToDelete.supplierId).then(s => (s?.balance || 0) - invoiceToDelete.total)
          });

          await db.purchaseInvoiceItems.where({ invoiceId: invoiceId }).delete();
          await db.purchaseInvoices.delete(invoiceId);
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
        <h1 className="text-2xl font-bold">المشتريات</h1>
        <Button asChild size="sm" className="h-8 gap-1">
          <Link to="/purchases/new">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              فاتورة جديدة
            </span>
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>فواتير المشتريات</CardTitle>
          <CardDescription>
            إدارة فواتير المشتريات الخاصة بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجمالي (ر.س)</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchasesData ? (
                purchasesData.length > 0 ? (
                  purchasesData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link to={`/purchases/${invoice.id}`} className="hover:underline">
                          PUR-{invoice.id?.toString().padStart(3, "0")}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.supplierName}</TableCell>
                      <TableCell>
                        {format(invoice.invoiceDate, "PPP", { locale: arSA })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "مدفوعة"
                              ? "default"
                              : "secondary"
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
                            <DropdownMenuItem asChild>
                              <Link to={`/purchases/${invoice.id}`}>عرض</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/purchases/${invoice.id}/edit`}>تعديل</Link>
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
    </div>
  );
};

export default Purchases;