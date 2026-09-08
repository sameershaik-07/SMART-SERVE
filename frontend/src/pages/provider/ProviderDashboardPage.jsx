import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  ShieldCheck,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Phone,
  MapPin,
  Check,
  X,
  Play,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProviderDashboardApi, updateProviderProfileApi } from '../../api/providers';
import { getProviderBookingsApi, updateBookingStatusApi } from '../../api/bookings';

export const ProviderDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    averageRating: 4.8,
    verified: true,
    availability: true,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.allSettled([
        getProviderDashboardApi(),
        getProviderBookingsApi(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats((prev) => ({ ...prev, ...statsRes.value }));
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
        const list = Array.isArray(bookingsRes.value)
          ? bookingsRes.value
          : bookingsRes.value.bookings || [];
        setBookings(list);
      }
    } catch (err) {
      console.warn('Could not load provider dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStatusChange = async (bookingId, nextStatus) => {
    try {
      setActionLoading(bookingId);
      setFeedbackMsg('');
      await updateBookingStatusApi(bookingId, nextStatus);

      // Update local bookings state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
      );

      // Recalculate quick stats locally
      if (nextStatus === 'COMPLETED') {
        setStats((prev) => ({
          ...prev,
          completedBookings: prev.completedBookings + 1,
          pendingBookings: Math.max(0, prev.pendingBookings - 1),
        }));
      } else if (nextStatus === 'CANCELLED') {
        setStats((prev) => ({
          ...prev,
          pendingBookings: Math.max(0, prev.pendingBookings - 1),
        }));
      }

      setFeedbackMsg(`Booking #${bookingId} marked as ${nextStatus.replace('_', ' ')}!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackMsg(err.message || 'Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleOnline = async () => {
    const nextAvailability = !stats.availability;
    try {
      setStats((prev) => ({ ...prev, availability: nextAvailability }));
      await updateProviderProfileApi({ availability: nextAvailability });
    } catch (err) {
      setStats((prev) => ({ ...prev, availability: !nextAvailability }));
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Banner & Online/Offline Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              Service Partner Dashboard
            </span>
            {stats.verified && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Hello, {user?.name || 'Partner'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Manage your service appointments, track earnings, and respond to customer requests in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white">
                {stats.availability ? 'Online & Available' : 'Offline / On Break'}
              </span>
              <span className="text-[10px] text-slate-400">
                {stats.availability ? 'Receiving job alerts' : 'Not visible to new customers'}
              </span>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                stats.availability ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${
                  stats.availability ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={loadDashboardData}
            title="Refresh Data"
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Inline Action Alert */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-400 hover:text-emerald-200">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Earnings */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            ₹{Number(stats.totalEarnings).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">100%</span> direct payout to partner wallet
          </p>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => navigate('/provider/bookings')}
          className={`rounded-3xl p-6 relative overflow-hidden cursor-pointer transition-all border ${
            stats.pendingBookings > 0
              ? 'bg-amber-950/30 border-amber-500/50 hover:bg-amber-950/50'
              : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Requests</span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                stats.pendingBookings > 0
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-700/50 text-slate-400 border-slate-700'
              }`}
            >
              <Clock size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white tracking-tight">{stats.pendingBookings}</div>
            {stats.pendingBookings > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </div>
          <p className="text-[11px] text-amber-300 font-semibold mt-2">
            {stats.pendingBookings > 0 ? 'Action required: Review requests' : 'All requests responded'}
          </p>
        </div>

        {/* Completed Jobs */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{stats.completedBookings}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Out of {stats.totalBookings} total bookings
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Rating</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star size={20} className="fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl font-black text-white tracking-tight">
              {Number(stats.averageRating || 4.8).toFixed(1)}
            </div>
            <span className="text-slate-400 text-xs font-bold">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-2">
            ★ Top 5% Provider Quality
          </p>
        </div>
      </div>

      {/* Pending Job Requests Queue (Urgent Action) */}
      <div className="bg-slate-800/50 border border-slate-700/80 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Pending Job Inquiries</h2>
              <p className="text-xs text-slate-400">Accept or decline incoming customer bookings</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/provider/bookings')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            View All ({bookings.length}) <ChevronRight size={14} />
          </button>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="py-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-bold text-slate-300">No pending booking requests!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ensure your availability is toggled ON to receive new orders.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {b.service?.title || 'Service Booking'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      PENDING
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500" />
                      {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-500" />
                      {b.location || b.customer?.address || 'Customer Location'}
                    </span>
                    {b.customer?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-slate-500" />
                        {b.customer.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">
                      ₹{b.totalPrice || b.service?.price || 0}
                    </div>
                    <span className="text-[10px] text-slate-400">Fixed Rate</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                      disabled={actionLoading === b.id}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                      disabled={actionLoading === b.id}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs Section (Confirmed / In Progress) */}
      <div className="bg-slate-800/50 border border-slate-700/80 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Active Jobs in Progress</h2>
              <p className="text-xs text-slate-400">Jobs currently scheduled or underway</p>
            </div>
          </div>
        </div>

        {activeBookings.length === 0 ? (
          <div className="py-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            <Calendar size={32} className="mx-auto text-slate-500 mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-400">No active jobs right now</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Accepted bookings will appear here for execution and completion.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {b.service?.title || 'Service Booking'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.status === 'IN_PROGRESS'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500" />
                      {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-500" />
                      {b.location || b.customer?.address || 'Customer Location'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right mr-2">
                    <div className="text-base font-black text-emerald-400">
                      ₹{b.totalPrice || b.service?.price || 0}
                    </div>
                  </div>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Play size={13} /> Start Job
                    </button>
                  )}

                  {b.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Complete Job
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/provider/messages')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                    title="Message Customer"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operations Quick Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/provider/services')}
          className="p-6 bg-slate-800/40 border border-slate-700/80 rounded-3xl hover:bg-slate-800/70 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <Briefcase size={20} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Manage Service Offerings</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Add new repair or maintenance skills, update hourly rates, and toggle availability.
          </p>
        </div>

        <div
          onClick={() => navigate('/provider/availability')}
          className="p-6 bg-slate-800/40 border border-slate-700/80 rounded-3xl hover:bg-slate-800/70 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <Clock size={20} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Set Working Hours</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customize working days, shift slots, and break periods for automated customer booking.
          </p>
        </div>

        <div
          onClick={() => navigate('/provider/earnings')}
          className="p-6 bg-slate-800/40 border border-slate-700/80 rounded-3xl hover:bg-slate-800/70 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Payouts & Earnings</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review completed work settlements, track service commissions, and request payouts.
          </p>
        </div>
      </div>
    </div>
  );
};

