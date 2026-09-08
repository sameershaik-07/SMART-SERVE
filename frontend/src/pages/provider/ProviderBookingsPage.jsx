import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  User,
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { getProviderBookingsApi, updateBookingStatusApi } from '../../api/bookings';

export const ProviderBookingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'ALL';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getProviderBookingsApi();
      const list = Array.isArray(res) ? res : res.bookings || [];
      setBookings(list);
    } catch (err) {
      console.warn('Could not load provider bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, nextStatus) => {
    try {
      setActionLoading(bookingId);
      setFeedback({ type: '', msg: '' });
      await updateBookingStatusApi(bookingId, nextStatus);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
      );

      setFeedback({
        type: 'success',
        msg: `Booking #${bookingId} successfully updated to ${nextStatus.replace('_', ' ')}!`,
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.message || 'Failed to update booking status.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Counts per tab
  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    IN_PROGRESS: bookings.filter((b) => b.status === 'IN_PROGRESS').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  const tabs = [
    { key: 'ALL', label: 'All Jobs', count: counts.ALL },
    { key: 'PENDING', label: 'Pending', count: counts.PENDING, highlight: counts.PENDING > 0 },
    { key: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED },
    { key: 'IN_PROGRESS', label: 'In Progress', count: counts.IN_PROGRESS },
    { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
    { key: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED },
  ];

  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === 'ALL' || b.status === activeTab;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTab;

    const customerName = b.customer?.user?.name?.toLowerCase() || '';
    const serviceTitle = b.service?.title?.toLowerCase() || '';
    const location = (b.location || b.customer?.address || '').toLowerCase();
    const id = String(b.id);

    return (
      matchesTab &&
      (customerName.includes(query) ||
        serviceTitle.includes(query) ||
        location.includes(query) ||
        id.includes(query))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Confirmation
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Confirmed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Job Requests & Appointments
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Review incoming requests, manage active jobs, and track service completions.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Inline Feedback Banner */}
      {feedback.msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
          }`}
        >
          <span>{feedback.msg}</span>
          <button
            onClick={() => setFeedback({ type: '', msg: '' })}
            className="hover:opacity-80"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & Tabs Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, service, or location..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-500 text-slate-900 font-black'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-semibold">Loading appointments...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-20 text-center bg-slate-800/30 border border-slate-800 rounded-3xl space-y-3">
          <Calendar size={40} className="mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No results matching "${searchQuery}" in ${activeTab.toLowerCase()} jobs.`
              : `There are currently no bookings in this status.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 hover:border-slate-600 transition-all space-y-4"
            >
              {/* Header: Service + Status + Price */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-black text-xs">
                    #{b.id}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">
                      {b.service?.title || 'Home Service'}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Booked on {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(b.status)}
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400">
                      ₹{b.totalPrice || b.service?.price || 0}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {b.payment?.method ? `${b.payment.method} (${b.payment.status})` : 'Pay on Service'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Body Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer Contact */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-emerald-400" /> Customer
                  </span>
                  <div className="font-bold text-white text-sm">
                    {b.customer?.user?.name || 'Customer'}
                  </div>
                  {b.customer?.user?.phone && (
                    <a
                      href={`tel:${b.customer.user.phone}`}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <Phone size={12} /> {b.customer.user.phone}
                    </a>
                  )}
                </div>

                {/* Scheduled Time */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-indigo-400" /> Appointment Slot
                  </span>
                  <div className="font-bold text-white">
                    {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-slate-400">
                    {new Date(b.scheduledAt || b.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Service Address / Map */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} className="text-amber-400" /> Service Destination
                  </span>
                  <p className="text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {b.location || b.customer?.address || 'Customer provided address on booking.'}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/provider/messages')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={13} /> Chat with Customer
                  </button>

                  {(b.location || b.customer?.address) && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(b.location || b.customer?.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <MapPin size={13} /> Open in Maps <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>

                {/* Dynamic Status Action Controls */}
                <div className="flex items-center gap-2">
                  {b.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                        disabled={actionLoading === b.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                      >
                        <Check size={14} /> Accept Booking
                      </button>
                      <button
                        onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                        disabled={actionLoading === b.id}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <X size={14} /> Decline
                      </button>
                    </>
                  )}

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Play size={13} /> Start Service
                    </button>
                  )}

                  {b.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Mark as Completed
                    </button>
                  )}

                  {b.status === 'COMPLETED' && (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 size={14} /> Payment Settled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

