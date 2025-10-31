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
import { db, Customer } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

const customerSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب." }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح." }).optional().or(z.literal('')),
  phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ customer, isOpen, onClose }) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [customer, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (customer) {
        // Update existing customer
        await db.customers.update(customer.id!, {
          name: data.name,
          email: data.email,
          phone: data.phone,
        });
        showSuccess("تم تحديث بيانات العميل بنجاح.");
      } else {
        // Add new customer
        await db.customers.add({
          name: data.name,
          email: data.email,
          phone: data.phone,
          balance: 0, // New customers start with a zero balance
        });
        showSuccess("تمت إضافة العميل بنجاح.");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save customer:", error);
      showError("حدث خطأ أثناء حفظ بيانات العميل.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? "تعديل عميل" : "إضافة عميل جديد"}</DialogTitle>
          <DialogDescription>
            {customer ? "قم بتحديث بيانات العميل." : "أدخل بيانات العميل الجديد."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم العميل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الجوال (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="05xxxxxxxx" {...field} />
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

export default CustomerDialog;