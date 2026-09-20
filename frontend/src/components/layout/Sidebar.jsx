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
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const Sidebar = ({ className, onItemClick }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Browse Services', path: '/services', icon: Home },
    { label: 'My Bookings', path: '/bookings', icon: Calendar },
    { label: 'Service Providers', path: '/providers', icon: Users },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'My Wallet', path: '/wallet', icon: Wallet },
    { label: 'My Reviews', path: '/reviews', icon: Star },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={cn("w-[248px] bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border select-none transition-colors", className)}>
      {/* Brand Header */}
      <Link
        to="/services"
        onClick={onItemClick}
        className="h-[76px] flex items-center gap-3 px-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center text-sidebar-primary-foreground shadow-sm">
          <Shield size={22} className="fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">ServiceHub</span>
          <span className="text-[11px] font-medium text-sidebar-foreground/60">Customer Portal</span>
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
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

      {/* User Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center justify-between p-2 rounded-xl bg-sidebar-accent/40 border border-sidebar-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 capitalize truncate">
                Customer
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            title="Sign Out"
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </Button>
        </div>
      </div>
    </aside>
  );
};
