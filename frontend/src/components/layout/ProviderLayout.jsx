import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProviderSidebar } from './ProviderSidebar';
import { Bell, Menu, CheckCircle2, ChevronDown, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getProviderDashboardApi } from '@/api/providers';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ProviderLayout = () => {
  const { user, loading, logout } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMessagesPage = location.pathname === '/provider/messages';

  useEffect(() => {
    if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
      getProviderDashboardApi()
        .then((data) => setDashboardStats(data))
        .catch((err) => console.warn('Could not load live provider stats:', err));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`provider-workspace flex ${isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background text-foreground transition-colors`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <ProviderSidebar
          availability={dashboardStats?.availability}
          onAvailabilityToggle={(newVal) =>
            setDashboardStats((prev) => (prev ? { ...prev, availability: newVal } : null))
          }
        />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border">
          <ProviderSidebar
            availability={dashboardStats?.availability}
            onAvailabilityToggle={(newVal) =>
              setDashboardStats((prev) => (prev ? { ...prev, availability: newVal } : null))
            }
            onItemClick={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-[76px] bg-card/95 backdrop-blur border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open provider menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operations
            </Badge>

            <span className="text-xs text-muted-foreground hidden lg:inline">
              Welcome, <strong className="text-foreground">{user.name || 'Partner'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Earnings Chip */}
            {dashboardStats?.totalEarnings !== undefined && (
              <div className="hidden sm:flex items-center gap-2 bg-muted/60 border border-border px-3 py-1.5 rounded-xl text-xs">
                <span className="text-muted-foreground">Earnings:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{Number(dashboardStats.totalEarnings).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <ThemeToggle />

            {/* Notification Bell */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/provider/bookings')}
              className="relative rounded-xl"
              title="Job Notifications"
              aria-label="Job Notifications"
            >
              <Bell size={18} />
              {dashboardStats?.pendingBookings > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {dashboardStats.pendingBookings}
                </span>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-foreground max-w-[100px] truncate hidden sm:inline">
                    {user.name || 'Partner'}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-xs font-normal">
                  <div className="font-bold text-foreground">{user.name || 'Partner'}</div>
                  <div className="text-muted-foreground text-[11px]">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/provider/profile')}
                  className="cursor-pointer gap-2"
                >
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Profile & KYC</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={`flex-1 min-h-0 ${isMessagesPage ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
