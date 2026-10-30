import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Search, Calendar, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { getAdminBookingsApi } from '../../api/admin';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const statusStyles = {
  COMPLETED: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  CANCELLED: 'border-destructive/25 bg-destructive/8 text-destructive',
  PENDING: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  CONFIRMED: 'border-primary/20 bg-primary/6 text-primary',
  ACCEPTED: 'border-primary/20 bg-primary/6 text-primary',
  IN_PROGRESS: 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal',
};

export const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminBookingsApi()
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : res;
        if (Array.isArray(rows)) {
          const mapped = rows.map((b) => ({
            id: b.id,
            displayId: `#BK-${b.id}`,
            service: b.service?.title || 'Home Service',
            customer: b.customer?.user?.name || `Customer #${b.customerId}`,
            provider: b.provider?.user?.name || `Provider #${b.providerId}`,
            date: new Date(b.serviceDate || b.createdAt).toLocaleDateString(),
            status: b.status,
            amount: `₹${b.totalPrice || 799}`,
            location: b.location || 'Bengaluru',
          }));
          setBookings(mapped);
        }
      })
      .catch((e) => {
        setError(e.message || 'Unable to load bookings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(
    (b) =>
      b.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inProgressCount = bookings.filter(
    (b) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED' || b.status === 'ACCEPTED'
  ).length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const stats = [
    { label: 'Total bookings', value: bookings.length, icon: Calendar, tone: 'text-primary', bg: 'border-primary/20 bg-primary/8' },
    { label: 'In progress', value: inProgressCount, icon: Clock, tone: 'text-accent-teal', bg: 'border-accent-teal/20 bg-accent-teal/8' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, tone: 'text-accent-teal', bg: 'border-accent-teal/20 bg-accent-teal/8' },
  ];

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Platform oversight</p>
          <h1 className="workspace-title mt-2">Booking management</h1>
          <p className="workspace-subtitle">
            Real-time monitoring for every service request, customer, and provider.
          </p>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search bookings…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-64 rounded-md border border-hairline bg-canvas pl-10 pr-4 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>
      </Reveal>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone, bg }, index) => (
          <Reveal key={label} delay={0.04 + Math.min(index * 0.04, 0.1)}>
            <div className="flex h-full items-center gap-3.5 rounded-lg border border-hairline bg-card p-4">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                  bg,
                  tone
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
                  <AnimatedNumber value={value} />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      <Reveal delay={0.1}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                All bookings
              </h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {filtered.length} of {bookings.length} appointments shown.
              </p>
            </div>
            <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Live oversight
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-left sm:min-w-[860px]">
              <thead>
                <tr className="border-b border-hairline text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium sm:px-6">Booking</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">Service</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">Provider</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="hidden px-3 py-3 text-right font-medium sm:table-cell">Amount</th>
                  <th className="px-5 py-3 text-right font-medium sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-[11px]">
                {filtered.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-surface-soft/30">
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[10px] text-primary sm:px-6">
                      {b.displayId}
                    </td>
                    <td className="hidden px-3 py-3.5 font-medium text-ink md:table-cell">{b.service}</td>
                    <td className="px-3 py-3.5 text-body">{b.customer}</td>
                    <td className="hidden px-3 py-3.5 text-body md:table-cell">{b.provider}</td>
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
                    <td className="hidden whitespace-nowrap px-3 py-3.5 text-right font-medium tabular-nums text-ink sm:table-cell">
                      {b.amount}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right sm:px-6">
                      <button
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-2.5 py-1.5 text-[9px] font-medium text-body transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98]"
                      >
                        <Navigation size={10} />
                        Live map
                        <ArrowUpRight size={9} />
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                        <Calendar size={19} strokeWidth={1.7} />
                      </span>
                      <p className="mt-2.5 text-[12px] font-medium text-ink">
                        {error ? 'Bookings unavailable' : 'No bookings found'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {searchTerm
                          ? `Nothing matches “${searchTerm}”. Try a different search.`
                          : 'New customer bookings will appear here.'}
                      </p>
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="mt-2 text-[10px] text-muted-foreground">Loading bookings…</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
};
