
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import SubmitComplaint from "./components/SubmitComplaint";
import ComplaintsList from "./components/ComplaintsList";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Index />
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/submit-complaint" element={
        <ProtectedRoute>
          <Layout>
            <SubmitComplaint />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/complaints" element={
        <ProtectedRoute>
          <Layout>
            <ComplaintsList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/manage-complaints" element={
        <ProtectedRoute>
          <Layout>
            <ComplaintsList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/groups" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">Community Groups</h1>
              <p className="text-gray-600">Feature coming soon...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
              <p className="text-gray-600">Feature coming soon...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/manage-users" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">User Management</h1>
              <p className="text-gray-600">Feature coming soon...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p className="text-gray-600">Feature coming soon...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
