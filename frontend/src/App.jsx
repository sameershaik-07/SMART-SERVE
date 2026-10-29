import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProviderLayout } from './components/layout/ProviderLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Auth Pages
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const VerifyEmailPage = lazy(() =>
  import('./pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage }))
);

// Customer Pages
const LandingPage = lazy(() =>
  import('./pages/customer/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const BrowseServicesPage = lazy(() =>
  import('./pages/customer/BrowseServicesPage').then((m) => ({ default: m.BrowseServicesPage }))
);
const ServiceDetailsPage = lazy(() =>
  import('./pages/customer/ServiceDetailsPage').then((m) => ({ default: m.ServiceDetailsPage }))
);
const MyBookingsPage = lazy(() =>
  import('./pages/customer/MyBookingsPage').then((m) => ({ default: m.MyBookingsPage }))
);
const BookingDetailsPage = lazy(() =>
  import('./pages/customer/BookingDetailsPage').then((m) => ({ default: m.BookingDetailsPage }))
);
const ProvidersPage = lazy(() =>
  import('./pages/customer/ProvidersPage').then((m) => ({ default: m.ProvidersPage }))
);
const ProviderDetailsPage = lazy(() =>
  import('./pages/customer/ProviderDetailsPage').then((m) => ({ default: m.ProviderDetailsPage }))
);
const MessagesPage = lazy(() =>
  import('./pages/customer/MessagesPage').then((m) => ({ default: m.MessagesPage }))
);
const WalletPage = lazy(() =>
  import('./pages/customer/WalletPage').then((m) => ({ default: m.WalletPage }))
);
const ReviewsPage = lazy(() =>
  import('./pages/customer/ReviewsPage').then((m) => ({ default: m.ReviewsPage }))
);
const FavoritesPage = lazy(() =>
  import('./pages/customer/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/customer/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import('./pages/customer/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotificationsPage = lazy(() =>
  import('./pages/customer/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const HelpSupportPage = lazy(() =>
  import('./pages/customer/HelpSupportPage').then((m) => ({ default: m.HelpSupportPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/customer/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);

// Provider Pages
const ProviderDashboardPage = lazy(() =>
  import('./pages/provider/ProviderDashboardPage').then((m) => ({
    default: m.ProviderDashboardPage,
  }))
);
const ProviderBookingsPage = lazy(() =>
  import('./pages/provider/ProviderBookingsPage').then((m) => ({
    default: m.ProviderBookingsPage,
  }))
);
const ProviderServicesPage = lazy(() =>
  import('./pages/provider/ProviderServicesPage').then((m) => ({
    default: m.ProviderServicesPage,
  }))
);
const ProviderAvailabilityPage = lazy(() =>
  import('./pages/provider/ProviderAvailabilityPage').then((m) => ({
    default: m.ProviderAvailabilityPage,
  }))
);
const ProviderEarningsPage = lazy(() =>
  import('./pages/provider/ProviderEarningsPage').then((m) => ({
    default: m.ProviderEarningsPage,
  }))
);
const ProviderProfilePage = lazy(() =>
  import('./pages/provider/ProviderProfilePage').then((m) => ({
    default: m.ProviderProfilePage,
  }))
);
const ProviderMessagesPage = lazy(() =>
  import('./pages/provider/ProviderMessagesPage').then((m) => ({
    default: m.ProviderMessagesPage,
  }))
);

// Admin Pages
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminBookingsPage = lazy(() =>
  import('./pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage }))
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminProvidersPage = lazy(() =>
  import('./pages/admin/AdminProvidersPage').then((m) => ({ default: m.AdminProvidersPage }))
);
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);
const AdminChatAuditPage = lazy(() =>
  import('./pages/admin/AdminChatAuditPage').then((m) => ({ default: m.AdminChatAuditPage }))
);

// Common
import { NotFoundPage } from './pages/NotFoundPage';

// Brand
import { BrandMark } from './components/brand/BrandMark';

const AppLoading = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
    <div className="relative flex h-12 w-12 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
      <BrandMark size={38} className="relative text-primary" />
    </div>
    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Preparing your space</p>
  </div>
);


// Protected Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoading />;
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
    return <AppLoading />;
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
    <ThemeProvider defaultTheme="system" storageKey="servicehub-ui-theme">
      <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
        <Suspense fallback={<AppLoading />}>
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
        </Suspense>
      </BrowserRouter>
      </FavoritesProvider>
      </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
