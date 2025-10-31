import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import { db } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

const transactionSchema = z.object({
  amount: z.coerce.number().positive({ message: "يجب أن يكون المبلغ أكبر من صفر." }),
  description: z.string().min(2, { message: "الوصف مطلوب." }),
  date: z.date({ required_error: "التاريخ مطلوب." }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface CashTransactionDialogProps {
  type: 'in' | 'out';
  isOpen: boolean;
  onClose: () => void;
}

const CashTransactionDialog: React.FC<CashTransactionDialogProps> = ({ type, isOpen, onClose }) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date(),
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        amount: 0,
        description: "",
        date: new Date(),
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await db.cashTransactions.add({
        ...data,
        type: type,
      });
      showSuccess("تمت إضافة المعاملة بنجاح.");
      onClose();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      showError("حدث خطأ أثناء حفظ المعاملة.");
    }
  };

  const title = type === 'in' ? "إيداع جديد" : "سحب جديد";
  const description = type === 'in' ? "إضافة مبلغ إلى الخزينة." : "سحب مبلغ من الخزينة.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Input placeholder="وصف المعاملة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ</FormLabel>
                  <FormControl>
                    <DatePicker date={field.value} setDate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>إلغاء</Button>
              <Button type="submit">حفظ</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CashTransactionDialog;