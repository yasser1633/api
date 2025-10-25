import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
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
import { Loader2, TrendingUp, TrendingDown, Users, Truck } from "lucide-react";

const Reports = () => {
  const reportData = useLiveQuery(async () => {
    const sales = await db.saleInvoices.toArray();
    const purchases = await db.purchaseInvoices.toArray();
    const customers = await db.customers.where("balance").above(0).toArray();
    const suppliers = await db.suppliers.where("balance").above(0).toArray();

    const totalSales = sales.reduce((sum, inv) => sum + inv.total, 0);
    const totalPurchases = purchases.reduce((sum, inv) => sum + inv.total, 0);
    const totalReceivables = customers.reduce((sum, c) => sum + c.balance, 0);
    const totalPayables = suppliers.reduce((sum, s) => sum + s.balance, 0);

    return {
      totalSales,
      salesCount: sales.length,
      totalPurchases,
      purchasesCount: purchases.length,
      customersWithBalance: customers.sort((a, b) => b.balance - a.balance),
      totalReceivables,
      suppliersWithBalance: suppliers.sort((a, b) => b.balance - a.balance),
      totalPayables,
    };
  });

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const {
    totalSales,
    salesCount,
    totalPurchases,
    purchasesCount,
    customersWithBalance,
    totalReceivables,
    suppliersWithBalance,
    totalPayables,
  } = reportData;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-right">التقارير</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              من {salesCount} فاتورة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              من {purchasesCount} فاتورة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ديون العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceivables.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              من {customersWithBalance.length} عميل
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ديون للموردين</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayables.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              لـ {suppliersWithBalance.length} مورد
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أرصدة العملاء المدينة</CardTitle>
            <CardDescription>قائمة بالعملاء الذين لديهم رصيد مستحق.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead className="text-left">الرصيد المستحق (ر.س)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersWithBalance.length > 0 ? (
                  customersWithBalance.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-left text-red-600 font-semibold">{customer.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      لا يوجد عملاء لديهم أرصدة مستحقة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أرصدة الموردين الدائنة</CardTitle>
            <CardDescription>قائمة بالموردين الذين لهم رصيد مستحق.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المورد</TableHead>
                  <TableHead className="text-left">الرصيد المستحق (ر.س)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliersWithBalance.length > 0 ? (
                  suppliersWithBalance.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell className="text-left text-red-600 font-semibold">{supplier.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      لا يوجد موردين لهم أرصدة مستحقة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;