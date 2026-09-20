import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const AdminSidebar = ({ className, onItemClick }) => {
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
    <aside className={cn("w-[248px] bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border select-none transition-colors", className)}>
      {/* Brand Header */}
      <Link
        to="/admin"
        onClick={onItemClick}
        className="h-[76px] flex items-center gap-3 px-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center text-sidebar-primary-foreground shadow-sm">
          <ShieldCheck size={22} className="fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">ServiceHub</span>
          <span className="text-[11px] font-semibold text-sidebar-foreground/70 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} className="text-primary" /> Admin Panel
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center justify-between p-2 rounded-xl bg-sidebar-accent/40 border border-sidebar-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-muted-foreground">Super Admin</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Logout"
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
