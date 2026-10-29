import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProviderSidebar } from './ProviderSidebar';
import { Bell, Menu, CheckCircle2, ChevronDown, LogOut } from 'lucide-react';
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
        .catch((error) => console.warn('Could not load live provider stats:', error));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className={`provider-workspace flex ${
        isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      } bg-canvas text-foreground`}
    >
      <div className="sticky top-0 hidden h-screen shrink-0 md:flex">
        <ProviderSidebar
          availability={dashboardStats?.availability}
          onAvailabilityToggle={(newValue) =>
            setDashboardStats((prev) => (prev ? { ...prev, availability: newValue } : null))
          }
        />
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] border-r border-white/8 p-0">
          <ProviderSidebar
            availability={dashboardStats?.availability}
            onAvailabilityToggle={(newValue) =>
              setDashboardStats((prev) => (prev ? { ...prev, availability: newValue } : null))
            }
            onItemClick={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-hairline bg-canvas/88 px-4 backdrop-blur-xl md:h-20 md:px-8">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open provider menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Badge variant="success" className="gap-1.5 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
              Live operations
            </Badge>

            <span className="hidden text-xs text-muted-foreground lg:inline">
              Welcome, <strong className="font-medium text-ink">{user.name || 'Partner'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {dashboardStats?.totalEarnings !== undefined && (
              <div className="hidden items-center gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-1.5 text-xs sm:flex">
                <span className="text-muted-foreground">Earnings</span>
                <span className="font-medium text-ink">
                  ₹{Number(dashboardStats.totalEarnings).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <ThemeToggle />

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/provider/bookings')}
              className="relative"
              title="Job notifications"
              aria-label="Job notifications"
            >
              <Bell size={17} strokeWidth={1.8} />
              {dashboardStats?.pendingBookings > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                  {dashboardStats.pendingBookings}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground md:h-9 md:w-9">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-xs font-medium text-ink sm:inline md:text-sm">
                    {user.name || 'Partner'}
                  </span>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-md border-hairline">
                <DropdownMenuLabel className="text-xs font-normal">
                  <div className="font-medium text-ink">{user.name || 'Partner'}</div>
                  <div className="text-[11px] text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/provider/profile')}
                  className="cursor-pointer gap-2"
                >
                  <CheckCircle2 size={15} className="text-accent-teal" />
                  <span>Profile & KYC</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={`min-h-0 flex-1 ${isMessagesPage ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
