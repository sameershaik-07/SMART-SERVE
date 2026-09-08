import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProviderLayout } from './components/layout/ProviderLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Customer Pages
import { LandingPage } from './pages/customer/LandingPage';
import { BrowseServicesPage } from './pages/customer/BrowseServicesPage';
import { ServiceDetailsPage } from './pages/customer/ServiceDetailsPage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';
import { BookingDetailsPage } from './pages/customer/BookingDetailsPage';
import { ProvidersPage } from './pages/customer/ProvidersPage';
import { ProviderDetailsPage } from './pages/customer/ProviderDetailsPage';
import { MessagesPage } from './pages/customer/MessagesPage';
import { WalletPage } from './pages/customer/WalletPage';
import { ReviewsPage } from './pages/customer/ReviewsPage';
import { FavoritesPage } from './pages/customer/FavoritesPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { SettingsPage } from './pages/customer/SettingsPage';
import { NotificationsPage } from './pages/customer/NotificationsPage';
import { HelpSupportPage } from './pages/customer/HelpSupportPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';

// Provider Pages
import { ProviderDashboardPage } from './pages/provider/ProviderDashboardPage';
import { ProviderBookingsPage } from './pages/provider/ProviderBookingsPage';
import { ProviderServicesPage } from './pages/provider/ProviderServicesPage';
import { ProviderAvailabilityPage } from './pages/provider/ProviderAvailabilityPage';
import { ProviderEarningsPage } from './pages/provider/ProviderEarningsPage';
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage';
import { ProviderMessagesPage } from './pages/provider/ProviderMessagesPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProvidersPage } from './pages/admin/AdminProvidersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminChatAuditPage } from './pages/admin/AdminChatAuditPage';

// Common
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && allowedRole) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Landing / Root Handler
const RootHandler = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PROVIDER') return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/services" replace />;
  }
  return <LandingPage />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page (Login / Sign Up options only; redirect if authenticated) */}
          <Route path="/" element={<RootHandler />} />
          <Route path="/home" element={<Navigate to="/services" replace />} />

          {/* Auth Split-Screen Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Customer Workspace Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/services" element={<BrowseServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailsPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/providers/:id" element={<ProviderDetailsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* Provider Workspace Routes */}
          <Route element={<ProviderLayout />}>
            <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
            <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
            <Route path="/provider/bookings" element={<ProviderBookingsPage />} />
            <Route path="/provider/services" element={<ProviderServicesPage />} />
            <Route path="/provider/availability" element={<ProviderAvailabilityPage />} />
            <Route path="/provider/earnings" element={<ProviderEarningsPage />} />
            <Route path="/provider/profile" element={<ProviderProfilePage />} />
            <Route path="/provider/messages" element={<ProviderMessagesPage />} />
          </Route>

          {/* Admin Workspace Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/providers" element={<AdminProvidersPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/chat-audit" element={<AdminChatAuditPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
