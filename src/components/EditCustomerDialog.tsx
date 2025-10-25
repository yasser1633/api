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
import { db, Customer } from "@/lib/db";
import { showSuccess, showError } from "@/utils/toast";

interface EditCustomerDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

const EditCustomerDialog = ({ customer, isOpen, onClose }: EditCustomerDialogProps) => {
  const [name, setName] = React.useState(customer.name);
  const [email, setEmail] = React.useState(customer.email);
  const [phone, setPhone] = React.useState(customer.phone);

  React.useEffect(() => {
    if (isOpen) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
    }
  }, [isOpen, customer]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError("اسم العميل مطلوب.");
      return;
    }

    try {
      await db.customers.update(customer.id!, {
        name,
        email,
        phone,
      });
      showSuccess("تم تحديث بيانات العميل بنجاح!");
      onClose();
    } catch (error) {
      console.error("Failed to update customer:", error);
      showError("حدث خطأ أثناء تحديث بيانات العميل.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات العميل</DialogTitle>
          <DialogDescription>
            قم بتحديث تفاصيل العميل هنا. انقر على حفظ عند الانتهاء.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              الاسم
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              رقم الجوال
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;