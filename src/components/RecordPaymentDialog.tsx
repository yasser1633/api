import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { db, SaleInvoice, PurchaseInvoice } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

type Invoice = SaleInvoice | PurchaseInvoice;

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  invoiceType: 'sale' | 'purchase';
  isOpen: boolean;
  onClose: () => void;
}

const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({ invoice, invoiceType, isOpen, onClose }) => {
  const [amount, setAmount] = React.useState("0");
  const [paymentDate, setPaymentDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
    if (invoice) {
      const remaining = invoice.total - invoice.paidAmount;
      setAmount(remaining.toFixed(2));
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleSavePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      showError("الرجاء إدخال مبلغ صحيح.");
      return;
    }
    if (!paymentDate) {
      showError("الرجاء تحديد تاريخ الدفعة.");
      return;
    }
    const remaining = invoice.total - invoice.paidAmount;
    if (paymentAmount > remaining + 0.001) { // Add tolerance for float precision
      showError("المبلغ المدفوع أكبر من المبلغ المتبقي.");
      return;
    }

    try {
      if (invoiceType === "sale") {
        const saleInvoice = invoice as SaleInvoice;
        await db.transaction("rw", db.saleInvoices, db.customers, db.cashTransactions, async () => {
          const newPaidAmount = saleInvoice.paidAmount + paymentAmount;
          const newStatus = newPaidAmount >= saleInvoice.total ? "مدفوعة" : "مدفوعة جزئياً";
          
          await db.saleInvoices.update(saleInvoice.id!, {
            paidAmount: newPaidAmount,
            status: newStatus,
          });

          const customer = await db.customers.get(saleInvoice.customerId);
          if (customer) {
            await db.customers.update(saleInvoice.customerId, {
              balance: customer.balance - paymentAmount,
            });
          }

          await db.cashTransactions.add({
            date: paymentDate,
            type: 'in',
            amount: paymentAmount,
            description: `دفعة من فاتورة مبيعات INV-${saleInvoice.id?.toString().padStart(3, '0')}`,
            partyType: 'customer',
            partyId: saleInvoice.customerId,
          });
        });
      } else if (invoiceType === "purchase") {
        const purchaseInvoice = invoice as PurchaseInvoice;
        await db.transaction("rw", db.purchaseInvoices, db.suppliers, db.cashTransactions, async () => {
          const newPaidAmount = purchaseInvoice.paidAmount + paymentAmount;
          const newStatus = newPaidAmount >= purchaseInvoice.total ? "مدفوعة" : "مدفوعة جزئياً";

          await db.purchaseInvoices.update(purchaseInvoice.id!, {
            paidAmount: newPaidAmount,
            status: newStatus,
          });

          const supplier = await db.suppliers.get(purchaseInvoice.supplierId);
          if (supplier) {
            await db.suppliers.update(purchaseInvoice.supplierId, {
              balance: supplier.balance - paymentAmount,
            });
          }

          await db.cashTransactions.add({
            date: paymentDate,
            type: 'out',
            amount: paymentAmount,
            description: `دفعة لفاتورة مشتريات PUR-${purchaseInvoice.id?.toString().padStart(3, '0')}`,
            partyType: 'supplier',
            partyId: purchaseInvoice.supplierId,
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

  const remainingAmount = invoice.total - invoice.paidAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة</DialogTitle>
          <DialogDescription>
            فاتورة رقم {invoiceType === 'sale' ? 'INV' : 'PUR'}-{invoice.id?.toString().padStart(3, '0')}
            <br />
            المبلغ المتبقي: {remainingAmount.toFixed(2)} ر.س
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              المبلغ
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              التاريخ
            </Label>
            <div className="col-span-3">
              <DatePicker date={paymentDate} setDate={setPaymentDate} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSavePayment}>حفظ الدفعة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentDialog;