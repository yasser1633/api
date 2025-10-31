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
import { Textarea } from "@/components/ui/textarea";
import { db, Item } from "@/lib/db";
import { showError, showSuccess } from "@/utils/toast";

const itemSchema = z.object({
  name: z.string().min(2, { message: "اسم المادة مطلوب." }),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, { message: "سعر الشراء يجب أن يكون رقماً موجباً." }),
  salePrice: z.coerce.number().min(0, { message: "سعر البيع يجب أن يكون رقماً موجباً." }),
  quantity: z.coerce.number().min(0, { message: "الكمية يجب أن تكون رقماً موجباً." }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemDialogProps {
  item?: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

const ItemDialog: React.FC<ItemDialogProps> = ({ item, isOpen, onClose }) => {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      description: "",
      purchasePrice: 0,
      salePrice: 0,
      quantity: 0,
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset(item);
    } else {
      form.reset({
        name: "",
        description: "",
        purchasePrice: 0,
        salePrice: 0,
        quantity: 0,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: ItemFormValues) => {
    try {
      if (item) {
        await db.items.update(item.id!, data);
        showSuccess("تم تحديث المادة بنجاح.");
      } else {
        await db.items.add(data);
        showSuccess("تمت إضافة المادة بنجاح.");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save item:", error);
      showError("حدث خطأ أثناء حفظ المادة.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "تعديل مادة" : "إضافة مادة جديدة"}</DialogTitle>
          <DialogDescription>
            {item ? "قم بتحديث بيانات المادة." : "أدخل بيانات المادة الجديدة."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المادة</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الصنف أو المنتج" {...field} />
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
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف تفصيلي للمادة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الشراء</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر البيع</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكمية في المخزون</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
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

export default ItemDialog;