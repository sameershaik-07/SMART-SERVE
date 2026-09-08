import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { ProviderSidebar } from './ProviderSidebar';
import { Bell, Search, Shield, CheckCircle2, ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProviderDashboardApi } from '../../api/providers';

export const ProviderLayout = () => {
  const { user, loading, logout } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
      getProviderDashboardApi()
        .then((data) => setDashboardStats(data))
        .catch((err) => console.warn('Could not load live provider stats:', err));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Provider Dark Navy Sidebar */}
      <ProviderSidebar
        availability={dashboardStats?.availability}
        onAvailabilityToggle={(newVal) =>
          setDashboardStats((prev) => (prev ? { ...prev, availability: newVal } : null))
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
        {/* Provider Top Ops Bar */}
        <header className="h-20 bg-[#141b2d] border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          {/* Status Badge & Title */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Operations Live
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Welcome back, <strong className="text-white">{user.name || 'Partner'}</strong>
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Quick Earnings Chip */}
            {dashboardStats?.totalEarnings !== undefined && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400">Total Earned:</span>
                <span className="font-extrabold text-emerald-400">
                  ₹{Number(dashboardStats.totalEarnings).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/provider/bookings')}
              className="relative w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
              title="Job Notifications"
            >
              <Bell size={18} />
              {dashboardStats?.pendingBookings > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#141b2d]">
                  {dashboardStats.pendingBookings}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-3 border-l border-slate-800 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">
                    {user.name || 'Partner'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/provider/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" /> Profile & KYC
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

