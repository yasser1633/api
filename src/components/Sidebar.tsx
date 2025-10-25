import { NavLink } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  Wallet,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", icon: Home, text: "الرئيسية" },
  { to: "/sales", icon: ShoppingCart, text: "المبيعات" },
  { to: "/purchases", icon: Package, text: "المشتريات" },
  { to: "/cash", icon: Wallet, text: "الصندوق" },
  { to: "/customers", icon: Users, text: "العملاء" },
  { to: "/suppliers", icon: UserPlus, text: "الموردين" },
  { to: "/reports", icon: LineChart, text: "التقارير" },
  { to: "/settings", icon: Settings, text: "الإعدادات" },
];

const Sidebar = () => {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>المحاسب</span>
        </NavLink>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary"
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.text}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;