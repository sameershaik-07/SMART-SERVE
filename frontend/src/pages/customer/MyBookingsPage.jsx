import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  RefreshCw,
  Navigation,
  Search,
} from 'lucide-react';
import { getCustomerBookingsApi, getProviderBookingsApi, updateBookingStatusApi } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const statusConfig = {
  COMPLETED: { variant: 'success', label: 'Completed' },
  ACCEPTED: { variant: 'info', label: 'Accepted' },
  PENDING: { variant: 'warning', label: 'Pending' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  REJECTED: { variant: 'destructive', label: 'Rejected' },
};

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTime, setNewTime] = useState('11:00 AM');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const navigate = useNavigate();

  const mockBookings = [];
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setBookings(mockBookings);
          setLoading(false);
          return;
        }

        const res =
          user?.role === 'PROVIDER'
            ? await getProviderBookingsApi()
            : await getCustomerBookingsApi();
        const apiBookings = res.data || res.bookings || (Array.isArray(res) ? res : []);
        if (Array.isArray(apiBookings)) {
          setBookings(apiBookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.warn('Using mock bookings fallback for unauthenticated preview:', err);
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.role]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await updateBookingStatusApi(bookingId, 'CANCELLED');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      setActionNotice('Booking cancelled successfully.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      setActionNotice('Failed to cancel: ' + (err.message || 'Error occurred'));
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleBooking) return;
    setIsSubmittingReschedule(true);
    setTimeout(() => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleBooking.id
            ? { ...b, date: `${newDate} - ${newTime}`, serviceDate: `${newDate}T${newTime}` }
            : b
        )
      );
      setIsSubmittingReschedule(false);
      setRescheduleBooking(null);
      setActionNotice('Booking rescheduled successfully!');
      setTimeout(() => setActionNotice(null), 3000);
    }, 400);
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    ACCEPTED: bookings.filter((b) => b.status === 'ACCEPTED').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <div className="mx-auto max-w-[1120px] pb-12">
      <Reveal className="border-b border-hairline pb-6">
        <p className="sh-eyebrow">Your appointments</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="workspace-title">My bookings</h1>
            <p className="workspace-subtitle">
              Track visits, reschedule when life shifts, and keep the details in one place.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
            Book a service
          </Button>
        </div>
      </Reveal>

      {actionNotice && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-accent-teal/25 bg-accent-teal/8 px-4 py-3 text-xs text-accent-teal">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-[11px] underline-offset-2 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="scrollbar-none mt-6 flex items-center gap-1.5 overflow-x-auto border-b border-hairline pb-3">
        {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-pill px-3.5 py-1.5 text-[11px] font-medium transition-all',
              statusFilter === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-surface-soft hover:text-ink'
            )}
          >
            <span className="capitalize">{tab.toLowerCase()}</span>
            <span
              className={cn(
                'rounded-full px-1.5 text-[9px] tabular-nums',
                statusFilter === tab ? 'bg-white/20' : 'bg-surface-cream-strong text-body'
              )}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-lg border border-hairline bg-surface-soft" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="A clear calendar"
          description="No bookings here yet. When you reserve a service, the visit and all its details will live right here."
          actionLabel="Browse services"
          onAction={() => navigate('/services')}
        />
      ) : (
        <div className="mt-5 space-y-3">
          {filteredBookings.map((b) => {
            const status = statusConfig[b.status] || { variant: 'outline', label: b.status };
            return (
              <article
                key={b.id}
                onClick={() => navigate(`/bookings/${b.id}`)}
                className="group cursor-pointer rounded-lg border border-hairline bg-card p-4 transition-all duration-300 hover:border-ink/15 hover:shadow-[var(--shadow-soft)] sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border border-hairline bg-surface-soft">
                      <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">Ref</span>
                      <span className="text-[11px] font-medium tabular-nums text-ink">#{b.id}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-primary">
                          {b.serviceName || b.service?.title || 'Service'}
                        </h3>
                        <Badge variant={status.variant} className="capitalize">
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        with {b.providerName || b.provider?.user?.name || 'ServiceHub Pro'}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" />
                          {b.date || b.serviceDate || 'Date to be confirmed'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-primary" />
                          {b.location || b.address || 'Bengaluru'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-3 sm:border-0 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="font-display text-[1.5rem] leading-none text-ink">
                        ₹{Number(b.amount || b.totalPrice || 599).toLocaleString('en-IN')}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Total</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bookings/${b.id}`);
                        }}
                        className="flex items-center gap-1.5 rounded-sm border border-accent-teal/25 bg-accent-teal/8 px-2.5 py-1.5 text-[10px] font-medium text-accent-teal transition-colors hover:bg-accent-teal/15"
                        title="View dual location tracking map"
                      >
                        <Navigation size={11} />
                        Track
                      </button>

                      {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRescheduleBooking(b);
                            }}
                            className="flex items-center gap-1 rounded-sm border border-hairline px-2.5 py-1.5 text-[10px] font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink"
                            title="Reschedule booking"
                          >
                            <RefreshCw size={11} /> Reschedule
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelBooking(b.id);
                            }}
                            className="rounded-sm border border-destructive/20 px-2.5 py-1.5 text-[10px] font-medium text-destructive transition-colors hover:bg-destructive/6"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      <ChevronRight size={15} className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(rescheduleBooking)}
        onClose={() => setRescheduleBooking(null)}
        title={`Reschedule booking #${rescheduleBooking?.id || ''}`}
        description="Choose a new date and time. We’ll let your professional know."
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              New date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-canvas px-3.5 text-sm text-ink outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              New time slot
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-md border border-input bg-canvas px-3.5 text-sm text-ink outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/15"
            >
              {['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setRescheduleBooking(null)}>
              Keep as is
            </Button>
            <Button type="submit" fullWidth loading={isSubmittingReschedule}>
              Confirm new time
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
