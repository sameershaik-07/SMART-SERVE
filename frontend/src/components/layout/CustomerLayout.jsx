import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { RightWalletPanel } from './RightWalletPanel';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export const CustomerLayout = ({ showRightPanel = true }) => {
  const { user, loading } = useAuth();
  const [walletBalance, setWalletBalance] = useState(2450.0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className={`flex ${
        isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      } bg-canvas text-foreground`}
    >
      <div className="sticky top-0 hidden h-screen shrink-0 md:flex">
        <Sidebar />
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] border-r border-sidebar-border p-0">
          <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="flex min-w-0 flex-1 overflow-hidden">
          <main
            className={`min-h-0 flex-1 ${
              isMessagesPage
                ? 'max-w-full overflow-hidden p-0'
                : 'overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8 2xl:px-10'
            }`}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>

          {showRightPanel && !isMessagesPage && (
            <div className="hidden shrink-0 xl:block">
              <RightWalletPanel
                balance={walletBalance}
                onAddMoneySuccess={(amount) => setWalletBalance((prev) => prev + amount)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
