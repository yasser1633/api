import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Item } from "@/lib/db";
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
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import ItemDialog from "@/components/ItemDialog";

const Items = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

  const items = useLiveQuery(() => db.items.toArray());

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: number | undefined) => {
    if (!itemId) return;

    const item = await db.items.get(itemId);
    if (item?.quantity !== 0) {
      showError("لا يمكن حذف مادة رصيدها في المخزون غير صفري.");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await db.items.delete(itemId);
        showSuccess("تم حذف المادة بنجاح.");
      } catch (error) {
        console.error("Failed to delete item:", error);
        showError("حدث خطأ أثناء حذف المادة.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المواد</h1>
        <Button size="sm" className="h-8 gap-1" onClick={handleAddItem}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            إضافة مادة
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة المواد</CardTitle>
          <CardDescription>
            إدارة المواد والأصناف في المخزون.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المادة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-left">سعر الشراء (ر.س)</TableHead>
                <TableHead className="text-left">سعر البيع (ر.س)</TableHead>
                <TableHead className="text-left">الكمية في المخزون</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items ? (
                items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.description || "-"}</TableCell>
                      <TableCell className="text-left font-mono">{item.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell className="text-left font-mono">{item.salePrice.toFixed(2)}</TableCell>
                      <TableCell className="text-left font-mono">{item.quantity}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteItem(item.id)}
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      لا يوجد مواد. ابدأ بإضافة مادة جديدة.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ItemDialog
        item={selectedItem}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default Items;