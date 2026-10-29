import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  UserPlus,
  CalendarPlus,
  BarChart3,
  Settings,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { getAdminAnalyticsApi, getAdminBookingsApi } from '../../api/admin';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const metricTones = {
  coral: 'border-primary/20 bg-primary/8 text-primary',
  teal: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  amber: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  neutral: 'border-hairline bg-surface-soft text-body',
};

const statusStyles = {
  COMPLETED: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  CANCELLED: 'border-destructive/25 bg-destructive/8 text-destructive',
  PENDING: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  CONFIRMED: 'border-primary/20 bg-primary/6 text-primary',
  IN_PROGRESS: 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal',
};

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
          getAdminBookingsApi(),
        ]);
        setAnalytics(analyticsResponse?.data || analyticsResponse || mockAnalytics);
        setRecentBookings(
          Array.isArray(bookingsResponse?.data) ? bookingsResponse.data : bookingsResponse || []
        );
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
  const formatDateTime = (booking) =>
    new Date(booking.serviceDate || booking.createdAt).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const revenueRaw = stats.totalRevenue ?? stats.revenue ?? 0;
  const revenueNumber =
    Number(String(revenueRaw).replace(/[^\d.-]/g, '')) || 0;

  const metrics = [
    {
      label: 'Total bookings',
      icon: Calendar,
      tone: 'coral',
      value: Number(stats.totalBookings) || 0,
      note: 'Every booking placed on ServiceHub.',
    },
    {
      label: 'Active providers',
      icon: Users,
      tone: 'teal',
      value: Number(stats.activeProviders ?? stats.totalProviders) || 0,
      note: 'Verified professionals taking work.',
    },
    {
      label: 'Platform revenue',
      icon: TrendingUp,
      tone: 'amber',
      value: revenueNumber,
      prefix: '₹',
      note: 'Successful payments across the platform.',
    },
    {
      label: 'Pending verifications',
      icon: ShieldCheck,
      tone: 'neutral',
      value: Number(stats.pendingVerifications) || 0,
      note: 'Provider applications awaiting review.',
    },
  ];

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Admin command centre</p>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-accent-teal">
              <span className="h-1 w-1 animate-pulse rounded-full bg-accent-teal" /> Live platform
            </span>
          </div>
          <h1 className="workspace-title mt-2">Good morning, Admin.</h1>
          <p className="workspace-subtitle">
            Here’s what’s happening across ServiceHub today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-2 text-[10px] font-medium text-muted-foreground">
            <Calendar size={12} /> {dateLabel}
          </span>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[10px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98]"
          >
            <BarChart3 size={12} /> Open analytics
          </button>
        </div>
      </Reveal>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, icon: Icon, tone, value, prefix, note }, index) => (
          <Reveal key={label} delay={Math.min(index * 0.05, 0.2)}>
            <div className="group h-full rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]">
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
                {prefix}
                <AnimatedNumber value={value} />
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">{note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Recent bookings */}
        <Reveal delay={0.1} className="lg:col-span-8">
          <section className="overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                  Recent bookings
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  The latest service requests moving through the platform.
                </p>
              </div>
              <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {recentBookings.length} total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-hairline text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-5 py-3 font-medium sm:px-6">Booking</th>
                    <th className="px-3 py-3 font-medium">Service</th>
                    <th className="px-3 py-3 font-medium">Provider</th>
                    <th className="px-3 py-3 font-medium">Date & time</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium sm:px-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-soft text-[11px]">
                  {visibleBookings.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-surface-soft/30">
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[10px] text-primary sm:px-6">
                        #BK-{b.id}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-ink">
                        {b.service?.title || 'Service booking'}
                      </td>
                      <td className="px-3 py-3.5 text-body">
                        {b.provider?.user?.name || 'Unassigned'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                        {formatDateTime(b)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span
                          className={cn(
                            'inline-flex rounded-pill border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em]',
                            statusStyles[b.status] ||
                              'border-hairline bg-surface-soft text-muted-foreground'
                          )}
                        >
                          {(b.status || 'PENDING').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium tabular-nums text-ink sm:px-6">
                        ₹{Number(b.totalPrice || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {!loading && visibleBookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-14 text-center">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                          <Calendar size={19} strokeWidth={1.7} />
                        </span>
                        <p className="mt-2.5 text-[12px] font-medium text-ink">No bookings yet</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          New customer bookings will appear here.
                        </p>
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan="6" className="px-6 py-14 text-center">
                        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="mt-2 text-[10px] text-muted-foreground">Loading bookings…</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-5 py-3.5 text-[10px] text-muted-foreground sm:px-6">
              <span>
                {loading
                  ? 'Loading bookings…'
                  : `Showing ${visibleBookings.length} of ${recentBookings.length} bookings`}
              </span>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-active"
              >
                View all bookings <ArrowRight size={12} />
              </button>
            </div>
          </section>
        </Reveal>

        {/* Right rail */}
        <div className="space-y-5 lg:col-span-4">
          <Reveal delay={0.14}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex items-center justify-between gap-2 border-b border-hairline px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent-amber/25 bg-accent-amber/8 text-accent-amber">
                    <ShieldCheck size={14} strokeWidth={1.8} />
                  </span>
                  <h2 className="font-display text-[1.3rem] leading-tight tracking-[-0.02em] text-ink">
                    Verification queue
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/admin/providers')}
                  className="text-[10px] font-medium text-primary hover:text-primary-active"
                >
                  View all
                </button>
              </div>

              {mockQueue.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-accent-teal/20 bg-accent-teal/8 text-accent-teal">
                    <CheckCircle2 size={18} strokeWidth={1.7} />
                  </span>
                  <p className="mt-2.5 text-[12px] font-medium text-ink">Queue is clear</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    No provider applications are waiting for review right now.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-hairline-soft">
                  {mockQueue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={item.avatar}
                          alt=""
                          className="h-9 w-9 rounded-md border border-hairline object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="truncate text-[11px] font-medium text-ink">{item.name}</h4>
                          <span className="block truncate text-[9px] text-muted-foreground">
                            {item.category} · {item.time}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/admin/providers')}
                        className="shrink-0 rounded-md border border-hairline bg-canvas px-2.5 py-1 text-[9px] font-medium text-body transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-hairline bg-surface-soft/30 px-5 py-3">
                <button
                  onClick={() => navigate('/admin/providers')}
                  className="flex w-full items-center justify-between gap-2 text-[10px] font-medium text-body transition-colors hover:text-primary"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} className="text-accent-amber" />
                    {Number(stats.pendingVerifications) || 0} providers pending verification
                  </span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.18}>
            <section className="rounded-lg border border-hairline bg-card p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/8 text-primary">
                  <Sparkles size={14} strokeWidth={1.8} />
                </span>
                <h2 className="font-display text-[1.3rem] leading-tight tracking-[-0.02em] text-ink">
                  Quick actions
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  { icon: UserPlus, label: 'Verify provider', to: '/admin/providers', tone: 'text-primary' },
                  { icon: CalendarPlus, label: 'Search bookings', to: '/admin/bookings', tone: 'text-accent-teal' },
                  { icon: BarChart3, label: 'View analytics', to: '/admin/analytics', tone: 'text-accent-amber' },
                  { icon: Settings, label: 'Platform settings', to: '/admin/settings', tone: 'text-body' },
                ].map(({ icon: Icon, label, to, tone }) => (
                  <button
                    key={label}
                    onClick={() => navigate(to)}
                    className="group flex flex-col items-center justify-center gap-2 rounded-md border border-hairline bg-surface-soft/40 px-3 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:bg-surface-soft"
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.7}
                      className={cn('transition-transform group-hover:scale-110', tone)}
                    />
                    <span className="text-[10px] font-medium text-body">{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.22}>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="sh-dark-panel group relative block w-full overflow-hidden rounded-lg p-5 text-left"
            >
              <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-coral/18 blur-[60px]" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-coral">Reports</span>
                  <p className="mt-1.5 font-display text-[1.25rem] leading-tight text-on-dark">
                    Read the week in full
                  </p>
                  <p className="mt-1 text-[10px] text-on-dark-soft">
                    Bookings, revenue, and payment trends.
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-on-dark transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
