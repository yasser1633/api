import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/DatePicker";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

const EditSaleInvoice = () => {
  const { id } = useParams();
  const invoiceId = parseInt(id || "0");
  const navigate = useNavigate();
  
  const customers = useLiveQuery(() => db.customers.toArray());
  const invoiceData = useLiveQuery(async () => {
    if (!invoiceId) return null;
    const invoice = await db.saleInvoices.get(invoiceId);
    const items = await db.saleInvoiceItems.where({ invoiceId }).toArray();
    return { invoice, items };
  }, [invoiceId]);

  const [selectedCustomerId, setSelectedCustomerId] = React.useState<number | undefined>();
  const [items, setItems] = React.useState<InvoiceItem[]>([]);
  const [invoiceDate, setInvoiceDate] = React.useState<Date | undefined>();
  const [initialTotal, setInitialTotal] = React.useState(0);

  React.useEffect(() => {
    if (invoiceData?.invoice && invoiceData.items) {
      setSelectedCustomerId(invoiceData.invoice.customerId);
      setInvoiceDate(invoiceData.invoice.invoiceDate);
      setItems(invoiceData.items.map(i => ({...i, id: i.id || Date.now() + Math.random()})));
      setInitialTotal(invoiceData.invoice.total);
    }
  }, [invoiceData]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof Omit<InvoiceItem, "id">, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const subtotal = items.reduce((total, item) => total + item.quantity * item.price, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleUpdateInvoice = async () => {
    if (!selectedCustomerId || !invoiceId) {
      showError("بيانات الفاتورة غير مكتملة.");
      return;
    }
    if (!invoiceDate) {
      showError("الرجاء تحديد تاريخ الفاتورة.");
      return;
    }
    if (items.some((item) => !item.description.trim() || item.quantity <= 0)) {
      showError("الرجاء ملء جميع بنود الفاتورة بشكل صحيح.");
      return;
    }

    try {
      await db.transaction("rw", db.saleInvoices, db.saleInvoiceItems, db.customers, async () => {
        const balanceChange = total - initialTotal;

        await db.customers.update(selectedCustomerId, {
          balance: db.customers.get(selectedCustomerId).then(c => (c?.balance || 0) + balanceChange)
        });

        await db.saleInvoices.update(invoiceId, {
          customerId: selectedCustomerId,
          invoiceDate: invoiceDate,
          total: total,
          status: "غير مدفوعة", // Reset status on edit
        });

        await db.saleInvoiceItems.where({ invoiceId }).delete();
        const newInvoiceItems = items.map(({ id, ...rest }) => ({ ...rest, invoiceId }));
        await db.saleInvoiceItems.bulkAdd(newInvoiceItems);
      });

      showSuccess("تم تحديث الفاتورة بنجاح!");
      navigate(`/sales/${invoiceId}`);
    } catch (error) {
      console.error("Failed to update invoice:", error);
      showError("حدث خطأ أثناء تحديث الفاتورة.");
    }
  };

  if (!invoiceData) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">رجوع</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          تعديل فاتورة INV-{invoiceId.toString().padStart(3, "0")}
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={() => navigate(`/sales/${invoiceId}`)}>إلغاء</Button>
          <Button size="sm" onClick={handleUpdateInvoice}>حفظ التغييرات</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader><CardTitle>تفاصيل الفاتورة</CardTitle></CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="customer">العميل</Label>
                <Select value={selectedCustomerId?.toString()} onValueChange={(value) => setSelectedCustomerId(parseInt(value))}>
                  <SelectTrigger id="customer"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => <SelectItem key={c.id} value={c.id!.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="invoice-date">تاريخ الفاتورة</Label>
                <DatePicker date={invoiceDate} setDate={setInvoiceDate} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>بنود الفاتورة</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="w-[100px]">الكمية</TableHead>
                    <TableHead className="w-[120px] text-left">سعر الوحدة</TableHead>
                    <TableHead className="w-[120px] text-left">الإجمالي</TableHead>
                    <TableHead className="w-[50px]"><span className="sr-only">إزالة</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><Input value={item.description} onChange={(e) => handleItemChange(item.id, "description", e.target.value)} /></TableCell>
                      <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)} min="1" /></TableCell>
                      <TableCell><Input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)} className="text-left" min="0" /></TableCell>
                      <TableCell className="text-left">{(item.quantity * item.price).toFixed(2)}</TableCell>
                      <TableCell><Button size="icon" variant="ghost" onClick={() => handleRemoveItem(item.id)} disabled={items.length <= 1}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
              <Button size="sm" variant="ghost" className="gap-1" onClick={handleAddItem}><PlusCircle className="h-3.5 w-3.5" />إضافة بند جديد</Button>
            </CardFooter>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader><CardTitle>ملخص الفاتورة</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between"><span>المجموع الفرعي</span><span>{subtotal.toFixed(2)} ر.س</span></div>
              <div className="flex items-center justify-between"><span>الضريبة (١٥٪)</span><span>{tax.toFixed(2)} ر.س</span></div>
              <Separator />
              <div className="flex items-center justify-between font-semibold"><span>الإجمالي</span><span>{total.toFixed(2)} ر.س</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(`/sales/${invoiceId}`)}>إلغاء</Button>
        <Button size="sm" onClick={handleUpdateInvoice}>حفظ التغييرات</Button>
      </div>
    </div>
  );
};

export default EditSaleInvoice;