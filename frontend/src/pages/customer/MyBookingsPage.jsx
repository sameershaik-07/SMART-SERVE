import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ChevronRight, RefreshCw, Navigation } from 'lucide-react';
import { getCustomerBookingsApi, getProviderBookingsApi, updateBookingStatusApi } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState('2024-05-25');
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

        const res = user?.role === 'PROVIDER' 
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

  const statusVariants = {
    COMPLETED: 'success',
    ACCEPTED: 'info',
    PENDING: 'warning',
    CANCELLED: 'danger',
    REJECTED: 'danger',
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage, reschedule, and track your service appointments.</p>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-800 rounded-2xl text-xs font-bold animate-fade-in flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-purple-600 hover:text-purple-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              statusFilter === tab
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="Your bookings will appear here once you reserve a service."
          actionLabel="Browse Services"
          onAction={() => navigate('/services')}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="sh-card p-5 flex flex-wrap items-center justify-between gap-4 bg-white hover:border-purple-200 transition-all cursor-pointer"
              onClick={() => navigate(`/bookings/${b.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-purple-100 shrink-0">
                  #{b.id}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{b.serviceName || b.service?.title || 'Service'}</h3>
                  <p className="text-xs text-slate-500 font-medium">Provider: {b.providerName || b.provider?.user?.name || 'ServiceHub Pro'}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Clock size={12} /> {b.date || 'Today'}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {b.location || 'Bengaluru'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 block">₹{b.amount || b.totalPrice || 599}</span>
                  <Badge variant={statusVariants[b.status] || 'neutral'}>{b.status}</Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/bookings/${b.id}`);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-sm"
                    title="View dual location tracking map"
                  >
                    <Navigation size={12} className="text-emerald-600" />
                    Track on Map
                  </button>

                  {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRescheduleBooking(b);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl border border-purple-200 transition-colors flex items-center gap-1"
                        title="Reschedule booking"
                      >
                        <RefreshCw size={12} /> Reschedule
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelBooking(b.id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={Boolean(rescheduleBooking)}
        onClose={() => setRescheduleBooking(null)}
        title={`Reschedule Booking #${rescheduleBooking?.id}`}
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select New Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:border-purple-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Time Slot</label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:border-purple-600 outline-none"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:30 AM">10:30 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth loading={isSubmittingReschedule}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
