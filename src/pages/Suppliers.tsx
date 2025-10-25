import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Supplier } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2 } from "lucide-react";
import AddSupplierDialog from "@/components/AddSupplierDialog";
import EditSupplierDialog from "@/components/EditSupplierDialog";
import { showError, showSuccess } from "@/utils/toast";

const Suppliers = () => {
  const suppliers = useLiveQuery(() => db.suppliers.toArray());
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);

  const handleDeleteSupplier = async (id: number | undefined) => {
    if (!id) return;
    if (confirm("هل أنت متأكد من أنك تريد حذف هذا المورد؟")) {
      try {
        await db.suppliers.delete(id);
        showSuccess("تم حذف المورد بنجاح.");
      } catch (error) {
        console.error("Failed to delete supplier:", error);
        showError("حدث خطأ أثناء حذف المورد.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الموردين</h1>
        <AddSupplierDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>إدارة قائمة الموردين الخاصة بك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead className="text-left">الرصيد (ر.س)</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers ? (
                suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell
                        className={`text-left font-semibold ${
                          supplier.balance > 0
                            ? "text-red-600"
                            : supplier.balance < 0
                            ? "text-green-600"
                            : ""
                        }`}
                      >
                        {supplier.balance.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                            >
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا يوجد موردين. ابدأ بإضافة مورد جديد.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editingSupplier && (
        <EditSupplierDialog
          supplier={editingSupplier}
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      )}
    </div>
  );
};

export default Suppliers;