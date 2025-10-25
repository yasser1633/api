import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
          <h1 className="text-xl font-semibold">تطبيق المحاسبة</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-grow p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
      <div className="hidden border-r bg-muted/40 md:block">
        <Sidebar />
      </div>
    </div>
  );
};

export default Layout;