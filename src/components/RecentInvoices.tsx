import * as React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Invoice {
  id?: number;
  total: number;
  invoiceDate: Date;
  partyName: string;
}

interface RecentInvoicesProps {
  title: string;
  description: string;
  invoices: Invoice[];
  viewAllLink: string;
  invoicePrefix: 'INV' | 'PUR';
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ title, description, invoices, viewAllLink, invoicePrefix }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild size="sm" className="mr-auto gap-1">
          <Link to={viewAllLink}>
            عرض الكل
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  <Link to={`${viewAllLink}/${invoice.id}`} className="hover:underline">
                    {invoicePrefix}-{invoice.id?.toString().padStart(3, "0")}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">{invoice.partyName}</p>
              </div>
              <div className="mr-auto text-left">
                <p className="text-sm font-medium">{invoice.total.toFixed(2)} ر.س</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(invoice.invoiceDate, { addSuffix: true, locale: arSA })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد فواتير حالياً.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentInvoices;