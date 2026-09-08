import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { RightWalletPanel } from './RightWalletPanel';

import { ErrorBoundary } from '../common/ErrorBoundary';

export const CustomerLayout = ({ showRightPanel = true }) => {
  const { user, loading } = useAuth();
  const [walletBalance, setWalletBalance] = useState(2450.00);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Left Dark Violet Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        
        <div className="flex-1 flex min-w-0">
          <main className={`flex-1 overflow-y-auto ${isMessagesPage ? 'p-3 md:p-5 max-w-full' : 'p-8 max-w-7xl'}`}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>

          {/* Right Wallet & Actions Panel (hidden on messages page to give chat full room) */}
          {showRightPanel && !isMessagesPage && (
            <RightWalletPanel
              balance={walletBalance}
              onAddMoneySuccess={(amount) => setWalletBalance((prev) => prev + amount)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
