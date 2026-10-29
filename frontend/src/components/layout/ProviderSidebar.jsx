import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Clock,
  Wallet,
  UserCheck,
  MessageSquare,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { updateProviderProfileApi } from '@/api/providers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BrandLockup } from '@/components/brand/BrandMark';

const navItems = [
  { label: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
  { label: 'Job requests', path: '/provider/bookings', icon: CalendarCheck },
  { label: 'My services', path: '/provider/services', icon: Briefcase },
  { label: 'Availability', path: '/provider/availability', icon: Clock },
  { label: 'Earnings', path: '/provider/earnings', icon: Wallet },
  { label: 'Profile & KYC', path: '/provider/profile', icon: UserCheck },
  { label: 'Messages', path: '/provider/messages', icon: MessageSquare },
];

export const ProviderSidebar = ({ className, availability, onAvailabilityToggle, onItemClick }) => {
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
    } catch (error) {
      console.error('Failed to update availability:', error);
      setIsOnline(isOnline);
    } finally {
      setToggling(false);
    }
  };

  return (
    <aside
      className={cn(
        'flex h-full w-[264px] select-none flex-col border-r border-white/8 bg-surface-dark text-on-dark',
        className
      )}
    >
      <Link
        to="/provider/dashboard"
        onClick={onItemClick}
        className="flex h-20 items-center border-b border-white/8 px-5 transition-colors hover:bg-white/[0.035]"
      >
        <BrandLockup size={32} inverted showTagline />
      </Link>

      <div className="mx-3 mt-4 flex items-center justify-between rounded-md border border-white/8 bg-surface-dark-elevated px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isOnline ? 'bg-accent-teal animate-pulse' : 'bg-on-dark-soft/40'}`}
          />
          <span className="text-[11px] font-medium text-on-dark">
            {isOnline ? 'Accepting jobs' : 'Offline'}
          </span>
        </div>
        <Switch
          checked={isOnline}
          onCheckedChange={handleToggleOnline}
          disabled={toggling}
          aria-label="Toggle availability"
        />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-on-dark-soft">
          Operations
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
                    ? 'text-primary-foreground'
                    : 'text-on-dark-soft hover:bg-white/5 hover:text-on-dark'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="provider-nav-active"
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
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-on-dark">
                {user?.name || user?.email?.split('@')[0] || 'Partner'}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-accent-teal">
                <CheckCircle2 size={10} /> Verified pro
              </p>
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
