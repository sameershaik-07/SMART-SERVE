import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  UserPlus,
  CalendarPlus,
  BarChart,
  Settings,
  ChevronDown
} from 'lucide-react';
import { getAdminAnalyticsApi, getAdminBookingsApi } from '../../api/admin';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const mockAnalytics = {
    totalBookings: '0',
    bookingsTrend: '0%',
    activeProviders: '0',
    providersTrend: '0%',
    revenue: '₹0',
    revenueTrend: '0%',
    pendingVerifications: '0',
    verificationsTrend: '0%',
  };

  const mockQueue = [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsResponse, bookingsResponse] = await Promise.all([
          getAdminAnalyticsApi(),
          getAdminBookingsApi()
        ]);
        setAnalytics(analyticsResponse?.data || analyticsResponse || mockAnalytics);
        setRecentBookings(Array.isArray(bookingsResponse?.data) ? bookingsResponse.data : (bookingsResponse || []));
      } catch (err) {
        console.warn('Analytics API fallback:', err);
        setAnalytics(mockAnalytics);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = analytics || mockAnalytics;
  const visibleBookings = recentBookings.slice(0, 5);
  const formatDateTime = (booking) => new Date(booking.serviceDate || booking.createdAt).toLocaleString([], {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  const statusStyle = (status) => {
    if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-muted text-foreground border-border';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Greeting & Date Selector matching Reference Image 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="workspace-title text-3xl flex items-center gap-2">
            Good morning, Admin 👋
          </h1>
          <p className="workspace-subtitle mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-xs font-bold text-foreground shadow-sm cursor-default">
          <Calendar size={14} />
          <span>May 21, 2024</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </div>
      </div>

      {/* 4 Summary Metric Cards Grid matching Reference Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Bookings */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">Total Bookings</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">{stats.totalBookings}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> <span>↑ 12.5%</span>
              <span className="text-muted-foreground font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Active Providers */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">Active Providers</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">{stats.activeProviders ?? stats.totalProviders}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> <span>↑ 8.3%</span>
              <span className="text-muted-foreground font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center font-extrabold text-lg">
              ₹
            </div>
            <span className="text-xs text-muted-foreground font-semibold">Revenue</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">{stats.revenue ?? `₹${stats.totalRevenue || 0}`}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> <span>↑ 15.7%</span>
              <span className="text-muted-foreground font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">Pending Verifications</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">{stats.pendingVerifications ?? '0'}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-rose-600">
              <TrendingDown size={14} /> <span>↓ 5.6%</span>
              <span className="text-muted-foreground font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bookings Table (7 cols) + Verification Queue & Quick Actions (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Bookings Table (7 cols) matching Reference Image 2 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="sh-card bg-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground">Recent Bookings</h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Provider</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
                  {visibleBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/60 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">#BK-{b.id}</td>
                      <td className="py-3.5">{b.service?.title || 'Service booking'}</td>
                      <td className="py-3.5 flex items-center gap-2">
                        <span>{b.provider?.user?.name || 'Unassigned'}</span>
                      </td>
                      <td className="py-3.5 text-muted-foreground font-medium">{formatDateTime(b)}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex border px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyle(b.status)}`}
                        >
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-foreground">₹{b.totalPrice || 0}</td>
                    </tr>
                  ))}
                  {!loading && visibleBookings.length === 0 && (
                    <tr><td colSpan="6" className="py-8 text-center text-muted-foreground font-medium">No bookings yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>{loading ? 'Loading bookings…' : `Showing ${visibleBookings.length} of ${recentBookings.length} bookings`}</span>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="font-bold text-foreground hover:text-muted-foreground flex items-center gap-1"
              >
                View all bookings <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Verification Queue + Quick Actions (5 cols) matching Reference Image 2 */}
        <div className="lg:col-span-5 space-y-6">
          {/* Provider Verification Queue */}
          <div className="sh-card bg-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground">Provider Verification Queue</h3>
              <button
                onClick={() => navigate('/admin/providers')}
                className="text-xs font-bold text-foreground hover:text-muted-foreground"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {mockQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <img src={item.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                      <span className="text-[11px] text-muted-foreground block">{item.category}</span>
                      <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/admin/providers')}
                    className="px-3 py-1.5 border border-border text-foreground hover:bg-muted text-xs font-bold rounded-xl transition-colors"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>

            {/* Pending Notice Banner */}
            <div className="p-3 bg-muted border border-border rounded-xl flex items-center justify-between text-xs font-semibold text-foreground">
              <span>🕒 18 providers pending verification</span>
              <button
                onClick={() => navigate('/admin/providers')}
                className="font-bold text-foreground hover:underline flex items-center gap-1"
              >
                Go to Verifications <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Quick Actions Block matching Reference Image 2 */}
          <div className="sh-card bg-white p-6 space-y-4">
            <h3 className="text-base font-extrabold text-foreground pb-2">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/providers')}
                className="p-4 bg-muted hover:bg-accent border border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <UserPlus size={20} className="text-foreground group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Verify Provider</span>
              </button>

              <button
                onClick={() => navigate('/admin/bookings')}
                className="p-4 bg-muted hover:bg-accent border border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <CalendarPlus size={20} className="text-foreground group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Search Bookings</span>
              </button>

              <button
                onClick={() => navigate('/admin/analytics')}
                className="p-4 bg-muted hover:bg-accent border border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <BarChart size={20} className="text-foreground group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">View Analytics</span>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="p-4 bg-muted hover:bg-accent border border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <Settings size={20} className="text-foreground group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Platform Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
