import React, { useState } from 'react';
import { Search, MapPin, Bell, HelpCircle, ChevronDown, User, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const cities = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'];

export const TopHeader = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-hairline bg-canvas/88 px-4 backdrop-blur-xl md:h-[76px] md:px-8">
      <div className="flex max-w-2xl flex-1 items-center gap-2 md:gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
          <Input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search services…"
            className="h-10 rounded-md border-transparent bg-surface-soft pl-10 focus-visible:bg-canvas md:h-11"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-xs border border-hairline bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ⌘ K
          </kbd>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="hidden h-10 items-center gap-2 rounded-md px-3 text-xs font-medium sm:inline-flex md:h-11"
            >
              <MapPin size={14} className="text-primary" strokeWidth={1.8} />
              <span>{location}</span>
              <ChevronDown size={13} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 rounded-md border-hairline">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Select city
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cities.map((city) => (
              <DropdownMenuItem
                key={city}
                onClick={() => setLocation(city)}
                className={`cursor-pointer rounded-sm text-sm ${location === city ? 'font-medium text-primary' : ''}`}
              >
                {city}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/notifications')}
          className="relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-canvas" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/help')}
          className="hidden sm:inline-flex"
          title="Help and support"
          aria-label="Help and support"
        >
          <HelpCircle size={17} strokeWidth={1.8} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground md:h-9 md:w-9">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden text-left lg:flex lg:flex-col">
                <span className="text-xs font-medium leading-tight text-ink">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[10px] capitalize text-muted-foreground">
                  {user?.role?.toLowerCase() || 'Customer'}
                </span>
              </div>
              <ChevronDown size={13} className="hidden text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-md border-hairline">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-ink">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2">
              <User size={15} />
              <span>Profile details</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
