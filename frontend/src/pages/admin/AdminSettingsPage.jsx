import React, { useState } from 'react';
import {
  Settings,
  Percent,
  IndianRupee,
  ShieldCheck,
  Save,
  CheckCircle2,
  BellRing,
  Wallet,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-canvas px-3.5 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15';

const labelClass =
  'mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground';

const sectionIcon =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary';

const Toggle = ({ checked, onChange, label, description, icon: Icon }) => (
  <div className="flex items-start justify-between gap-4 py-3.5">
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-muted-foreground">
        <Icon size={14} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-ink">{label}</div>
        <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative mt-1 h-5 w-9 shrink-0 rounded-full transition-colors duration-300',
        checked ? 'bg-primary' : 'bg-surface-cream-strong'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 block h-4 w-4 rounded-full bg-canvas shadow-xs transition-transform duration-300',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
  </div>
);

export const AdminSettingsPage = () => {
  const [commission, setCommission] = useState('15');
  const [minPayout, setMinPayout] = useState('500');
  const [cancellationWindow, setCancellationWindow] = useState('24');
  const [supportEmail, setSupportEmail] = useState('support@servicehub.in');
  const [autoApprove, setAutoApprove] = useState(false);
  const [payoutAlerts, setPayoutAlerts] = useState(true);
  const [providerInsurance, setProviderInsurance] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const providerShare = Math.max(0, 100 - (parseFloat(commission) || 0));

  return (
    <div className="mx-auto max-w-[1040px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Governance</p>
            <span className="inline-flex items-center gap-1 rounded-pill border border-primary/20 bg-primary/6 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-primary">
              <ShieldCheck size={10} /> Admin only
            </span>
          </div>
          <h1 className="workspace-title mt-2">Platform settings</h1>
          <p className="workspace-subtitle">
            Commission, payout thresholds, and the operating policies that apply across
            ServiceHub.
          </p>
        </div>

        <span className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-2 text-[10px] font-medium text-muted-foreground">
          <Settings size={12} /> Global configuration
        </span>
      </Reveal>

      {/* Live summary strip */}
      <Reveal delay={0.04}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Platform commission',
              value: `${parseFloat(commission) || 0}%`,
              note: 'Taken from each completed booking.',
              icon: Percent,
              tone: 'text-primary',
            },
            {
              label: 'Provider share',
              value: `${providerShare}%`,
              note: 'Paid into the partner wallet.',
              icon: Wallet,
              tone: 'text-accent-teal',
            },
            {
              label: 'Minimum payout',
              value: `₹${Number(minPayout || 0).toLocaleString('en-IN')}`,
              note: 'Threshold for withdrawal requests.',
              icon: IndianRupee,
              tone: 'text-accent-amber',
            },
          ].map(({ label, value, note, icon: Icon, tone }) => (
            <div
              key={label}
              className="flex items-center gap-3.5 rounded-lg border border-hairline bg-card p-4"
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft',
                  tone
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 font-display text-[1.45rem] leading-none tracking-[-0.02em] text-ink">
                  {value}
                </div>
                <p className="mt-1 truncate text-[9px] text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {saved && (
        <div className="flex animate-fade-in items-center gap-2 rounded-md border border-accent-teal/25 bg-accent-teal/8 px-4 py-3 text-xs font-medium text-accent-teal">
          <CheckCircle2 size={14} /> Platform settings saved. New values apply to future bookings.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Commission & payouts */}
        <Reveal delay={0.08}>
          <section className="overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="flex items-start gap-3 border-b border-hairline px-5 py-4 sm:px-6">
              <span className={sectionIcon}>
                <Percent size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                  Commission & payouts
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  How revenue is split between ServiceHub and service partners.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2">
              <Input
                label="Platform commission rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.5"
                required
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                icon={Percent}
                className="[&_input]:h-10"
              />
              <Input
                label="Minimum payout threshold (₹)"
                type="number"
                min="0"
                step="50"
                required
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                icon={IndianRupee}
                className="[&_input]:h-10"
              />
            </div>

            <div className="border-t border-hairline-soft bg-surface-soft/30 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-body">Revenue split preview</span>
                <span className="tabular-nums text-muted-foreground">
                  {parseFloat(commission) || 0}% platform · {providerShare}% partner
                </span>
              </div>
              <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-pill bg-surface-cream-strong">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(parseFloat(commission) || 0, 100)}%` }}
                />
                <div className="h-full flex-1 bg-accent-teal/70" />
              </div>
            </div>
          </section>
        </Reveal>

        {/* Policies */}
        <Reveal delay={0.12}>
          <section className="overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="flex items-start gap-3 border-b border-hairline px-5 py-4 sm:px-6">
              <span className={cn(sectionIcon, 'text-accent-amber')}>
                <FileText size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                  Booking & support policies
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Customer-facing rules and the channel customers reach you on.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Free cancellation window (hours)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cancellationWindow}
                  onChange={(e) => setCancellationWindow(e.target.value)}
                  className={fieldClass}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Customers can cancel free of charge before this cutoff.
                </p>
              </div>

              <div>
                <label className={labelClass}>Support email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={fieldClass}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Shown on help pages and transactional emails.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Operating switches */}
        <Reveal delay={0.16}>
          <section className="overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="flex items-start gap-3 border-b border-hairline px-5 py-4 sm:px-6">
              <span className={cn(sectionIcon, 'text-accent-teal')}>
                <BellRing size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                  Operating switches
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Automation and protection controls for the marketplace.
                </p>
              </div>
            </div>

            <div className="divide-y divide-hairline-soft px-5 sm:px-6">
              <Toggle
                checked={autoApprove}
                onChange={setAutoApprove}
                icon={ShieldCheck}
                label="Auto-approve provider applications"
                description="Skip manual review when a provider passes all KYC checks automatically."
              />
              <Toggle
                checked={payoutAlerts}
                onChange={setPayoutAlerts}
                icon={BellRing}
                label="Payout failure alerts"
                description="Notify admins immediately when a settlement transfer is rejected."
              />
              <Toggle
                checked={providerInsurance}
                onChange={setProviderInsurance}
                icon={Wallet}
                label="Include provider damage cover"
                description="Apply the platform protection fee to every completed booking."
              />
            </div>
          </section>
        </Reveal>

        {/* Save bar */}
        <Reveal
          delay={0.2}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-card px-5 py-4"
        >
          <p className="flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
            <AlertCircle size={13} className="mt-0.5 shrink-0 text-accent-amber" />
            Changes apply to new bookings only. Existing settlements keep the rate they were charged
            at.
          </p>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98]"
          >
            <Save size={13} /> Save platform settings
          </button>
        </Reveal>
      </form>
    </div>
  );
};
