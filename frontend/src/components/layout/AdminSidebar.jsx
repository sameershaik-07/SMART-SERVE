import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  Users,
  BarChart3,
  FolderTree,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { user, logout } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Providers', path: '/admin/providers', icon: UserCheck },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Chat Audit', path: '/admin/chat-audit', icon: MessageSquare },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#3b1578] text-purple-100 flex flex-col min-h-screen sticky top-0 border-r border-purple-900/50 shadow-2xl z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-purple-900/40">
        <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
          <ShieldCheck size={22} className="fill-white stroke-purple-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-white leading-none">ServiceHub</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Admin Panel</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40 font-semibold'
                    : 'text-purple-200 hover:bg-purple-800/40 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-purple-900/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-400 text-purple-950 font-extrabold text-sm flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[110px]">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-purple-300">Super Admin</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-purple-300 hover:text-rose-400 transition-colors p-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
