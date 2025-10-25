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
import { MoreHorizontal } from "lucide-react";
import AddCustomerDialog from "@/components/AddCustomerDialog";

// بيانات مؤقتة للعملاء
const customers = [
  {
    id: "1",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    phone: "0501234567",
    balance: 1500.75,
  },
  {
    id: "2",
    name: "فاطمة علي",
    email: "fatima@example.com",
    phone: "0557654321",
    balance: -300.0,
  },
  {
    id: "3",
    name: "خالد عبدالله",
    email: "khalid@example.com",
    phone: "0539876543",
    balance: 0.0,
  },
  {
    id: "4",
    name: "سارة حسين",
    email: "sara@example.com",
    phone: "0541122334",
    balance: 5250.5,
  },
];

const Customers = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <AddCustomerDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>إدارة قائمة العملاء الخاصة بك.</CardDescription>
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
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell
                    className={`text-left font-semibold ${
                      customer.balance > 0
                        ? "text-green-600"
                        : customer.balance < 0
                        ? "text-red-600"
                        : ""
                    }`}
                  >
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
                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;