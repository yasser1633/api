import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  PanelLeft,
  Package2,
  DollarSign,
  Archive,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", icon: Home, label: "الرئيسية" },
  { to: "/sales", icon: ShoppingCart, label: "المبيعات" },
  { to: "/purchases", icon: Package, label: "المشتريات" },
  { to: "/items", icon: Archive, label: "المواد" },
  { to: "/customers", icon: Users, label: "العملاء" },
  { to: "/suppliers", icon: Users, label: "الموردون" },
  { to: "/cash", icon: DollarSign, label: "الخزينة" },
  { to: "/reports", icon: LineChart, label: "التقارير" },
];

const NavLinkWrapper = ({ to, icon: Icon, label, isMobile = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (isMobile) {
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
          isActive && "text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
};

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40" dir="rtl">
      <aside className="fixed inset-y-0 right-0 z-10 hidden w-14 flex-col border-l bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            to="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">برنامج المحاسبة</span>
          </Link>
          <TooltipProvider>
            {navLinks.map((link) => (
              <NavLinkWrapper key={link.to} {...link} />
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">الإعدادات</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">الإعدادات</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pr-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  to="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">برنامج المحاسبة</span>
                </Link>
                {navLinks.map((link) => (
                  <NavLinkWrapper key={link.to} {...link} isMobile />
                ))}
                 <Link
                  to="/settings"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  الإعدادات
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </header>
        <div className="px-4 sm:px-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-2 space-x-reverse pb-4">
              {[...navLinks, { to: "/settings", icon: Settings, label: "الإعدادات" }].map((link) => (
                <Button
                  key={link.to}
                  asChild
                  variant={location.pathname.startsWith(link.to) && link.to !== '/' || location.pathname === link.to ? "secondary" : "ghost"}
                  className="gap-2"
                >
                  <Link to={link.to}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;