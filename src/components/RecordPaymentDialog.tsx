import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { db, SaleInvoice, PurchaseInvoice } from "@/lib/db";
import { showSuccess, showError } from "@/utils/toast";

type Invoice = (SaleInvoice | PurchaseInvoice) & { customerName?: string; supplierName?: string; };

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  invoiceType: 'sale' | 'purchase';
  isOpen: boolean;
  onClose: () => void;
}

const RecordPaymentDialog = ({ invoice, invoiceType, isOpen, onClose }: RecordPaymentDialogProps) => {
  const amountDue = invoice ? invoice.total - invoice.paidAmount : 0;
  const [amount, setAmount] = React.useState<number | string>(amountDue);
  const [paymentDate, setPaymentDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
    if (isOpen && invoice) {
      const newAmountDue = invoice.total - invoice.paidAmount;
      setAmount(newAmountDue);
      setPaymentDate(new Date());
    }
  }, [isOpen, invoice]);

  const handleSubmit = async () => {
    if (!invoice || !paymentDate) return;

    const numericAmount = parseFloat(amount.toString());
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError("الرجاء إدخال مبلغ صحيح.");
      return;
    }
    if (numericAmount > amountDue) {
        showError("المبلغ المدفوع أكبر من المبلغ المتبقي.");
        return;
    }

    try {
      if (invoiceType === 'sale') {
        await db.transaction('rw', db.saleInvoices, db.customers, db.cashTransactions, async () => {
            const saleInvoice = invoice as SaleInvoice;
            const customer = await db.customers.get(saleInvoice.customerId);
            if (!customer) throw new Error("Customer not found");

            const newPaidAmount = saleInvoice.paidAmount + numericAmount;
            const newStatus = newPaidAmount >= saleInvoice.total ? 'مدفوعة' : 'مدفوعة جزئياً';

            await db.saleInvoices.update(saleInvoice.id!, { paidAmount: newPaidAmount, status: newStatus });
            await db.customers.update(customer.id!, { balance: customer.balance - numericAmount });
            await db.cashTransactions.add({
                transactionDate: paymentDate,
                type: 'in',
                amount: numericAmount,
                description: `دفعة للفاتورة رقم INV-${saleInvoice.id?.toString().padStart(3, '0')}`,
                partyType: 'customer',
                partyId: customer.id,
                partyName: customer.name,
            });
        });
      } else { // Purchase
        await db.transaction('rw', db.purchaseInvoices, db.suppliers, db.cashTransactions, async () => {
            const purchaseInvoice = invoice as PurchaseInvoice;
            const supplier = await db.suppliers.get(purchaseInvoice.supplierId);
            if (!supplier) throw new Error("Supplier not found");

            const newPaidAmount = purchaseInvoice.paidAmount + numericAmount;
            const newStatus = newPaidAmount >= purchaseInvoice.total ? 'مدفوعة' : 'مدفوعة جزئياً';

            await db.purchaseInvoices.update(purchaseInvoice.id!, { paidAmount: newPaidAmount, status: newStatus });
            await db.suppliers.update(supplier.id!, { balance: supplier.balance - numericAmount });
            await db.cashTransactions.add({
                transactionDate: paymentDate,
                type: 'out',
                amount: numericAmount,
                description: `دفعة للفاتورة رقم PUR-${purchaseInvoice.id?.toString().padStart(3, '0')}`,
                partyType: 'supplier',
                partyId: supplier.id,
                partyName: supplier.name,
            });
        });
      }
      showSuccess("تم تسجيل الدفعة بنجاح!");
      onClose();
    } catch (error) {
      console.error("Failed to record payment:", error);
      showError("حدث خطأ أثناء تسجيل الدفعة.");
    }
  };
  
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة</DialogTitle>
          <DialogDescription>
            الفاتورة: {invoiceType === 'sale' ? 'INV' : 'PUR'}-{invoice.id?.toString().padStart(3, '0')}
            <br/>
            المبلغ المتبقي: {amountDue.toFixed(2)} ر.س
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">المبلغ</Label>
            <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="col-span-3" max={amountDue} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">التاريخ</Label>
            <div className="col-span-3">
                <DatePicker date={paymentDate} setDate={setPaymentDate} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit}>حفظ الدفعة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentDialog;