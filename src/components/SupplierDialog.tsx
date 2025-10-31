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
import { db, Supplier } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

const supplierSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب." }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح." }).optional().or(z.literal('')),
  phone: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierDialogProps {
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

const SupplierDialog: React.FC<SupplierDialogProps> = ({ supplier, isOpen, onClose }) => {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [supplier, form]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      if (supplier) {
        // Update existing supplier
        await db.suppliers.update(supplier.id!, {
          name: data.name,
          email: data.email,
          phone: data.phone,
        });
        showSuccess("تم تحديث بيانات المورد بنجاح.");
      } else {
        // Add new supplier
        await db.suppliers.add({
          name: data.name,
          email: data.email,
          phone: data.phone,
          balance: 0, // New suppliers start with a zero balance
        });
        showSuccess("تمت إضافة المورد بنجاح.");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      showError("حدث خطأ أثناء حفظ بيانات المورد.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{supplier ? "تعديل مورد" : "إضافة مورد جديد"}</DialogTitle>
          <DialogDescription>
            {supplier ? "قم بتحديث بيانات المورد." : "أدخل بيانات المورد الجديد."}
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
                    <Input placeholder="اسم المورد" {...field} />
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
                  <FormLabel>رقم الهاتف (اختياري)</FormLabel>
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

export default SupplierDialog;