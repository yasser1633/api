import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShoppingCart, Package, ArrowUp, ArrowDown } from "lucide-react";
import { db } from "@/lib/db";
import DashboardChart from "@/components/DashboardChart";
import RecentInvoices from "@/components/RecentInvoices";

const Dashboard = () => {
  const dashboardData = useLiveQuery(async () => {
    // Stats
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

    // Recent Unpaid Invoices
    const customersMap = new Map((await db.customers.toArray()).map(c => [c.id, c.name]));
    const suppliersMap = new Map((await db.suppliers.toArray()).map(s => [s.id, s.name]));

    const recentUnpaidSales = (await db.saleInvoices
      .where('status').notEqual('مدفوعة')
      .reverse()
      .limit(5)
      .toArray())
      .map(inv => ({ ...inv, partyName: customersMap.get(inv.customerId) || 'عميل محذوف' }));

    const recentUnpaidPurchases = (await db.purchaseInvoices
      .where('status').notEqual('مدفوعة')
      .reverse()
      .limit(5)
      .toArray())
      .map(inv => ({ ...inv, partyName: suppliersMap.get(inv.supplierId) || 'مورد محذوف' }));

    return {
      stats: {
        totalCustomers,
        totalSuppliers,
        totalSales,
        totalReceivables,
        totalPurchases,
        totalPayables,
      },
      recentUnpaidSales,
      recentUnpaidPurchases,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.stats.totalSales.toFixed(2) || "0.00"} ر.س
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
              {dashboardData?.stats.totalPayables.toFixed(2) || "0.00"} ر.س
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
              {dashboardData?.stats.totalReceivables.toFixed(2) || "0.00"} ر.س
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
              {dashboardData?.stats.totalPurchases.toFixed(2) || "0.00"} ر.س
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
            <div className="text-2xl font-bold">+{dashboardData?.stats.totalCustomers || 0}</div>
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
            <div className="text-2xl font-bold">+{dashboardData?.stats.totalSuppliers || 0}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي عدد الموردين المسجلين
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة</CardTitle>
            <CardDescription>
              مقارنة بين المبيعات والمشتريات خلال آخر 6 أشهر.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart />
          </CardContent>
        </Card>
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
            <RecentInvoices 
                title="فواتير مبيعات مستحقة"
                description="أحدث فواتير المبيعات غير المدفوعة."
                invoices={dashboardData?.recentUnpaidSales || []}
                viewAllLink="/sales"
                invoicePrefix="INV"
            />
            <RecentInvoices 
                title="فواتير مشتريات مستحقة"
                description="أحدث فواتير المشتريات غير المدفوعة."
                invoices={dashboardData?.recentUnpaidPurchases || []}
                viewAllLink="/purchases"
                invoicePrefix="PUR"
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;