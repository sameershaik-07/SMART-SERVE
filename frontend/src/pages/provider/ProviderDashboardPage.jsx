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
  Phone,
  MapPin,
  Check,
  X,
  Play,
  Briefcase,
  Layers,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProviderDashboardApi, updateProviderProfileApi } from '../../api/providers';
import { getProviderBookingsApi, updateBookingStatusApi } from '../../api/bookings';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const metricTones = {
  coral: 'border-primary/20 bg-primary/8 text-primary',
  amber: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  teal: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  neutral: 'border-hairline bg-surface-soft text-body',
};

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
  const isError = /failed|could not|error/i.test(feedbackMsg);

  const metrics = [
    {
      key: 'revenue',
      label: 'Total revenue',
      icon: TrendingUp,
      tone: 'coral',
      value: (
        <>
          ₹<AnimatedNumber value={Number(stats.totalEarnings) || 0} />
        </>
      ),
      note: (
        <>
          <span className="font-medium text-primary">100%</span> paid directly to your wallet.
        </>
      ),
    },
    {
      key: 'requests',
      label: 'New requests',
      icon: Clock,
      tone: stats.pendingBookings > 0 ? 'amber' : 'neutral',
      value: (
        <span className="flex items-baseline gap-2">
          {stats.pendingBookings}
          {stats.pendingBookings > 0 && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-amber" />
          )}
        </span>
      ),
      note:
        stats.pendingBookings > 0
          ? 'Action needed — review incoming jobs.'
          : 'Everything responded to.',
      onClick: () => navigate('/provider/bookings'),
    },
    {
      key: 'completed',
      label: 'Completed jobs',
      icon: CheckCircle2,
      tone: 'teal',
      value: stats.completedBookings,
      note: `Out of ${stats.totalBookings} bookings in total.`,
    },
    {
      key: 'rating',
      label: 'Customer rating',
      icon: Star,
      tone: 'amber',
      value: (
        <span className="flex items-baseline gap-1.5">
          {Number(stats.averageRating || 4.8).toFixed(1)}
          <span className="font-sans text-xs font-normal text-muted-foreground">/ 5.0</span>
        </span>
      ),
      note: '★ Top 5% provider quality.',
    },
  ];

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Espresso hero with availability controls */}
      <Reveal>
        <section className="sh-dark-panel relative overflow-hidden rounded-xl">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-coral/20 blur-[110px]" />
          <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.1]" />
          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-coral">
                  <Briefcase size={12} /> Service partner dashboard
                </span>
                {stats.verified && (
                  <span className="inline-flex items-center gap-1 rounded-pill border border-accent-teal/25 bg-accent-teal/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-accent-teal">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-[clamp(2.3rem,4.6vw,3.2rem)] leading-[0.98] tracking-[-0.035em] text-on-dark">
                Hello, {user?.name || 'Partner'}.
              </h1>
              <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-on-dark-soft">
                Your day at a glance — pending requests, jobs underway, and the earnings they add up
                to. Keep your availability current so the right work finds you.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-on-dark-soft">
                <span className="flex items-center gap-1.5">
                  <Star size={11} className="fill-coral text-coral" />
                  {Number(stats.averageRating || 4.8).toFixed(1)} average rating
                </span>
                <span className="hidden h-3 w-px bg-white/12 sm:block" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={11} className="text-accent-teal" />
                  {stats.completedBookings} jobs completed
                </span>
                <span className="hidden h-3 w-px bg-white/12 sm:block" />
                <span className="flex items-center gap-1.5">
                  <Clock size={11} className="text-coral" />
                  {pendingBookings.length} awaiting a reply
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-md">
                <div className="text-right">
                  <span className="block text-[11px] font-medium text-on-dark">
                    {stats.availability ? 'Online & available' : 'Offline / on break'}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-on-dark-soft">
                    {stats.availability ? 'Receiving job alerts' : 'Hidden from new customers'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  aria-pressed={stats.availability}
                  aria-label="Toggle availability"
                  className={cn(
                    'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300',
                    stats.availability ? 'bg-coral' : 'bg-white/15'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 block h-4 w-4 rounded-full bg-canvas shadow-xs transition-transform duration-300',
                      stats.availability ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={loadDashboardData}
                title="Refresh data"
                aria-label="Refresh dashboard"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-on-dark-soft backdrop-blur-md transition-colors hover:text-on-dark"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Inline action feedback */}
      {feedbackMsg && (
        <div
          className={cn(
            'flex animate-fade-in items-center justify-between gap-3 rounded-md border px-4 py-3 text-xs font-medium',
            isError
              ? 'border-destructive/25 bg-destructive/8 text-destructive'
              : 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal'
          )}
        >
          <span className="flex items-center gap-2">
            {isError ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {feedbackMsg}
          </span>
          <button
            onClick={() => setFeedbackMsg('')}
            className="transition-opacity hover:opacity-70"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon, tone, value, note, onClick }, index) => (
          <Reveal key={key} delay={Math.min(index * 0.05, 0.2)}>
            <div
              onClick={onClick}
              className={cn(
                'group relative h-full overflow-hidden rounded-lg border border-hairline bg-card p-5 transition-all duration-300',
                onClick && 'cursor-pointer hover:-translate-y-0.5',
                'hover:border-ink/15 hover:shadow-[var(--shadow-soft)]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </span>
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
                    metricTones[tone]
                  )}
                >
                  <Icon size={16} strokeWidth={1.8} />
                </span>
              </div>

              <div className="mt-5 font-display text-[2.3rem] leading-none tracking-[-0.035em] text-ink">
                {value}
              </div>

              <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">{note}</p>

              {onClick && (
                <ArrowUpRight
                  size={13}
                  className="absolute bottom-5 right-5 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* Pending queue */}
      <Reveal delay={0.08}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent-amber/25 bg-accent-amber/8 text-accent-amber">
                <AlertTriangle size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                  Pending requests
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Accept or decline incoming customer bookings.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/provider/bookings')}
              className="flex items-center gap-1 text-[10px] font-medium text-primary transition-colors hover:text-primary-active"
            >
              View all ({bookings.length}) <ChevronRight size={13} />
            </button>
          </header>

          {pendingBookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent-teal/20 bg-accent-teal/8 text-accent-teal">
                <CheckCircle2 size={22} strokeWidth={1.7} />
              </span>
              <h3 className="mt-3 text-[13px] font-medium text-ink">No pending requests</h3>
              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                You’re all caught up. Keep availability on to receive new job alerts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hairline-soft">
              {pendingBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-surface-soft/30 sm:px-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-ink">
                        {b.service?.title || 'Service booking'}
                      </span>
                      <span className="rounded-pill border border-accent-amber/25 bg-accent-amber/8 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.08em] text-accent-amber">
                        Pending
                      </span>
                      <span className="rounded-xs border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                        #{b.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted-foreground/70" />
                        {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <MapPin size={12} className="shrink-0 text-muted-foreground/70" />
                        <span className="truncate">
                          {b.location || b.customer?.address || 'Customer location'}
                        </span>
                      </span>
                      {b.customer?.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="text-muted-foreground/70" />
                          {b.customer.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline-soft pt-3 md:justify-end md:border-t-0 md:pt-0">
                    <div className="text-right">
                      <div className="text-sm font-medium tabular-nums text-ink">
                        ₹{Number(b.totalPrice || b.service?.price || 0).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                        Fixed rate
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
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
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-2 text-[11px] font-medium text-body transition-all hover:border-destructive/30 hover:text-destructive active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                      >
                        <X size={13} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Active jobs */}
      <Reveal delay={0.12}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent-teal/20 bg-accent-teal/8 text-accent-teal">
                <Layers size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                  Jobs in progress
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Scheduled visits and work currently underway.
                </p>
              </div>
            </div>
            <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {activeBookings.length} active
            </span>
          </header>

          {activeBookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                <Calendar size={22} strokeWidth={1.7} />
              </span>
              <h3 className="mt-3 text-[13px] font-medium text-ink">No active jobs right now</h3>
              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                Accepted bookings will appear here so you can start, complete, and message customers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hairline-soft">
              {activeBookings.map((b) => {
                const inProgress = b.status === 'IN_PROGRESS';
                return (
                  <div
                    key={b.id}
                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-surface-soft/30 sm:px-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-medium text-ink">
                          {b.service?.title || 'Service booking'}
                        </span>
                        <span
                          className={cn(
                            'flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.08em]',
                            inProgress
                              ? 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal'
                              : 'border-primary/20 bg-primary/6 text-primary'
                          )}
                        >
                          {inProgress && <span className="h-1 w-1 animate-pulse rounded-full bg-current" />}
                          {b.status.replace('_', ' ')}
                        </span>
                        <span className="rounded-xs border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                          #{b.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-muted-foreground/70" />
                          {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex min-w-0 items-center gap-1.5">
                          <MapPin size={12} className="shrink-0 text-muted-foreground/70" />
                          <span className="truncate">
                            {b.location || b.customer?.address || 'Customer location'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-3 md:justify-end md:border-t-0 md:pt-0">
                      <div className="text-right">
                        <div className="text-sm font-medium tabular-nums text-ink">
                          ₹{Number(b.totalPrice || b.service?.price || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                          Fixed rate
                        </span>
                      </div>

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Play size={12} /> Start job
                        </button>
                      )}

                      {inProgress && (
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
                          Complete job
                        </button>
                      )}

                      <button
                        onClick={() => navigate('/provider/messages')}
                        className="rounded-md border border-hairline bg-canvas px-3 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
                        title="Message customer"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </Reveal>

      {/* Operations shortcuts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: Briefcase,
            tone: 'coral',
            title: 'Manage service offerings',
            copy: 'Add repair or maintenance skills, update rates, and toggle what you offer.',
            to: '/provider/services',
          },
          {
            icon: Clock,
            tone: 'teal',
            title: 'Set working hours',
            copy: 'Customise working days, shift slots, and breaks for automated booking.',
            to: '/provider/availability',
          },
          {
            icon: TrendingUp,
            tone: 'amber',
            title: 'Payouts & earnings',
            copy: 'Review completed work settlements, commissions, and request payouts.',
            to: '/provider/earnings',
          },
        ].map(({ icon: Icon, tone, title, copy, to }, index) => (
          <Reveal key={title} delay={0.16 + Math.min(index * 0.04, 0.12)}>
            <div
              onClick={() => navigate(to)}
              className="group flex h-full cursor-pointer flex-col rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-md border transition-colors',
                    metricTones[tone]
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <ArrowUpRight
                  size={15}
                  className="text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
              <h3 className="mt-5 text-[13px] font-medium text-ink">{title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
