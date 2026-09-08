import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { createReviewApi } from '../../api/reviews';
import { getCustomerBookingsApi } from '../../api/bookings';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      serviceName: 'AC Repair & Service',
      providerName: 'CoolTech Services',
      rating: 5,
      comment: 'Excellent service! The technician arrived right on time and cleaned the AC thoroughly.',
      date: 'May 22, 2024',
      verified: true,
    },
    {
      id: 2,
      serviceName: 'Deep Cleaning',
      providerName: 'Cleanify Experts',
      rating: 4,
      comment: 'Good cleaning overall. Took a bit longer than estimated but very detailed.',
      date: 'May 16, 2024',
      verified: true,
    },
  ]);

  const [completedBookings, setCompletedBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');

  // Fetch completed bookings so user can select an actual completed booking to review
  useEffect(() => {
    const loadCompletedBookings = async () => {
      try {
        const res = await getCustomerBookingsApi();
        const list = res.data || res.bookings || (Array.isArray(res) ? res : []);
        const completed = list.filter((b) => b.status === 'COMPLETED');
        setCompletedBookings(completed);
        if (completed.length > 0) {
          setSelectedBookingId(String(completed[0].id));
        }
      } catch (err) {
        console.warn('Could not fetch user bookings for review picker:', err);
      }
    };
    loadCompletedBookings();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    const bId = Number(selectedBookingId);
    if (!bId) {
      setModalError('Please select a completed booking to review.');
      setSubmitting(false);
      return;
    }

    try {
      await createReviewApi({
        bookingId: bId,
        rating: newRating,
        comment: newComment.trim(),
      });

      const selectedB = completedBookings.find((b) => b.id === bId);
      const added = {
        id: Date.now(),
        serviceName: selectedB?.service?.title || selectedB?.serviceName || 'Verified Service',
        providerName: selectedB?.provider?.name || selectedB?.providerName || 'Service Specialist',
        rating: newRating,
        comment: newComment.trim(),
        date: 'Just now',
        verified: true,
      };

      setReviews([added, ...reviews]);
      setIsWriteOpen(false);
      setNewComment('');
      setFeedbackNotice('Thank you! Your verified review has been published.');
      setTimeout(() => setFeedbackNotice(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Could not submit review. Note: only completed bookings can be reviewed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Reviews & Ratings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Verified feedback you provided to service professionals.</p>
        </div>
        <Button onClick={() => setIsWriteOpen(true)} variant="primary" icon={MessageSquare}>
          Write Review
        </Button>
      </div>

      {feedbackNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="sh-card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">{r.serviceName}</h3>
                  {r.verified && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-600" /> Verified Booking
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">Provider: {r.providerName}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{r.date}</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                />
              ))}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-medium">
              "{r.comment}"
            </p>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      <Modal isOpen={isWriteOpen} onClose={() => setIsWriteOpen(false)} title="Write a Service Review">
        <form onSubmit={handleAddReview} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Booking Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Completed Service</label>
            {completedBookings.length > 0 ? (
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:border-purple-600 outline-none"
                required
              >
                {completedBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    Booking #{b.id} - {b.service?.title || b.serviceName || 'Home Service'} ({b.provider?.name || 'Provider'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="font-bold">No completed bookings found.</span> Once a service appointment is marked completed, you will be able to review the specialist.
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1.5 hover:scale-110 transition-transform"
                >
                  <Star
                    size={26}
                    className={star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Detailed Feedback</label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe technician professionalism, quality of work, and timeliness..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:bg-white focus:border-purple-600 outline-none"
              required
            ></textarea>
          </div>

          <Button type="submit" fullWidth disabled={submitting || (completedBookings.length === 0)}>
            {submitting ? 'Publishing...' : 'Submit Verified Review'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
