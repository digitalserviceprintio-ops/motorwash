import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import QueuePage from "./pages/QueuePage";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ServicesPage from "./pages/ServicesPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrinterSettingsPage from "./pages/PrinterSettingsPage";
import LicensePage from "./pages/LicensePage";
import PurchasesPage from "./pages/PurchasesPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/antrian" element={<ProtectedRoute><QueuePage /></ProtectedRoute>} />
        <Route path="/transaksi" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/laporan" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/pengaturan" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/layanan" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
        <Route path="/pengaturan/printer" element={<ProtectedRoute><PrinterSettingsPage /></ProtectedRoute>} />
        <Route path="/pembelian" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
        <Route path="/lisensi" element={<ProtectedRoute><LicensePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
