import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";

// بيانات مؤقتة لفواتير المبيعات
const invoices = [
  {
    id: "INV001",
    customer: "أحمد محمد",
    date: "2023-10-26",
    total: 250.0,
    status: "مدفوعة",
  },
  {
    id: "INV002",
    customer: "فاطمة علي",
    date: "2023-10-25",
    total: 150.0,
    status: "غير مدفوعة",
  },
  {
    id: "INV003",
    customer: "خالد عبدالله",
    date: "2023-10-24",
    total: 350.0,
    status: "مدفوعة",
  },
  {
    id: "INV004",
    customer: "سارة حسين",
    date: "2023-10-23",
    total: 450.0,
    status: "متأخرة",
  },
];

const Sales = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المبيعات</h1>
        <Button asChild size="sm" className="h-8 gap-1">
          <Link to="/sales/new">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              فاتورة جديدة
            </span>
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>فواتير المبيعات</CardTitle>
          <CardDescription>
            إدارة فواتير المبيعات الخاصة بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجمالي (ر.س)</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "مدفوعة"
                          ? "default"
                          : invoice.status === "غير مدفوعة"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        invoice.status === "مدفوعة"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : ""
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    {invoice.total.toFixed(2)}
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
                        <DropdownMenuItem>عرض</DropdownMenuItem>
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

export default Sales;