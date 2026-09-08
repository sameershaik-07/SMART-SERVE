import React, { useState } from 'react';
import { Search, MapPin, Bell, HelpCircle, ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const TopHeader = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input & Location Dropdown */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for services..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
          />
        </form>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <MapPin size={16} className="text-purple-600 mr-2" />
            <span>{location}</span>
            <ChevronDown size={16} className="ml-2 text-slate-400" />
          </button>

          {showLocationDropdown && (
            <div className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              {['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    setShowLocationDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                    location === city
                      ? 'bg-purple-50 text-purple-700 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Help */}
        <button
          onClick={() => navigate('/help')}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Help & Support"
        >
          <HelpCircle size={18} />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 leading-tight">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer"
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowUserDropdown(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
