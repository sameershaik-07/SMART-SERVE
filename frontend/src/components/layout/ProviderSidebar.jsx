import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Clock,
  Wallet,
  UserCheck,
  MessageSquare,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProviderProfileApi } from '../../api/providers';

export const ProviderSidebar = ({ availability, onAvailabilityToggle }) => {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(availability ?? true);
  const [toggling, setToggling] = useState(false);

  const handleToggleOnline = async () => {
    try {
      setToggling(true);
      const nextStatus = !isOnline;
      setIsOnline(nextStatus);
      await updateProviderProfileApi({ availability: nextStatus });
      if (onAvailabilityToggle) onAvailabilityToggle(nextStatus);
    } catch (err) {
      console.error('Failed to update availability:', err);
      // Revert on error
      setIsOnline(isOnline);
    } finally {
      setToggling(false);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Job Requests', path: '/provider/bookings', icon: CalendarCheck },
    { label: 'My Services', path: '/provider/services', icon: Briefcase },
    { label: 'Availability', path: '/provider/availability', icon: Clock },
    { label: 'Earnings', path: '/provider/earnings', icon: Wallet },
    { label: 'Profile & KYC', path: '/provider/profile', icon: UserCheck },
    { label: 'Messages', path: '/provider/messages', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-[#141b2d] text-slate-200 flex flex-col min-h-screen sticky top-0 border-r border-slate-800/80 shadow-2xl z-30 transition-all duration-300 select-none">
      {/* Brand Header */}
      <Link
        to="/provider/dashboard"
        className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors"
      >
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
          <Shield size={22} className="fill-white stroke-emerald-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-white leading-tight">ServiceHub</span>
          <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">Partner Pro</span>
        </div>
      </Link>

      {/* Real-time Availability Switch */}
      <div className="px-4 py-3 mx-4 my-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
          <span className="text-xs font-bold text-slate-300">
            {isOnline ? 'Accepting Jobs' : 'Offline'}
          </span>
        </div>
        <button
          onClick={handleToggleOnline}
          disabled={toggling}
          title={isOnline ? 'Go Offline' : 'Go Online'}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {toggling ? '...' : isOnline ? 'Online' : 'Go Live'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Provider Profile Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 border-2 border-emerald-400/40 flex items-center justify-center text-white font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'P')}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white truncate max-w-[110px]">
                {user?.name || user?.email?.split('@')[0] || 'Partner'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified Pro
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              logout();
            }}
            title="Sign Out"
            className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

