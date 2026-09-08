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
  Sun,
  Moon,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  getMySlotsApi,
  createSlotApi,
  deleteSlotApi
} from '../../api/availability';
import { getProviderDashboardApi, updateProviderProfileApi } from '../../api/providers';

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
      setFeedback({ type: 'success', msg: `Slot added for ${selectedDate} (${startTime} - ${endTime})!` });
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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header & Master Availability */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              Working Hours & Slots
            </span>
            <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              <CalendarIcon size={12} /> Live Booking Calendar
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Availability & Appointment Slots
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Configure your operating schedule and publish time slots so customers can book you easily.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white">
                {isAvailable ? 'Currently Open' : 'Paused / Offline'}
              </span>
              <span className="text-[10px] text-slate-400">Master Service Status</span>
            </div>
            <button
              onClick={handleMasterToggle}
              disabled={togglingLive}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${
                  isAvailable ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={fetchAvailabilityData}
            title="Refresh"
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
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
          <button onClick={() => setFeedback({ type: '', msg: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Available Slots</div>
            <div className="text-xl font-black text-emerald-400">{availableSlotsCount} Open</div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Booked Appointments</div>
            <div className="text-xl font-black text-purple-300">{bookedSlotsCount} Reserved</div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <CalendarIcon size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Total Published</div>
            <div className="text-xl font-black text-white">{slots.length} Slots</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Recurring Schedule & Bulk Slot Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Schedule Generator Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Weekly Shift Setup</h3>
                <p className="text-[11px] text-slate-400">Generate recurring slots for the week ahead</p>
              </div>
            </div>

            {/* Days of Week Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Active Working Days
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {Object.keys(activeDays).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setActiveDays((prev) => ({ ...prev, [day]: !prev[day] }))
                    }
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeDays[day]
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900/80 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Range & Slot Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Start Shift
                </label>
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  End Shift
                </label>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Slot Duration
              </label>
              <select
                value={slotDurationHours}
                onChange={(e) => setSlotDurationHours(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Hour per appointment</option>
                <option value={2}>2 Hours per appointment</option>
                <option value={3}>3 Hours per appointment</option>
              </select>
            </div>

            <button
              onClick={handleBulkGenerate}
              disabled={generatingBulk}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <Plus size={16} />
              {generatingBulk ? 'Generating Slots...' : 'Publish Weekly Working Slots'}
            </button>
          </div>

          {/* Quick Single Slot Add Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-400" />
              Add Custom Single Slot
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Start (HH:MM)
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    End (HH:MM)
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addingSlot}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {addingSlot ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (7 Cols): Active Slots for Selected Date */}
        <div className="lg:col-span-7 bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <CalendarIcon size={18} className="text-emerald-400" />
                Slots on {new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {slotsForSelectedDate.length} total slots configured for this date
              </p>
            </div>

            {/* Date Selector input */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Slot Cards List */}
          {slotsForSelectedDate.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Clock size={36} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">No Slots for this Date</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Use the generator on the left or add a custom slot to open appointments for this day.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slotsForSelectedDate.map((slot) => {
                const isBooked = slot.isBooked;
                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isBooked
                        ? 'bg-purple-950/20 border-purple-500/40 text-purple-200'
                        : 'bg-slate-900/80 border-slate-700/80 text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-black text-sm">
                        <Clock size={14} className={isBooked ? 'text-purple-400' : 'text-emerald-400'} />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold">
                        {isBooked ? (
                          <span className="text-purple-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                            Reserved by Customer
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Available for Booking
                          </span>
                        )}
                      </div>
                    </div>

                    {!isBooked && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                        title="Delete Slot"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

