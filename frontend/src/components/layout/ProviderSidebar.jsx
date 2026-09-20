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
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProviderProfileApi } from '@/api/providers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

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
    } catch (err) {
      console.error('Failed to update availability:', err);
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
    <aside className={cn("w-[248px] bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border select-none transition-colors", className)}>
      {/* Brand Header */}
      <Link
        to="/provider/dashboard"
        onClick={onItemClick}
        className="h-[76px] flex items-center gap-3 px-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center text-sidebar-primary-foreground shadow-sm">
          <Shield size={22} className="fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">ServiceHub</span>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Sparkles size={10} /> Partner Portal
          </span>
        </div>
      </Link>

      {/* Real-time Availability Switch */}
      <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/40'}`}></span>
          <span className="text-xs font-semibold text-sidebar-foreground">
            {isOnline ? 'Accepting Jobs' : 'Offline'}
          </span>
        </div>
        <Switch
          checked={isOnline}
          onCheckedChange={handleToggleOnline}
          disabled={toggling}
          aria-label="Toggle availability"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all",
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

      {/* Provider Profile Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center justify-between p-2 rounded-xl bg-sidebar-accent/40 border border-sidebar-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'P')}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.name || user?.email?.split('@')[0] || 'Partner'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 truncate">
                <CheckCircle2 size={10} /> Verified Pro
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
