import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, ShoppingCart, Package, Scale, Users, FileText } from "lucide-react";

const reportLinks = [
  {
    to: "/reports/sales",
    icon: ShoppingCart,
    title: "تقرير المبيعات",
    description: "عرض وتحليل فواتير المبيعات.",
  },
  {
    to: "/reports/profit-loss",
    icon: Scale,
    title: "تقرير الأرباح والخسائر",
    description: "ملخص الإيرادات والتكاليف وصافي الربح.",
  },
  {
    to: "/reports/customer-statement",
    icon: Users,
    title: "كشف حساب عميل",
    description: "عرض كشف حساب مفصل لعميل محدد.",
  },
  // Future reports can be added here
  // {
  //   to: "/reports/purchases",
  //   icon: Package,
  //   title: "تقرير المشتريات",
  //   description: "عرض وتحليل فواتير المشتريات.",
  // },
  // {
  //   to: "/reports/tax",
  //   icon: FileText,
  //   title: "التقرير الضريبي",
  //   description: "ملخص ضريبة القيمة المضافة.",
  // },
];

const Reports = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">التقارير</h1>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reportLinks.map((report) => (
        <Link to={report.to} key={report.to}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary text-primary-foreground rounded-lg p-3">
                <report.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  </div>
);

export default Reports;