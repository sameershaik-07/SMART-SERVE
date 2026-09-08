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
import { getAdminAnalyticsApi, getPendingProvidersApi } from '../../api/admin';
import { Badge } from '../../components/common/Badge';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
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

  const mockRecentBookings = [];
  const mockQueue = [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAdminAnalyticsApi();
        setAnalytics(res.data || res || mockAnalytics);
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

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Greeting & Date Selector matching Reference Image 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, Admin 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer hover:bg-slate-50">
          <Calendar size={14} className="text-purple-600" />
          <span>May 21, 2024</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* 4 Summary Metric Cards Grid matching Reference Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Bookings */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-xs text-slate-400 font-semibold">Total Bookings</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalBookings}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> <span>↑ 12.5%</span>
              <span className="text-slate-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Active Providers */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-xs text-slate-400 font-semibold">Active Providers</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeProviders}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> <span>↑ 8.3%</span>
              <span className="text-slate-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center font-extrabold text-lg">
              ₹
            </div>
            <span className="text-xs text-slate-400 font-semibold">Revenue</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats.revenue}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> <span>↑ 15.7%</span>
              <span className="text-slate-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="sh-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs text-slate-400 font-semibold">Pending Verifications</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats.pendingVerifications}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-rose-600">
              <TrendingDown size={14} /> <span>↓ 5.6%</span>
              <span className="text-slate-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bookings Table (7 cols) + Verification Queue & Quick Actions (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Bookings Table (7 cols) matching Reference Image 2 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="sh-card bg-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Recent Bookings</h3>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                View all
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Provider</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {mockRecentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">{b.id}</td>
                      <td className="py-3.5">{b.service}</td>
                      <td className="py-3.5 flex items-center gap-2">
                        <img src={b.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span>{b.customer}</span>
                      </td>
                      <td className="py-3.5 text-slate-500 font-medium">{b.dateTime}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            b.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : b.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-slate-900">{b.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Showing 5 of 25 bookings</span>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Provider Verification Queue</h3>
              <button
                onClick={() => navigate('/admin/providers')}
                className="text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {mockQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img src={item.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                      <span className="text-[11px] text-slate-500 block">{item.category}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/admin/providers')}
                    className="px-3 py-1.5 border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>

            {/* Pending Notice Banner */}
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between text-xs font-semibold text-purple-900">
              <span>🕒 18 providers pending verification</span>
              <button
                onClick={() => navigate('/admin/providers')}
                className="font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                Go to Verifications <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Quick Actions Block matching Reference Image 2 */}
          <div className="sh-card bg-white p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/providers')}
                className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <UserPlus size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Add Provider</span>
              </button>

              <button
                onClick={() => navigate('/admin/bookings')}
                className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <CalendarPlus size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Create Booking</span>
              </button>

              <button
                onClick={() => navigate('/admin/analytics')}
                className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <BarChart size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">View Analytics</span>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <Settings size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Platform Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
