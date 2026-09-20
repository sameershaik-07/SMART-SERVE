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

export const TopHeader = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cities = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'];

  return (
    <header className="h-16 md:h-[76px] bg-card/95 backdrop-blur border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Mobile Menu Trigger + Search */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-2xl">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for services..."
            className="pl-10 h-10 md:h-11 rounded-xl bg-muted/55 border-transparent focus-visible:bg-card focus-visible:border-input"
          />
        </form>

        {/* Location Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl h-10 md:h-11 px-3 text-xs md:text-sm font-semibold"
            >
              <MapPin size={15} className="text-primary" />
              <span>{location}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 rounded-xl">
            <DropdownMenuLabel className="text-xs">Select City</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cities.map((city) => (
              <DropdownMenuItem
                key={city}
                onClick={() => setLocation(city)}
                className={`cursor-pointer ${location === city ? 'font-bold text-primary bg-primary/10' : ''}`}
              >
                {city}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Controls: ThemeToggle, Notifications, Help, User Avatar Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <ThemeToggle />

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/notifications')}
          className="relative rounded-xl"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/help')}
          className="hidden sm:inline-flex rounded-xl"
          title="Help & Support"
          aria-label="Help & Support"
        >
          <HelpCircle size={18} />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-muted"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary text-primary-foreground font-bold text-xs md:text-sm flex items-center justify-center shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs md:text-sm font-semibold text-foreground leading-tight">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize">
                  {user?.role?.toLowerCase() || 'Customer'}
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground leading-none">
                  {user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="cursor-pointer gap-2"
            >
              <User size={15} />
              <span>Profile Details</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
