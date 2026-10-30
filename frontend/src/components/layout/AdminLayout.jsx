import React, { useState } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Search, Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-canvas text-foreground">
      <div className="sticky top-0 hidden h-screen shrink-0 md:flex">
        <AdminSidebar />
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] border-r border-white/8 p-0">
          <AdminSidebar onItemClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-hairline bg-canvas/88 px-4 backdrop-blur-xl md:h-20 md:px-8">
          <div className="flex max-w-xl flex-1 items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
              <Input
                type="text"
                placeholder="Search…"
                className="h-10 rounded-md border-transparent bg-surface-soft pl-10 focus-visible:bg-canvas md:h-11"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />

            <Button
              variant="outline"
              size="icon"
              className="relative"
              title="Admin notifications"
              aria-label="Admin notifications"
            >
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-canvas" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground md:h-9 md:w-9">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-xs font-medium text-ink sm:inline md:text-sm">
                    {user?.name || 'Admin'}
                  </span>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-md border-hairline">
                <DropdownMenuLabel className="text-xs font-normal">
                  <div className="font-medium text-ink">{user?.name || 'Administrator'}</div>
                  <div className="text-[11px] text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
