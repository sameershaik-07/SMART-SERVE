import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  Wallet,
  Star,
  Heart,
  Settings,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrandLockup } from '@/components/brand/BrandMark';

const navItems = [
  { label: 'Browse services', path: '/services', icon: Home },
  { label: 'My bookings', path: '/bookings', icon: Calendar },
  { label: 'Service providers', path: '/providers', icon: Users },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'My wallet', path: '/wallet', icon: Wallet },
  { label: 'My reviews', path: '/reviews', icon: Star },
  { label: 'Favorites', path: '/favorites', icon: Heart },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ className, onItemClick }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex h-full w-[264px] select-none flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      <Link
        to="/services"
        onClick={onItemClick}
        className="flex h-20 items-center border-b border-sidebar-border px-5 transition-colors hover:bg-sidebar-accent/45"
      >
        <BrandLockup size={32} showTagline />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Your space
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="customer-nav-active"
                      className="absolute inset-0 rounded-md border border-primary/15 bg-primary/8"
                      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    />
                  )}
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2 : 1.75}
                    className={cn('relative z-10', isActive ? 'text-primary' : 'text-muted-foreground')}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between rounded-md border border-white/5 bg-surface-dark p-2.5 text-on-dark">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/20 text-sm font-semibold text-coral">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-on-dark">
                {user?.name || user?.email?.split('@')[0] || 'Customer'}
              </p>
              <p className="text-[10px] text-on-dark-soft">Customer account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(event) => {
              event.preventDefault();
              logout();
            }}
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
