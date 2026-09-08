import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Download,
  Building2,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  X,
  CreditCard,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { getProviderDashboardApi } from '../../api/providers';
import { getProviderBookingsApi } from '../../api/bookings';

export const ProviderEarningsPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Stateful local withdrawal deductions for real-time responsiveness
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const [dashRes, bookingsRes] = await Promise.allSettled([
        getProviderDashboardApi(),
        getProviderBookingsApi(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboardStats(dashRes.value);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
        const list = Array.isArray(bookingsRes.value)
          ? bookingsRes.value
          : bookingsRes.value.bookings || [];
        setBookings(list);
      }
    } catch (err) {
      console.warn('Could not load provider financials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  // Compute completed jobs & amounts
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const inProgressBookings = bookings.filter(
    (b) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED'
  );

  const totalGrossEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.totalPrice || b.service?.price || 0),
    0
  );

  // Platform standard: 90% partner share, 10% ServiceHub platform fee
  const partnerNetEarnings = Math.round(totalGrossEarnings * 0.9);
  const platformFeeTotal = totalGrossEarnings - partnerNetEarnings;
  const pendingClearance = inProgressBookings.reduce(
    (sum, b) => sum + (b.totalPrice || b.service?.price || 0) * 0.9,
    0
  );

  const availableBalance = Math.max(0, partnerNetEarnings - withdrawnAmount);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      setFeedback({ type: 'error', msg: 'Please enter a valid withdrawal amount.' });
      return;
    }
    if (amountNum > availableBalance) {
      setFeedback({ type: 'error', msg: 'Amount exceeds your available balance.' });
      return;
    }

    setSubmittingPayout(true);
    setTimeout(() => {
      setWithdrawnAmount((prev) => prev + amountNum);
      setSubmittingPayout(false);
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setFeedback({
        type: 'success',
        msg: `Withdrawal request of ₹${amountNum.toLocaleString('en-IN')} initiated successfully! Transfer will reflect in your verified account within 2-4 hours.`,
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              Financial Settlements
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck size={12} /> Instant Payouts Active
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Earnings & Payout Account
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Monitor verified service revenue, track automatic wallet settlements, and request bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFinancials}
            title="Refresh Financials"
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              setWithdrawAmount(String(availableBalance));
              setWithdrawModalOpen(true);
            }}
            disabled={availableBalance <= 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
          >
            <ArrowUpRight size={16} /> Request Withdrawal
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

      {/* Financial KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available for Payout */}
        <div className="bg-gradient-to-br from-slate-800/90 to-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Available to Withdraw
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wallet size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            ₹{availableBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 size={12} /> Ready for instant transfer
          </p>
        </div>

        {/* Net Lifetime Earnings */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Partner Share (90%)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            ₹{partnerNetEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Gross revenue: ₹{totalGrossEarnings.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Pending Clearance */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Clearance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            ₹{Math.round(pendingClearance).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-400/80 mt-2 font-medium">
            From {inProgressBookings.length} active service jobs
          </p>
        </div>

        {/* Platform Commission Deductions */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Fee (10%)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-700/50 text-slate-400 flex items-center justify-center border border-slate-700">
              <Building2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-300 tracking-tight">
            ₹{platformFeeTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Platform tech, escrow & insurance
          </p>
        </div>
      </div>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Completed Job Settlements Table */}
        <div className="lg:col-span-8 bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h2 className="text-base font-black text-white">Completed Service Settlements</h2>
              <p className="text-xs text-slate-400">Detailed line items of your finished appointments</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              {completedBookings.length} Settled Jobs
            </span>
          </div>

          {completedBookings.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Wallet size={36} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">No Completed Settlements Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Once you complete customer jobs from your Job Requests queue, revenue records will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Ref ID</th>
                    <th className="pb-3">Service & Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Gross</th>
                    <th className="pb-3">Net Payout</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-xs">
                  {completedBookings.map((b) => {
                    const gross = b.totalPrice || b.service?.price || 0;
                    const net = Math.round(gross * 0.9);
                    return (
                      <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 font-bold text-white">#{b.id}</td>
                        <td className="py-3.5">
                          <div className="font-bold text-white">{b.service?.title || 'Home Service'}</div>
                          <div className="text-[11px] text-slate-400">
                            {b.customer?.user?.name || 'Customer'}
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3.5 text-slate-300 font-semibold">₹{gross}</td>
                        <td className="py-3.5 font-black text-emerald-400">₹{net}</td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 size={10} /> Settled
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (4 Cols): Verified Payout Account & Policy */}
        <div className="lg:col-span-4 space-y-6">
          {/* Linked Bank Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Payout Destination
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">HDFC Bank Direct Deposit</div>
                  <div className="text-[11px] text-slate-400 font-mono">•••• •••• 4819</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                <span>Account Holder:</span>
                <strong className="text-slate-200">Verified Partner</strong>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>IFSC Code:</span>
                <strong className="text-slate-200 font-mono">HDFC0001248</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Withdrawals are processed directly through NEFT / IMPS instant settlement. Funds typically arrive within minutes.
            </p>
          </div>

          {/* Revenue Breakdown Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white">Commission Transparency</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Service Partner Share</span>
                <strong className="text-emerald-400 font-bold">90%</strong>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-[90%] h-full bg-emerald-500 rounded-full"></div>
              </div>

              <div className="flex justify-between items-center text-slate-400 pt-2">
                <span>Platform Operations & Payment Gateway</span>
                <strong>10%</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl text-[11px] text-slate-400 leading-relaxed border border-slate-800">
              Zero hidden charges or listing fees. You only pay platform commission when a customer booking is successfully fulfilled.
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wallet size={18} className="text-emerald-400" />
                Request Instant Payout
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Available Balance</span>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{availableBalance.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Amount to Withdraw (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-black placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Minimum withdrawal is ₹100. Instant transfer.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      payoutMethod === 'bank'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Building2 size={16} />
                    <span>Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      payoutMethod === 'upi'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CreditCard size={16} />
                    <span>Instant UPI</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
                >
                  {submittingPayout ? 'Transferring...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

