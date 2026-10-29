import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  MessageSquare,
  Search,
  RefreshCw,
  User,
  ArrowUpRight,
} from 'lucide-react';
import { getProviderBookingsApi, updateBookingStatusApi } from '../../api/bookings';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const statusStyles = {
  PENDING: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  CONFIRMED: 'border-primary/20 bg-primary/6 text-primary',
  IN_PROGRESS: 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal',
  COMPLETED: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  CANCELLED: 'border-destructive/25 bg-destructive/8 text-destructive',
};

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
    { key: 'ALL', label: 'All jobs', count: counts.ALL },
    { key: 'PENDING', label: 'Pending', count: counts.PENDING, highlight: counts.PENDING > 0 },
    { key: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED },
    { key: 'IN_PROGRESS', label: 'In progress', count: counts.IN_PROGRESS },
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
    const base =
      'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em]';
    switch (status) {
      case 'PENDING':
        return (
          <span className={cn(base, statusStyles.PENDING)}>
            <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
            Pending confirmation
          </span>
        );
      case 'CONFIRMED':
        return <span className={cn(base, statusStyles.CONFIRMED)}>Confirmed</span>;
      case 'IN_PROGRESS':
        return (
          <span className={cn(base, statusStyles.IN_PROGRESS)}>
            <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
            In progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={cn(base, statusStyles.COMPLETED)}>
            <CheckCircle2 size={10} />
            Completed
          </span>
        );
      case 'CANCELLED':
        return <span className={cn(base, statusStyles.CANCELLED)}>Cancelled</span>;
      default:
        return (
          <span className={cn(base, 'border-hairline bg-surface-soft text-muted-foreground')}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Your appointment book</p>
          <h1 className="workspace-title mt-2">Jobs & appointments</h1>
          <p className="workspace-subtitle">
            Review incoming requests, run active visits, and keep every completion on record.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3.5 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh list
        </button>
      </Reveal>

      {/* Inline feedback */}
      {feedback.msg && (
        <div
          className={cn(
            'flex animate-fade-in items-center justify-between gap-3 rounded-md border px-4 py-3 text-xs font-medium',
            feedback.type === 'error'
              ? 'border-destructive/25 bg-destructive/8 text-destructive'
              : 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal'
          )}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertTriangle size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            {feedback.msg}
          </span>
          <button
            onClick={() => setFeedback({ type: '', msg: '' })}
            className="transition-opacity hover:opacity-70"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & status filters */}
      <Reveal delay={0.04} className="space-y-4">
        <div className="relative max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, service, or location…"
            className="h-10 w-full rounded-md border border-hairline bg-canvas pl-10 pr-4 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-hairline pb-3">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSearchParams({ tab: tab.key })}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-pill border px-3.5 py-1.5 text-[11px] font-medium transition-all',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-hairline bg-card text-muted-foreground hover:border-ink/20 hover:text-ink'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-pill px-1.5 py-0.5 text-[9px] tabular-nums',
                    active
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : tab.highlight
                        ? 'bg-accent-amber/15 font-medium text-accent-amber'
                        : 'bg-surface-soft text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Bookings */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[11px] text-muted-foreground">Loading appointments…</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-card/50 px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
            <Calendar size={22} strokeWidth={1.7} />
          </span>
          <h3 className="mt-3 text-[13px] font-medium text-ink">No bookings found</h3>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
            {searchQuery
              ? `No results matching “${searchQuery}” in ${activeTab.toLowerCase().replace('_', ' ')} jobs.`
              : 'There are currently no bookings in this status.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((b, index) => (
            <Reveal key={b.id} delay={Math.min(index * 0.03, 0.15)}>
              <article className="group overflow-hidden rounded-lg border border-hairline bg-card transition-all duration-300 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]">
                {/* Card header */}
                <div className="flex flex-col gap-3 border-b border-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/6 font-mono text-[10px] font-medium text-primary">
                      #{b.id}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink">
                        {b.service?.title || 'Home service'}
                      </h3>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        Booked on{' '}
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {getStatusBadge(b.status)}
                    <div className="text-right">
                      <div className="text-sm font-medium tabular-nums text-ink">
                        ₹{Number(b.totalPrice || b.service?.price || 0).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                        {b.payment?.method
                          ? `${b.payment.method} (${b.payment.status})`
                          : 'Pay on service'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body details */}
                <div className="grid grid-cols-1 gap-3 p-5 sm:p-6 md:grid-cols-3">
                  <div className="rounded-md border border-hairline bg-surface-soft/40 p-3.5">
                    <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <User size={11} className="text-primary" /> Customer
                    </span>
                    <div className="mt-1.5 text-[12px] font-medium text-ink">
                      {b.customer?.user?.name || 'Customer'}
                    </div>
                    {b.customer?.user?.phone && (
                      <a
                        href={`tel:${b.customer.user.phone}`}
                        className="mt-1 flex items-center gap-1 text-[10px] font-medium text-primary transition-colors hover:text-primary-active"
                      >
                        <Phone size={11} /> {b.customer.user.phone}
                      </a>
                    )}
                  </div>

                  <div className="rounded-md border border-hairline bg-surface-soft/40 p-3.5">
                    <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <Clock size={11} className="text-accent-teal" /> Appointment slot
                    </span>
                    <div className="mt-1.5 text-[12px] font-medium text-ink">
                      {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                      {new Date(b.scheduledAt || b.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="rounded-md border border-hairline bg-surface-soft/40 p-3.5">
                    <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <MapPin size={11} className="text-accent-amber" /> Service destination
                    </span>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-body">
                      {b.location || b.customer?.address || 'Customer provided address on booking.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft bg-surface-soft/30 px-5 py-3.5 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => navigate('/provider/messages')}
                      className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
                    >
                      <MessageSquare size={12} /> Chat with customer
                    </button>

                    {(b.location || b.customer?.address) && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          b.location || b.customer?.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-soft hover:text-primary"
                      >
                        <MapPin size={12} /> Open in maps <ArrowUpRight size={11} />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {b.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                        >
                          {actionLoading === b.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Check size={13} />
                          )}
                          Accept booking
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-2 text-[11px] font-medium text-body transition-all hover:border-destructive/30 hover:text-destructive active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                        >
                          <X size={13} /> Decline
                        </button>
                      </>
                    )}

                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                      >
                        <Play size={12} /> Start service
                      </button>
                    )}

                    {b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 rounded-md border border-accent-teal/25 bg-accent-teal/8 px-3.5 py-2 text-[11px] font-medium text-accent-teal transition-all hover:bg-accent-teal/12 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                      >
                        {actionLoading === b.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Mark as completed
                      </button>
                    )}

                    {b.status === 'COMPLETED' && (
                      <span className="flex items-center gap-1 rounded-md border border-accent-teal/20 bg-accent-teal/8 px-3 py-1.5 text-[10px] font-medium text-accent-teal">
                        <CheckCircle2 size={12} /> Payment settled
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
};
