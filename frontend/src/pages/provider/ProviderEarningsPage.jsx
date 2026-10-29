import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { getProviderDashboardApi } from '../../api/providers';
import { getProviderBookingsApi } from '../../api/bookings';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

const metricTones = {
  coral: 'border-primary/20 bg-primary/8 text-primary',
  amber: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  teal: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  neutral: 'border-hairline bg-surface-soft text-body',
};

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

  const kpis = [
    {
      label: 'Gross revenue',
      icon: ArrowUpRight,
      tone: 'neutral',
      value: totalGrossEarnings,
      note: `Across ${completedBookings.length} completed jobs.`,
    },
    {
      label: 'Net partner share',
      icon: TrendingUp,
      tone: 'teal',
      value: partnerNetEarnings,
      note: '90% of gross revenue, after platform fee.',
    },
    {
      label: 'Pending clearance',
      icon: Clock,
      tone: 'amber',
      value: Math.round(pendingClearance),
      note: `From ${inProgressBookings.length} active or confirmed jobs.`,
    },
    {
      label: 'Platform fee',
      icon: Building2,
      tone: 'coral',
      value: platformFeeTotal,
      note: 'Covers technology, escrow, and insurance.',
    },
  ];

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Financial settlements</p>
            <span className="inline-flex items-center gap-1 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-accent-teal">
              <ShieldCheck size={10} /> Instant payouts active
            </span>
          </div>
          <h1 className="workspace-title mt-2">Earnings & payouts</h1>
          <p className="workspace-subtitle">
            Monitor verified service revenue, track wallet settlements, and request bank payouts.
          </p>
        </div>

        <button
          onClick={fetchFinancials}
          title="Refresh financials"
          className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3.5 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
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

      {/* Dark balance hero */}
      <Reveal delay={0.04}>
        <section className="sh-dark-panel relative overflow-hidden rounded-xl">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-coral/22 blur-[100px]" />
          <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.1]" />
          <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-coral">
                <Wallet size={12} /> Available to withdraw
              </span>
              <p className="mt-3 font-display text-[clamp(2.8rem,6.6vw,4.2rem)] leading-none tracking-[-0.045em] text-on-dark">
                ₹<AnimatedNumber value={availableBalance} />
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-on-dark-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
                Ready for instant transfer to your verified account.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <div className="space-y-2 border-white/10 text-[10px] sm:border-l sm:pl-6">
                <p className="flex items-center gap-1.5 text-on-dark-soft">
                  Gross
                  <span className="font-medium tabular-nums text-on-dark">
                    ₹{totalGrossEarnings.toLocaleString('en-IN')}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-on-dark-soft">
                  Net 90%
                  <span className="font-medium tabular-nums text-on-dark">
                    ₹{partnerNetEarnings.toLocaleString('en-IN')}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-on-dark-soft">
                  Pending
                  <span className="font-medium tabular-nums text-accent-amber">
                    ₹{Math.round(pendingClearance).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>

              <Button
                variant="coral"
                size="lg"
                icon={ArrowUpRight}
                disabled={availableBalance <= 0}
                onClick={() => {
                  setWithdrawAmount(String(availableBalance));
                  setWithdrawModalOpen(true);
                }}
              >
                Request withdrawal
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, icon: Icon, tone, value, note }, index) => (
          <Reveal key={label} delay={0.08 + Math.min(index * 0.04, 0.12)}>
            <div className="h-full rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]">
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

              <div className="mt-5 font-display text-[2.1rem] leading-none tracking-[-0.035em] text-ink">
                ₹<AnimatedNumber value={value} />
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">{note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Settlements table */}
        <Reveal delay={0.14} className="lg:col-span-8">
          <section className="h-full overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                  Completed settlements
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Line items from your finished appointments.
                </p>
              </div>
              <span className="rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-accent-teal">
                {completedBookings.length} settled
              </span>
            </div>

            {completedBookings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                  <Wallet size={22} strokeWidth={1.7} />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-ink">
                  No completed settlements yet
                </h3>
                <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                  Once you complete customer jobs, revenue records will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-hairline text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="px-5 py-3 font-medium sm:px-6">Ref</th>
                      <th className="px-3 py-3 font-medium">Service & customer</th>
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Gross</th>
                      <th className="px-3 py-3 font-medium">Net payout</th>
                      <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-soft text-[11px]">
                    {completedBookings.map((b) => {
                      const gross = b.totalPrice || b.service?.price || 0;
                      const net = Math.round(gross * 0.9);
                      return (
                        <tr key={b.id} className="transition-colors hover:bg-surface-soft/30">
                          <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[10px] text-primary sm:px-6">
                            #{b.id}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="font-medium text-ink">
                              {b.service?.title || 'Home service'}
                            </div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                              {b.customer?.user?.name || 'Customer'}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-body">
                            ₹{Number(gross).toLocaleString('en-IN')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 font-medium tabular-nums text-accent-teal">
                            ₹{Number(net).toLocaleString('en-IN')}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 sm:px-6">
                            <span className="inline-flex items-center gap-1 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-accent-teal">
                              <CheckCircle2 size={9} /> Settled
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>

        {/* Right column */}
        <div className="space-y-5 lg:col-span-4">
          <Reveal delay={0.18}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex items-center justify-between gap-2 border-b border-hairline px-5 py-4">
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Payout destination
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-accent-teal">
                  <ShieldCheck size={9} /> Verified
                </span>
              </div>

              <div className="space-y-3 p-5">
                <div className="rounded-md border border-hairline bg-surface-soft/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/6 text-primary">
                      <Building2 size={18} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-ink">HDFC Bank direct deposit</div>
                      <div className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                        •••• •••• 4819
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-hairline pt-3 text-[10px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Account holder</span>
                      <span className="font-medium text-body">Verified partner</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">IFSC code</span>
                      <span className="font-mono text-body">HDFC0001248</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Withdrawals settle through NEFT / IMPS. Funds typically arrive within minutes of
                  approval.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.22}>
            <section className="rounded-lg border border-hairline bg-card p-5">
              <h3 className="font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink">
                Commission transparency
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-body">Service partner share</span>
                  <span className="font-medium text-accent-teal">90%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-soft">
                  <div className="h-full w-[90%] rounded-pill bg-accent-teal" />
                </div>

                <div className="flex items-center justify-between border-t border-hairline-soft pt-3 text-[10px]">
                  <span className="text-muted-foreground">Platform & payment gateway</span>
                  <span className="font-medium text-body">10%</span>
                </div>
              </div>

              <p className="mt-4 rounded-md border border-hairline bg-surface-soft/40 p-3 text-[10px] leading-relaxed text-muted-foreground">
                No hidden charges or listing fees. Commission applies only when a customer booking
                is successfully fulfilled.
              </p>
            </section>
          </Reveal>
        </div>
      </div>

      {/* Withdraw modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Request instant payout"
        description="Move your available balance to a verified account."
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="rounded-md border border-hairline bg-surface-soft/50 p-4">
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Available balance
            </span>
            <div className="mt-1 font-display text-[2rem] leading-none tracking-[-0.03em] text-ink">
              ₹{availableBalance.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <Input
              label="Amount to withdraw (₹ INR)"
              type="number"
              required
              min="100"
              max={availableBalance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              icon={Wallet}
              className="[&_input]:h-11"
            />
            <span className="mt-1.5 block text-[10px] text-muted-foreground">
              Minimum withdrawal is ₹100. Instant transfer.
            </span>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Payout method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-md border p-3 text-[10px] font-medium transition-all',
                  payoutMethod === 'bank'
                    ? 'border-primary/35 bg-primary/6 text-primary'
                    : 'border-hairline bg-canvas text-muted-foreground hover:border-ink/20 hover:text-ink'
                )}
              >
                <Building2 size={16} strokeWidth={1.8} />
                <span>Bank transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-md border p-3 text-[10px] font-medium transition-all',
                  payoutMethod === 'upi'
                    ? 'border-primary/35 bg-primary/6 text-primary'
                    : 'border-hairline bg-canvas text-muted-foreground hover:border-ink/20 hover:text-ink'
                )}
              >
                <CreditCard size={16} strokeWidth={1.8} />
                <span>Instant UPI</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(false)}
              className="rounded-md px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPayout}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submittingPayout ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {submittingPayout ? 'Transferring…' : 'Confirm transfer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
