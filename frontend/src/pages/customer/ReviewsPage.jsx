import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, AlertCircle, Quote } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { createReviewApi } from '../../api/reviews';
import { getCustomerBookingsApi } from '../../api/bookings';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

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
      setModalError(
        err.message || 'Could not submit review. Note: only completed bookings can be reviewed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-[1000px] animate-fade-in space-y-6 pb-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Your voice, on the record</p>
          <h1 className="workspace-title mt-2">Reviews & ratings</h1>
          <p className="workspace-subtitle">
            Verified feedback you’ve shared with the professionals who’ve worked in your home.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-2 sm:flex">
            <Star size={14} className="fill-accent-amber text-accent-amber" />
            <span className="text-sm font-medium tabular-nums text-ink">
              {average.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted-foreground">avg. given</span>
          </div>
          <Button onClick={() => setIsWriteOpen(true)} icon={MessageSquare} size="sm">
            Write a review
          </Button>
        </div>
      </Reveal>

      {feedbackNotice && (
        <div className="flex animate-fade-in items-center gap-2.5 rounded-md border border-accent-teal/25 bg-accent-teal/8 px-4 py-3 text-xs font-medium text-accent-teal">
          <CheckCircle2 size={15} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      <div className="space-y-3.5">
        {reviews.map((r, index) => (
          <Reveal key={r.id} delay={Math.min(index * 0.05, 0.2)}>
            <article className="group rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:border-ink/15 hover:shadow-[var(--shadow-soft)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-[1.45rem] leading-tight tracking-[-0.02em] text-ink">
                      {r.serviceName}
                    </h2>
                    {r.verified && (
                      <span className="flex items-center gap-1 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-accent-teal">
                        <CheckCircle2 size={10} /> Verified booking
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    with <span className="font-medium text-body">{r.providerName}</span>
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {r.date}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < r.rating
                        ? 'fill-accent-amber text-accent-amber'
                        : 'text-hairline'
                    }
                  />
                ))}
                <span className="ml-2 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {r.rating}.0
                </span>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-md border border-hairline-soft bg-surface-soft/50 p-4">
                <Quote size={14} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-[12.5px] leading-relaxed text-body">{r.comment}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isWriteOpen}
        onClose={() => setIsWriteOpen(false)}
        title="Write a service review"
        description="Share how the visit went. Reviews are tied to completed bookings."
      >
        <form onSubmit={handleAddReview} className="space-y-4">
          {modalError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/6 p-3 text-xs font-medium text-destructive">
              <AlertCircle size={14} className="shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Booking Selector */}
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Completed service
            </label>
            {completedBookings.length > 0 ? (
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="h-11 w-full cursor-pointer rounded-md border border-input bg-canvas px-3 text-xs text-ink outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/15"
                required
              >
                {completedBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    Booking #{b.id} — {b.service?.title || b.serviceName || 'Home service'} (
                    {b.provider?.name || 'Provider'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-md border border-accent-amber/25 bg-accent-amber/8 p-3 text-xs leading-relaxed text-accent-amber">
                <span className="font-medium">No completed bookings found.</span> Once a service is
                marked completed, you’ll be able to review the specialist here.
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Rating
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className={cn(
                    'rounded-sm p-1.5 transition-transform hover:scale-110',
                    star <= newRating ? 'text-accent-amber' : 'text-hairline'
                  )}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                >
                  <Star
                    size={24}
                    className={star <= newRating ? 'fill-accent-amber' : 'fill-transparent'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Your feedback
            </label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe the technician’s professionalism, quality of work, and timeliness…"
              className="w-full rounded-md border border-input bg-canvas p-3.5 text-xs leading-relaxed text-ink outline-hidden placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={submitting || completedBookings.length === 0}
          >
            {submitting ? 'Publishing…' : 'Submit verified review'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
