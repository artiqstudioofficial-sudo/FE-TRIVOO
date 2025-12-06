

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './components/ToastContext';
import { WishlistProvider } from './components/WishlistContext';
import { UserRole } from './types';

// Layouts
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import AITripPlanner from './pages/AITripPlanner';
import Payment from './pages/Payment';
import Wishlist from './pages/Wishlist';

// Protected Pages
import CustomerBookings from './pages/customer/Bookings';
import AgentDashboard from './pages/agent/Dashboard';
import AgentProducts from './pages/agent/MyProducts';
import AgentAddProduct from './pages/agent/AddProduct';
import AgentCustomerBookings from './pages/agent/CustomerBookings'; 
import AgentCommissions from './pages/agent/Commissions'; 
import AgentVerification from './pages/agent/Verification'; 
import AdminDashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminPayouts from './pages/admin/Payouts'; 
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminProducts from './pages/admin/Products';

// Route Guards
interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/ai-planner" element={<AITripPlanner />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wishlist" element={<Wishlist />} />
        
        {/* Customer Protected Route - Nested in Public Layout for consistency */}
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
            <Payment />
          </ProtectedRoute>
        } />

        <Route path="/my-bookings" element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
            <CustomerBookings />
          </ProtectedRoute>
        } />
      </Route>

      {/* Dashboard Routes (Admin & Agent) */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <DashboardLayout role={UserRole.ADMIN} />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/agent" element={
        <ProtectedRoute allowedRoles={[UserRole.AGENT]}>
          <DashboardLayout role={UserRole.AGENT} />
        </ProtectedRoute>
      }>
        <Route index element={<AgentDashboard />} />
        <Route path="products" element={<AgentProducts />} />
        <Route path="products/new" element={<AgentAddProduct />} />
        <Route path="products/edit/:id" element={<AgentAddProduct />} />
        <Route path="customers" element={<AgentCustomerBookings />} />
        <Route path="commissions" element={<AgentCommissions />} />
        <Route path="verification" element={<AgentVerification />} />
      </Route>

    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <WishlistProvider>
          <HashRouter>
            <ScrollToTop />
            <AppRoutes />
          </HashRouter>
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
