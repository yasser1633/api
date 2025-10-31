import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, PlusCircle, Trash2 } from "lucide-react";
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
import { DatePicker } from "@/components/ui/DatePicker";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

const NewSaleInvoice = () => {
  const navigate = useNavigate();
  const customers = useLiveQuery(() => db.customers.toArray());

  const [selectedCustomerId, setSelectedCustomerId] = React.useState<
    number | undefined
  >();
  const [items, setItems] = React.useState<InvoiceItem[]>([
    { id: 1, description: "", quantity: 1, price: 0 },
  ]);
  const [invoiceDate, setInvoiceDate] = React.useState<Date | undefined>(
    new Date()
  );

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: "", quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: number,
    field: keyof Omit<InvoiceItem, "id">,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.15; // ضريبة القيمة المضافة ١٥٪
  const total = subtotal + tax;

  const handleSaveInvoice = async () => {
    if (!selectedCustomerId) {
      showError("الرجاء اختيار عميل.");
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
      await db.transaction(
        "rw",
        db.saleInvoices,
        db.saleInvoiceItems,
        db.customers,
        async () => {
          // 1. Add SaleInvoice
          const invoiceId = await db.saleInvoices.add({
            customerId: selectedCustomerId,
            invoiceDate: invoiceDate,
            total: total,
            status: "غير مدفوعة",
            paidAmount: 0,
          });

          // 2. Add SaleInvoiceItems
          const invoiceItems = items.map((item) => ({
            invoiceId: invoiceId,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          }));
          await db.saleInvoiceItems.bulkAdd(invoiceItems);

          // 3. Update customer balance (Increase what they owe us)
          const customer = await db.customers.get(selectedCustomerId);
          if (customer) {
            const newBalance = (customer.balance || 0) + total;
            await db.customers.update(selectedCustomerId, { balance: newBalance });
          }
        }
      );

      showSuccess("تم حفظ الفاتورة بنجاح!");
      navigate("/sales");
    } catch (error) {
      console.error("Failed to save invoice:", error);
      showError("حدث خطأ أثناء حفظ الفاتورة.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">رجوع</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          فاتورة مبيعات جديدة
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/sales")}
          >
            إلغاء
          </Button>
          <Button size="sm" onClick={handleSaveInvoice}>
            حفظ الفاتورة
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="customer">العميل</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedCustomerId(parseInt(value))
                  }
                >
                  <SelectTrigger id="customer" aria-label="اختر العميل">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={c.id!.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
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
            <CardHeader>
              <CardTitle>بنود الفاتورة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="w-[100px]">الكمية</TableHead>
                    <TableHead className="w-[120px] text-left">
                      سعر الوحدة
                    </TableHead>
                    <TableHead className="w-[120px] text-left">
                      الإجمالي
                    </TableHead>
                    <TableHead className="w-[50px]">
                      <span className="sr-only">إزالة</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="وصف المنتج أو الخدمة"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-left"
                          min="0"
                        />
                      </TableCell>
                      <TableCell className="text-left">
                        {(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={handleAddItem}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                إضافة بند جديد
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between">
                <span>الضريبة (١٥٪)</span>
                <span>{tax.toFixed(2)} ر.س</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate("/sales")}>
          إلغاء
        </Button>
        <Button size="sm" onClick={handleSaveInvoice}>
          حفظ الفاتورة
        </Button>
      </div>
    </div>
  );
};

export default NewSaleInvoice;