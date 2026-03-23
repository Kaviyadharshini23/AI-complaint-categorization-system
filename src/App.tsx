import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "@/pages/AuthPage";
import AppLayout from "@/components/AppLayout";
import UserDashboard from "@/pages/UserDashboard";
import SubmitComplaint from "@/pages/SubmitComplaint";
import AIChatbot from "@/pages/AIChatbot";
import MyComplaints from "@/pages/MyComplaints";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminComplaints from "@/pages/AdminComplaints";
import NotificationsPage from "@/pages/NotificationsPage";
import AnalyticsPage from "@/pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) return <AuthPage />;

  const isAdmin = user.role === 'admin';

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={isAdmin ? <AdminDashboard /> : <UserDashboard />} />
        {!isAdmin && (
          <>
            <Route path="/submit" element={<SubmitComplaint />} />
            <Route path="/chatbot" element={<AIChatbot />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
          </>
        )}
        {isAdmin && (
          <>
            <Route path="/complaints" element={<AdminComplaints />} />
            <Route path="/analytics" element={<AdminDashboard />} />
          </>
        )}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
