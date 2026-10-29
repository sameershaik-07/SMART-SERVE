import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { getMySlotsApi, createSlotApi, deleteSlotApi } from '../../api/availability';
import { getProviderDashboardApi, updateProviderProfileApi } from '../../api/providers';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-canvas px-3.5 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15';

const labelClass =
  'mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground';

const sectionIcon =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary';

export const ProviderAvailabilityPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingLive, setTogglingLive] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Single Slot Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [addingSlot, setAddingSlot] = useState(false);

  // Quick Preset Generator
  const [activeDays, setActiveDays] = useState({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: false,
  });
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [slotDurationHours, setSlotDurationHours] = useState(2);
  const [generatingBulk, setGeneratingBulk] = useState(false);

  const fetchAvailabilityData = async () => {
    try {
      setLoading(true);
      const [slotsRes, dashboardRes] = await Promise.allSettled([
        getMySlotsApi(),
        getProviderDashboardApi(),
      ]);

      if (slotsRes.status === 'fulfilled') {
        const list = Array.isArray(slotsRes.value) ? slotsRes.value : [];
        setSlots(list);
      }

      if (dashboardRes.status === 'fulfilled' && dashboardRes.value) {
        setIsAvailable(dashboardRes.value.availability ?? true);
      }
    } catch (err) {
      console.warn('Could not load availability slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  const handleMasterToggle = async () => {
    try {
      setTogglingLive(true);
      const next = !isAvailable;
      setIsAvailable(next);
      await updateProviderProfileApi({ availability: next });
      setFeedback({
        type: 'success',
        msg: `Your partner status is now ${next ? 'Live & Accepting Orders' : 'Paused / Offline'}.`,
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
    } catch (err) {
      setIsAvailable(!isAvailable);
      setFeedback({ type: 'error', msg: 'Failed to update live status.' });
    } finally {
      setTogglingLive(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedDate || !startTime || !endTime) {
      setFeedback({ type: 'error', msg: 'Please specify date, start time, and end time.' });
      return;
    }

    if (startTime >= endTime) {
      setFeedback({ type: 'error', msg: 'End time must be later than start time.' });
      return;
    }

    try {
      setAddingSlot(true);
      setFeedback({ type: '', msg: '' });

      const res = await createSlotApi({
        date: selectedDate,
        startTime,
        endTime,
      });

      const newSlot = res.slot || res;
      setSlots((prev) => [...prev, newSlot]);
      setFeedback({
        type: 'success',
        msg: `Slot added for ${selectedDate} (${startTime} - ${endTime})!`,
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Slot already exists or failed to create.' });
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteSlotApi(slotId);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      setFeedback({ type: 'success', msg: 'Slot removed.' });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 2500);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Cannot delete a booked slot.' });
    }
  };

  // Bulk Generator: Generates slots for the upcoming 7 days matching activeDays
  const handleBulkGenerate = async () => {
    try {
      setGeneratingBulk(true);
      setFeedback({ type: '', msg: '' });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      let createdCount = 0;

      // Generate for next 7 days
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + i);
        const dayStr = dayNames[targetDate.getDay()];

        if (activeDays[dayStr]) {
          const dateISO = targetDate.toISOString().split('T')[0];

          // Generate slots between shiftStart and shiftEnd
          const startHour = parseInt(shiftStart.split(':')[0]);
          const endHour = parseInt(shiftEnd.split(':')[0]);

          for (let h = startHour; h + slotDurationHours <= endHour; h += slotDurationHours) {
            const sTime = `${String(h).padStart(2, '0')}:00`;
            const eTime = `${String(h + slotDurationHours).padStart(2, '0')}:00`;

            try {
              const res = await createSlotApi({
                date: dateISO,
                startTime: sTime,
                endTime: eTime,
              });
              const newSlot = res.slot || res;
              setSlots((prev) => [...prev, newSlot]);
              createdCount++;
            } catch (ignore) {
              // Slot might already exist, continue
            }
          }
        }
      }

      setFeedback({
        type: 'success',
        msg: `Generated ${createdCount} new appointment slots across your working schedule!`,
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Could not complete slot generation.' });
    } finally {
      setGeneratingBulk(false);
    }
  };

  // Filter slots for the selected date
  const slotsForSelectedDate = slots.filter((s) => {
    const slotDateStr = new Date(s.date).toISOString().split('T')[0];
    return slotDateStr === selectedDate;
  });

  const bookedSlotsCount = slots.filter((s) => s.isBooked).length;
  const availableSlotsCount = slots.filter((s) => !s.isBooked).length;

  return (
    <div className="mx-auto max-w-[1180px] animate-fade-in space-y-6 pb-16">
      {/* Espresso header with master availability */}
      <Reveal>
        <section className="sh-dark-panel relative overflow-hidden rounded-xl">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-coral/20 blur-[100px]" />
          <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.1]" />
          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-coral">
                  Working hours & slots
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-on-dark-soft">
                  <CalendarIcon size={10} /> Live booking calendar
                </span>
              </div>

              <h1 className="mt-3 font-display text-[clamp(2.1rem,4.4vw,3rem)] leading-[1] tracking-[-0.035em] text-on-dark">
                Availability & appointment slots
              </h1>
              <p className="mt-3 text-[12px] leading-relaxed text-on-dark-soft">
                Publish the hours you can work and let customers book the moments that suit you
                both.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-md">
                <div className="text-right">
                  <span className="block text-[11px] font-medium text-on-dark">
                    {isAvailable ? 'Currently open' : 'Paused / offline'}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-on-dark-soft">
                    Master service status
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleMasterToggle}
                  disabled={togglingLive}
                  aria-pressed={isAvailable}
                  aria-label="Toggle master availability"
                  className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
                    isAvailable ? 'bg-coral' : 'bg-white/15',
                    togglingLive && 'opacity-60'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 block h-4 w-4 rounded-full bg-canvas shadow-xs transition-transform duration-300',
                      isAvailable ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              <button
                onClick={fetchAvailabilityData}
                title="Refresh availability"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-on-dark-soft backdrop-blur-md transition-colors hover:text-on-dark"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Feedback */}
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
            {feedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
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

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Available slots',
            value: availableSlotsCount,
            suffix: 'open',
            icon: CheckCircle2,
            tone: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
          },
          {
            label: 'Booked appointments',
            value: bookedSlotsCount,
            suffix: 'reserved',
            icon: Clock,
            tone: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
          },
          {
            label: 'Total published',
            value: slots.length,
            suffix: 'slots',
            icon: CalendarIcon,
            tone: 'border-primary/20 bg-primary/8 text-primary',
          },
        ].map(({ label, value, suffix, icon: Icon, tone }, index) => (
          <Reveal key={label} delay={0.04 + Math.min(index * 0.04, 0.1)}>
            <div className="flex h-full items-center gap-3.5 rounded-lg border border-hairline bg-card p-4">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                  tone
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
                    <AnimatedNumber value={value} />
                  </span>
                  <span className="text-[10px] text-muted-foreground">{suffix}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: schedule */}
        <div className="space-y-5 lg:col-span-5">
          <Reveal delay={0.08}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex items-start gap-3 border-b border-hairline px-5 py-4">
                <span className={cn(sectionIcon, 'text-accent-amber')}>
                  <Sparkles size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                    Weekly shift setup
                  </h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Generate recurring slots for the week ahead.
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className={labelClass}>Active working days</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Object.keys(activeDays).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveDays((prev) => ({ ...prev, [day]: !prev[day] }))}
                        className={cn(
                          'rounded-sm border py-2 text-[10px] font-medium transition-all',
                          activeDays[day]
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-hairline bg-canvas text-muted-foreground hover:border-ink/20 hover:text-ink'
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start shift</label>
                    <input
                      type="time"
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End shift</label>
                    <input
                      type="time"
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Slot duration</label>
                  <select
                    value={slotDurationHours}
                    onChange={(e) => setSlotDurationHours(parseInt(e.target.value))}
                    className={cn(fieldClass, 'cursor-pointer')}
                  >
                    <option value={1}>1 hour per appointment</option>
                    <option value={2}>2 hours per appointment</option>
                    <option value={3}>3 hours per appointment</option>
                  </select>
                </div>

                <button
                  onClick={handleBulkGenerate}
                  disabled={generatingBulk}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {generatingBulk ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Plus size={13} />
                  )}
                  {generatingBulk ? 'Generating slots…' : 'Publish weekly working slots'}
                </button>

                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Existing slots are skipped, so it’s safe to run this again when your week changes.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.12}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
                <span className={sectionIcon}>
                  <Plus size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                    Add a single slot
                  </h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Open a specific window outside your usual pattern.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-4 p-5">
                <div>
                  <label className={labelClass}>Appointment date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start (HH:MM)</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End (HH:MM)</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingSlot}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-hairline bg-canvas py-2.5 text-[11px] font-medium text-body transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {addingSlot ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Plus size={13} />
                  )}
                  {addingSlot ? 'Adding…' : 'Add slot'}
                </button>
              </form>
            </section>
          </Reveal>
        </div>

        {/* Right: slots for date */}
        <Reveal delay={0.1} className="lg:col-span-7">
          <section className="h-full overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="flex flex-col gap-3 border-b border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={cn(sectionIcon, 'text-accent-teal')}>
                  <CalendarIcon size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                    Slots on{' '}
                    {new Date(selectedDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {slotsForSelectedDate.length} slots configured for this date.
                  </p>
                </div>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 rounded-md border border-input bg-canvas px-2.5 text-[10px] text-ink outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </div>

            <div className="p-5">
              {slotsForSelectedDate.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                    <Clock size={22} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-3 text-[13px] font-medium text-ink">No slots for this date</h3>
                  <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                    Use the weekly generator or add a custom slot to open appointments for this
                    day.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {slotsForSelectedDate.map((slot) => {
                    const isBooked = slot.isBooked;
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-md border p-3.5 transition-all',
                          isBooked
                            ? 'border-accent-amber/25 bg-accent-amber/5'
                            : 'border-hairline bg-surface-soft/40 hover:border-accent-teal/30'
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[12px] font-medium tabular-nums text-ink">
                            <Clock
                              size={13}
                              className={isBooked ? 'text-accent-amber' : 'text-accent-teal'}
                            />
                            <span>
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </div>
                          <div className="text-[9px] font-medium uppercase tracking-[0.06em]">
                            {isBooked ? (
                              <span className="flex items-center gap-1.5 text-accent-amber">
                                <span className="h-1 w-1 rounded-full bg-accent-amber" />
                                Reserved by customer
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-accent-teal">
                                <span className="h-1 w-1 rounded-full bg-accent-teal" />
                                Available for booking
                              </span>
                            )}
                          </div>
                        </div>

                        {!isBooked && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
                            title="Delete slot"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-hairline bg-surface-soft/30 px-5 py-3">
              <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck size={11} className="text-accent-teal" />
                Reserved slots can’t be removed while a customer booking is active.
              </p>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
};
