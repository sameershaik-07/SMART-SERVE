import React, { useState } from 'react';
import { Headphones, Mail, Phone, ChevronDown, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

export const HelpSupportPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How do I cancel or reschedule a booking?',
      a: 'You can cancel or reschedule any booking under “My bookings” before the provider starts heading to your location. Changes are free up to 24 hours before the visit.',
    },
    {
      q: 'What payment options are accepted?',
      a: 'ServiceHub supports Razorpay UPI, debit and credit cards, net banking, and instant one-click ServiceHub wallet balance.',
    },
    {
      q: 'Are all service providers background checked?',
      a: 'Yes. Every professional undergoes identity verification, a background check, and a skill evaluation before joining ServiceHub.',
    },
    {
      q: 'What if I’m not happy with the work?',
      a: 'Every booking is covered by our service guarantee. Tell us within 30 days and we’ll arrange a redo or a fair resolution.',
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] animate-fade-in space-y-6 pb-16">
      <Reveal className="border-b border-hairline pb-6">
        <p className="sh-eyebrow">A real person, when you need one</p>
        <h1 className="workspace-title mt-2">Help & support</h1>
        <p className="workspace-subtitle">
          Answers to the common questions, plus a direct line to the team behind ServiceHub.
        </p>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        <Reveal delay={0.04}>
          <a
            href="tel:1800123"
            className="group flex h-full items-center gap-4 rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/6 text-primary">
              <Phone size={20} strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Toll-free helpline
              </span>
              <span className="mt-1 block font-display text-[1.45rem] leading-none text-ink transition-colors group-hover:text-primary">
                1800-123-SERVICE
              </span>
              <span className="mt-1.5 block text-[10px] text-muted-foreground">
                Every day, 8 am – 10 pm
              </span>
            </div>
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <a
            href="mailto:support@servicehub.com"
            className="group flex h-full items-center gap-4 rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-body">
              <Mail size={20} strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Email support
              </span>
              <span className="mt-1 block truncate font-display text-[1.45rem] leading-none text-ink transition-colors group-hover:text-primary">
                support@servicehub.com
              </span>
              <span className="mt-1.5 block text-[10px] text-muted-foreground">
                We reply within one working day
              </span>
            </div>
          </a>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <div className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary">
                <Headphones size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-display text-[1.5rem] leading-tight text-ink">
                  Frequently asked
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  The things people ask us most.
                </p>
              </div>
            </div>
            <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              {faqs.length} questions
            </span>
          </div>

          <div className="divide-y divide-hairline-soft">
            {faqs.map((faq, idx) => {
              const open = openIndex === idx;
              return (
                <div key={faq.q}>
                  <button
                    onClick={() => setOpenIndex(open ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-soft/40 sm:px-6"
                    aria-expanded={open}
                  >
                    <span
                      className={cn(
                        'text-[12.5px] leading-snug transition-colors',
                        open ? 'font-medium text-ink' : 'text-body'
                      )}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={15}
                      className={cn(
                        'shrink-0 text-muted-foreground transition-transform duration-300',
                        open && 'rotate-180 text-primary'
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]',
                      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-[12px] leading-relaxed text-muted-foreground sm:px-6">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.16}>
        <div className="sh-dark-panel relative overflow-hidden rounded-xl px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-coral/20 blur-[90px]" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-coral">
                <MessageSquare size={12} /> Still stuck?
              </p>
              <h2 className="mt-3 max-w-[24ch] font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-on-dark">
                Tell us what’s happening. We’ll take it from there.
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-on-dark-soft">
                <ShieldCheck size={12} className="text-accent-teal" /> Every conversation is handled
                by a real support specialist.
              </p>
            </div>
            <Button
              variant="coral"
              onClick={() => (window.location.href = 'mailto:support@servicehub.com')}
            >
              Contact support
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
