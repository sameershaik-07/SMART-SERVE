import React, { useState } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Search, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header Bar matching Reference Image 2 */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Global Search Bar */}
          <div className="relative w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings, providers, users..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            />
            <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-400 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* Profile Pill with Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-purple-700 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800">{user?.name || 'Admin'}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setShowAdminMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
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
