import React, { useState } from 'react';
import { Lock, Bell, KeyRound, ShieldCheck, Mail, Smartphone, Tag } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { changePasswordApi } from '../../api/users';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const preferences = [
  {
    id: 'email',
    icon: Mail,
    title: 'Booking updates by email',
    copy: 'Confirmations, reminders, and receipts straight to your inbox.',
    defaultChecked: true,
  },
  {
    id: 'sms',
    icon: Smartphone,
    title: 'SMS & WhatsApp reminders',
    copy: 'A quiet nudge before your professional is due to arrive.',
    defaultChecked: true,
  },
  {
    id: 'promos',
    icon: Tag,
    title: 'Offers and seasonal updates',
    copy: 'Occasional news about new services and festive pricing.',
    defaultChecked: false,
  },
];

export const SettingsPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      await changePasswordApi({ oldPassword, newPassword });
      setMsg('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setMsg(err.message || 'Password update failed. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] animate-fade-in space-y-6 pb-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">How things reach you</p>
          <h1 className="workspace-title mt-2">Account settings</h1>
          <p className="workspace-subtitle">
            Manage your password and choose which updates are worth interrupting you for.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <ShieldCheck size={12} className="text-accent-teal" /> Security centre
        </span>
      </Reveal>

      {msg && (
        <div className="rounded-md border border-primary/20 bg-primary/6 px-4 py-3 text-xs font-medium text-primary">
          {msg}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Change password */}
        <Reveal delay={0.04}>
          <form
            onSubmit={handlePasswordChange}
            className="h-full rounded-lg border border-hairline bg-card"
          >
            <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary">
                <KeyRound size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-[13px] font-medium text-ink">Password</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Use something long and memorable.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <Input
                label="Current password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                icon={Lock}
                autoComplete="current-password"
                required
              />

              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                icon={Lock}
                autoComplete="new-password"
                required
              />

              <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  You’ll stay signed in on this device.
                </p>
                <Button type="submit" loading={loading} size="sm">
                  Update password
                </Button>
              </div>
            </div>
          </form>
        </Reveal>

        {/* Notifications */}
        <Reveal delay={0.08}>
          <div className="h-full rounded-lg border border-hairline bg-card">
            <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary">
                <Bell size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-[13px] font-medium text-ink">Notifications</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Choose what’s useful, leave the rest.
                </p>
              </div>
            </div>

            <div className="divide-y divide-hairline-soft">
              {preferences.map(({ id, icon: Icon, title, copy, defaultChecked }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-soft/40"
                >
                  <div className="flex items-start gap-3">
                    <Icon size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="block text-[12px] font-medium text-ink">{title}</span>
                      <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">
                        {copy}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                  />
                </label>
              ))}
            </div>

            <div className="border-t border-hairline px-5 py-3.5">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Booking-critical alerts are always sent, even if optional updates are off.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed border-hairline px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck size={13} className="text-accent-teal" />
          Your account is protected with encrypted credentials.
        </p>
        <span
          className={cn(
            'rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] text-muted-foreground'
          )}
        >
          Last reviewed today
        </span>
      </div>
    </div>
  );
};
