import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import NewSaleInvoice from "./pages/NewSaleInvoice";
import SaleInvoiceDetail from "./pages/SaleInvoiceDetail";
import EditSaleInvoice from "./pages/EditSaleInvoice";
import Purchases from "./pages/Purchases";
import NewPurchaseInvoice from "./pages/NewPurchaseInvoice";
import PurchaseInvoiceDetail from "./pages/PurchaseInvoiceDetail";
import EditPurchaseInvoice from "./pages/EditPurchaseInvoice";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Cash from "./pages/Cash";
import Reports from "./pages/Reports";
import SalesReport from "./pages/reports/SalesReport";
import ProfitLossReport from "./pages/reports/ProfitLossReport";
import CustomerStatement from "./pages/reports/CustomerStatement";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales/new" element={<NewSaleInvoice />} />
            <Route path="/sales/:id" element={<SaleInvoiceDetail />} />
            <Route path="/sales/:id/edit" element={<EditSaleInvoice />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/new" element={<NewPurchaseInvoice />} />
            <Route path="/purchases/:id" element={<PurchaseInvoiceDetail />} />
            <Route path="/purchases/:id/edit" element={<EditPurchaseInvoice />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/cash" element={<Cash />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
            <Route path="/reports/customer-statement" element={<CustomerStatement />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;