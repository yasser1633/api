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
import { db, Supplier } from "@/lib/db";
import { showSuccess, showError } from "@/utils/toast";

interface EditSupplierDialogProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
}

const EditSupplierDialog = ({ supplier, isOpen, onClose }: EditSupplierDialogProps) => {
  const [name, setName] = React.useState(supplier.name);
  const [email, setEmail] = React.useState(supplier.email);
  const [phone, setPhone] = React.useState(supplier.phone);

  React.useEffect(() => {
    if (isOpen) {
      setName(supplier.name);
      setEmail(supplier.email);
      setPhone(supplier.phone);
    }
  }, [isOpen, supplier]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError("اسم المورد مطلوب.");
      return;
    }

    try {
      await db.suppliers.update(supplier.id!, {
        name,
        email,
        phone,
      });
      showSuccess("تم تحديث بيانات المورد بنجاح!");
      onClose();
    } catch (error) {
      console.error("Failed to update supplier:", error);
      showError("حدث خطأ أثناء تحديث بيانات المورد.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المورد</DialogTitle>
          <DialogDescription>
            قم بتحديث تفاصيل المورد هنا. انقر على حفظ عند الانتهاء.
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
              رقم الهاتف
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

export default EditSupplierDialog;