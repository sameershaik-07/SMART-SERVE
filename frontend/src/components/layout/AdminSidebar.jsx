import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  Users,
  BarChart3,
  FolderTree,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrandLockup } from '@/components/brand/BrandMark';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Providers', path: '/admin/providers', icon: UserCheck },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Chat audit', path: '/admin/chat-audit', icon: MessageSquare },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar = ({ className, onItemClick }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex h-full w-[264px] select-none flex-col border-r border-white/8 bg-surface-dark text-on-dark',
        className
      )}
    >
      <Link
        to="/admin"
        onClick={onItemClick}
        className="flex h-20 items-center border-b border-white/8 px-5 transition-colors hover:bg-white/[0.035]"
      >
        <BrandLockup size={32} inverted showTagline />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-on-dark-soft">
          Platform
        </p>
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
                  'relative flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-on-dark-soft hover:bg-white/5 hover:text-on-dark'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-md bg-primary"
                      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    />
                  )}
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.75} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-3">
        <div className="flex items-center justify-between rounded-md border border-white/8 bg-surface-dark-elevated p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/20 text-sm font-medium text-coral">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-on-dark">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-on-dark-soft">Super admin</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 text-on-dark-soft hover:bg-white/10 hover:text-on-dark"
          >
            <LogOut size={15} />
          </Button>
        </div>
      </div>
    </aside>
  );
};
