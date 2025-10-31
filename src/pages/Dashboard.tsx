import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Package, ArrowUp, ArrowDown } from "lucide-react";
import { db } from "@/lib/db";

const Dashboard = () => {
  const stats = useLiveQuery(async () => {
    const totalCustomers = await db.customers.count();
    const totalSuppliers = await db.suppliers.count();
    
    const salesInvoices = await db.saleInvoices.toArray();
    const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = salesInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalReceivables = totalSales - totalPaid;

    const purchaseInvoices = await db.purchaseInvoices.toArray();
    const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaidToSuppliers = purchaseInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalPayables = totalPurchases - totalPaidToSuppliers;

    return {
      totalCustomers,
      totalSuppliers,
      totalSales,
      totalReceivables,
      totalPurchases,
      totalPayables,
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalSales.toFixed(2) || "0.00"} ر.س
          </div>
          <p className="text-xs text-muted-foreground">
            إجمالي قيمة فواتير المبيعات
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الذمم الدائنة (للموردين)</CardTitle>
          <ArrowDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalPayables.toFixed(2) || "0.00"} ر.س
          </div>
          <p className="text-xs text-muted-foreground">
            المبالغ المتبقية لفواتير المشتريات
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الذمم المدينة (من العملاء)</CardTitle>
          <ArrowUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalReceivables.toFixed(2) || "0.00"} ر.س
          </div>
          <p className="text-xs text-muted-foreground">
            المبالغ المتبقية من فواتير المبيعات
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalPurchases.toFixed(2) || "0.00"} ر.س
          </div>
          <p className="text-xs text-muted-foreground">
            إجمالي قيمة فواتير المشتريات
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">العملاء</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats?.totalCustomers || 0}</div>
          <p className="text-xs text-muted-foreground">
            إجمالي عدد العملاء المسجلين
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الموردون</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats?.totalSuppliers || 0}</div>
          <p className="text-xs text-muted-foreground">
            إجمالي عدد الموردين المسجلين
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;