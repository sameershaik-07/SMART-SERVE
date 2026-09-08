import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Shield,
  Home,
  Calendar,
  Users,
  MessageSquare,
  Wallet,
  Star,
  Heart,
  Settings,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/services', icon: Home },
    { label: 'Bookings', path: '/bookings', icon: Calendar },
    { label: 'Providers', path: '/providers', icon: Users },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'Reviews', path: '/reviews', icon: Star },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#35146c] text-purple-100 flex flex-col min-h-screen sticky top-0 border-r border-purple-900/50 shadow-2xl z-30 transition-all duration-300">
      {/* Brand Header: Points to /services as authenticated home */}
      <Link to="/services" className="flex items-center gap-3 px-6 py-6 border-b border-purple-900/40 hover:bg-purple-900/20 transition-colors">
        <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
          <Shield size={22} className="fill-white stroke-purple-600" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-white">ServiceHub</span>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-600/90 text-white shadow-md shadow-purple-900/40 font-semibold'
                    : 'text-purple-200 hover:bg-purple-800/40 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* User Profile Footer */}
      <div className="p-4 border-t border-purple-900/40">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-purple-800/40 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500 border-2 border-purple-300 flex items-center justify-center text-white font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white truncate max-w-[110px]">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-[11px] text-purple-300 capitalize">
                {user?.role?.toLowerCase() || 'Customer'}
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
            className="text-purple-300 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-purple-800/60 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
