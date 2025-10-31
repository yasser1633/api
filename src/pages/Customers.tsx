import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Customer } from "@/lib/db";
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
import CustomerDialog from "@/components/CustomerDialog";

const Customers = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

  const customers = useLiveQuery(() => db.customers.toArray());

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (customerId: number | undefined) => {
    if (!customerId) return;

    const customer = await db.customers.get(customerId);
    if (customer?.balance !== 0) {
      showError("لا يمكن حذف عميل رصيده غير صفري.");
      return;
    }
    
    if (customer?.name === 'عميل نقدي') {
      showError("لا يمكن حذف العميل النقدي الافتراضي.");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await db.customers.delete(customerId);
        showSuccess("تم حذف العميل بنجاح.");
      } catch (error) {
        console.error("Failed to delete customer:", error);
        showError("حدث خطأ أثناء حذف العميل.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <Button size="sm" className="h-8 gap-1" onClick={handleAddCustomer}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            إضافة عميل
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>
            إدارة العملاء المسجلين في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>رقم الجوال</TableHead>
                <TableHead className="text-left">الرصيد (ر.س)</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers ? (
                customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell className={`text-left font-mono ${customer.balance > 0 ? 'text-red-600' : customer.balance < 0 ? 'text-green-600' : ''}`}>
                        {customer.balance.toFixed(2)}
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCustomer(customer.id)}
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
                      لا يوجد عملاء. ابدأ بإضافة عميل جديد.
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
      <CustomerDialog
        customer={selectedCustomer}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default Customers;