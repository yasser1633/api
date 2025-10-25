import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, Users, CreditCard } from "lucide-react";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">لوحة التحكم</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">٤٥,٢٣١.٨٩ ر.س</div>
            <p className="text-xs text-muted-foreground">
              +٢٠.١٪ من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+٢٣٥٠</div>
            <p className="text-xs text-muted-foreground">
              +١٨٠.١٪ من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عملاء جدد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+١٢</div>
            <p className="text-xs text-muted-foreground">
              +١٩٪ من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المخزون</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">٥٧٣</div>
            <p className="text-xs text-muted-foreground">
              +٢٠١ منذ الساعة الماضية
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>نظرة عامة</CardTitle>
            <CardDescription>
              هنا يمكنك رؤية ملخص لنشاطك التجاري.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">سيتم إضافة الرسوم البيانية هنا.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;