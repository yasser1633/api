import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Edit, Loader2, Printer } from "lucide-react";

const SaleInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = parseInt(id || "0");

  const invoiceData = useLiveQuery(async () => {
    if (!invoiceId) return null;

    const invoice = await db.saleInvoices.get(invoiceId);
    if (!invoice) return null;

    const customer = await db.customers.get(invoice.customerId);
    const items = await db.saleInvoiceItems.where({ invoiceId }).toArray();

    return { invoice, customer, items };
  }, [invoiceId]);
  
  const settings = useLiveQuery(() => db.appSettings.get(1));

  if (!invoiceData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { invoice, customer, items } = invoiceData;
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = invoice.total - subtotal;
  const amountDue = invoice.total - invoice.paidAmount;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 print-hidden">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">رجوع</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          فاتورة INV-{invoice.id?.toString().padStart(3, "0")}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">طباعة</span>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link to={`/sales/${invoice.id}/edit`}>
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">تعديل</span>
            </Link>
          </Button>
        </div>
      </div>
      <div id="printable">
        {settings && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold">{settings.companyName}</h2>
            <p className="text-muted-foreground">{settings.companyAddress}</p>
            <p className="text-muted-foreground">الرقم الضريبي: {settings.taxNumber}</p>
          </div>
        )}
        <Card className="printable-card">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                فاتورة INV-{invoice.id?.toString().padStart(3, "0")}
              </CardTitle>
              <CardDescription>
                تاريخ الفاتورة: {format(invoice.invoiceDate, "PPP", { locale: arSA })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-3">
              <div className="font-semibold">تفاصيل العميل</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">العميل</span>
                  <span>{customer?.name || "عميل محذوف"}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">البريد الإلكتروني</span>
                  <span>{customer?.email}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">رقم الجوال</span>
                  <span>{customer?.phone}</span>
                </li>
              </ul>
            </div>
            <Separator className="my-4" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-right">سعر الوحدة</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
            <div className="w-full text-sm text-muted-foreground">
              <div className="flex justify-end gap-4">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة (١٥٪):</span>
                    <span>{tax.toFixed(2)} ر.س</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>الإجمالي:</span>
                    <span>{invoice.total.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المدفوع:</span>
                    <span>{invoice.paidAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>المتبقي:</span>
                    <span>{amountDue.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SaleInvoiceDetail;