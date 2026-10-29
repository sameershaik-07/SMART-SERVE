import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Navigation,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const typeStyles = {
  success: {
    icon: CheckCircle2,
    wrap: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  },
  info: {
    icon: Navigation,
    wrap: 'border-primary/20 bg-primary/6 text-primary',
  },
  promo: {
    icon: Sparkles,
    wrap: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  },
};

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const notifications = [
    {
      id: 1,
      title: 'Booking confirmed',
      message:
        'Your AC Repair & Service booking with CoolTech Services has been accepted for 10:30 AM.',
      time: '10 mins ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'Technician en route',
      message: 'Cleanify Experts technician Ramesh is on the way to your address.',
      time: '2 hours ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'A festive discount, if you need it',
      message: 'Get 20% off on all Beauty & Home Cleaning services this weekend.',
      time: '1 day ago',
      type: 'promo',
    },
  ];

  return (
    <div className="mx-auto max-w-[860px] animate-fade-in space-y-6 pb-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Keep in the loop</p>
          <h1 className="workspace-title mt-2">Notifications</h1>
          <p className="workspace-subtitle">
            Booking updates, arrival notices, and the occasional useful offer.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <Bell size={11} className="text-primary" />
          {notifications.length} updates
        </span>
      </Reveal>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All quiet"
          description="New booking updates and messages will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, index) => {
            const style = typeStyles[n.type] || typeStyles.info;
            const Icon = style.icon;
            return (
              <Reveal key={n.id} delay={Math.min(index * 0.05, 0.15)}>
                <article className="group flex items-start gap-4 rounded-lg border border-hairline bg-card p-4 transition-all duration-300 hover:border-ink/15 hover:shadow-[var(--shadow-soft)] sm:p-5">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                      style.wrap
                    )}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-[13px] font-medium text-ink">{n.title}</h2>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {n.time}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                      {n.message}
                    </p>
                    <button
                      onClick={() => navigate('/bookings')}
                      className="mt-3 flex items-center gap-1 text-[10px] font-medium text-primary transition-colors hover:text-primary-active"
                    >
                      View booking <ArrowUpRight size={11} />
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-2 rounded-md border border-dashed border-hairline px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Prefer fewer updates? Fine-tune what reaches you in settings.
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
        >
          Notification settings <ArrowUpRight size={10} />
        </button>
      </div>
    </div>
  );
};
