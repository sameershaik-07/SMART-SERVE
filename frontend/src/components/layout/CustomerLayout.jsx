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
  const [walletBalance, setWalletBalance] = useState(2450.00);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`flex ${isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background text-foreground transition-colors`}>
      {/* Desktop Sidebar (hidden on md and below) */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border">
          <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="flex-1 flex min-w-0 overflow-hidden">
          <main className={`flex-1 min-h-0 ${isMessagesPage ? 'overflow-hidden p-0 max-w-full' : 'overflow-y-auto p-5 md:p-8 2xl:p-10'}`}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>

          {/* Right Wallet Panel (hidden on mobile and messages page) */}
          {showRightPanel && !isMessagesPage && (
            <div className="hidden xl:block shrink-0">
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
