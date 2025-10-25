import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/DatePicker";
import { PlusCircle } from "lucide-react";
import { db } from "@/lib/db";
import { showSuccess, showError } from "@/utils/toast";

const AddCashTransactionDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [type, setType] = React.useState<'in' | 'out'>('in');
  const [partyType, setPartyType] = React.useState<'customer' | 'supplier'>('customer');
  const [partyId, setPartyId] = React.useState<string | undefined>();
  const [amount, setAmount] = React.useState<number | string>('');
  const [transactionDate, setTransactionDate] = React.useState<Date | undefined>(new Date());
  const [description, setDescription] = React.useState('');

  const customers = useLiveQuery(() => db.customers.toArray());
  const suppliers = useLiveQuery(() => db.suppliers.toArray());

  const resetForm = () => {
    setType('in');
    setPartyType('customer');
    setPartyId(undefined);
    setAmount('');
    setTransactionDate(new Date());
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!partyId || !amount || !transactionDate) {
      showError("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }
    const numericAmount = parseFloat(amount.toString());
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError("الرجاء إدخال مبلغ صحيح.");
      return;
    }

    const selectedParty = partyType === 'customer'
      ? customers?.find(c => c.id === parseInt(partyId))
      : suppliers?.find(s => s.id === parseInt(partyId));

    if (!selectedParty) {
      showError("لم يتم العثور على الطرف المحدد.");
      return;
    }

    try {
      await db.transaction('rw', db.cashTransactions, db.customers, db.suppliers, async () => {
        // 1. Add cash transaction
        await db.cashTransactions.add({
          transactionDate,
          type,
          amount: numericAmount,
          description,
          partyType,
          partyId: selectedParty.id,
          partyName: selectedParty.name,
        });

        // 2. Update balance
        if (partyType === 'customer') {
          const balanceUpdate = type === 'in' ? numericAmount : -numericAmount;
          await db.customers.update(selectedParty.id!, { balance: selectedParty.balance + balanceUpdate });
        } else { // supplier
          const balanceUpdate = type === 'out' ? numericAmount : -numericAmount;
          await db.suppliers.update(selectedParty.id!, { balance: selectedParty.balance - balanceUpdate });
        }
      });

      showSuccess("تمت إضافة المعاملة بنجاح!");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add transaction:", error);
      showError("حدث خطأ أثناء إضافة المعاملة.");
    }
  };

  const parties = partyType === 'customer' ? customers : suppliers;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            إضافة حركة
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>إضافة حركة صندوق جديدة</DialogTitle>
          <DialogDescription>
            سجل الإيصالات النقدية أو المدفوعات هنا.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>نوع الحركة</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'in' | 'out')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">سند قبض</SelectItem>
                  <SelectItem value="out">سند صرف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>تاريخ الحركة</Label>
              <DatePicker date={transactionDate} setDate={setTransactionDate} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>الطرف</Label>
              <Select value={partyType} onValueChange={(v) => { setPartyType(v as 'customer' | 'supplier'); setPartyId(undefined); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">عميل</SelectItem>
                  <SelectItem value="supplier">مورد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="party-name">اسم {partyType === 'customer' ? 'العميل' : 'المورد'}</Label>
              <Select value={partyId} onValueChange={setPartyId}>
                <SelectTrigger id="party-name"><SelectValue placeholder={`اختر ${partyType === 'customer' ? 'العميل' : 'المورد'}`} /></SelectTrigger>
                <SelectContent>
                  {parties?.map(p => (
                    <SelectItem key={p.id} value={p.id!.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">المبلغ (ر.س)</Label>
            <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="اكتب وصفاً موجزاً للحركة..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashTransactionDialog;