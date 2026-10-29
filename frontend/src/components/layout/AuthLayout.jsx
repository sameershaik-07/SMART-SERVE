import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck2, Check, ShieldCheck, Star } from 'lucide-react';
import { BrandLockup } from '@/components/brand/BrandMark';
import { EASE } from '@/lib/motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="relative hidden overflow-hidden bg-surface-dark p-10 text-on-dark lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-primary/18 blur-[110px]" />
          <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-accent-teal/12 blur-[100px]" />
          <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.16]" />

          <div className="relative z-10">
            <BrandLockup size={36} inverted showTagline />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[460px] py-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-coral">
              A calmer way to book
            </p>
            <h1 className="mt-4 font-display text-[3.35rem] leading-[1.02] tracking-[-0.035em] text-on-dark">
              Good help makes home feel lighter.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-on-dark-soft">
              Verified local professionals, transparent pricing, and a booking experience that
              respects your time.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 22, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: -1.2 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              className="relative mt-10"
            >
              <div className="rounded-xl border border-white/12 bg-surface-dark-elevated p-5 shadow-[var(--shadow-dark)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/20 text-coral">
                      <CalendarCheck2 size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-dark">Deep home cleaning</p>
                      <p className="mt-0.5 text-[11px] text-on-dark-soft">Sat, 24 Oct · 10:00 AM</p>
                    </div>
                  </div>
                  <span className="rounded-pill bg-accent-teal/12 px-2.5 py-1 text-[10px] font-medium text-accent-teal">
                    Confirmed
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Verified pro', 'Upfront price', 'Guaranteed'].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-1.5 rounded-sm border border-white/8 bg-white/[0.03] px-2.5 py-2 text-[10px] text-on-dark-soft"
                    >
                      <Check size={11} className="text-accent-teal" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                  <div className="flex items-center gap-2 text-[11px] text-on-dark-soft">
                    <Star size={13} className="fill-accent-amber text-accent-amber" />
                    4.9 · 1,284 reviews
                  </div>
                  <span className="font-display text-xl text-on-dark">₹1,499</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
                className="absolute -bottom-7 -right-4 flex items-center gap-2.5 rounded-md border border-white/12 bg-coral px-3.5 py-2.5 text-ink shadow-[var(--shadow-dark)]"
              >
                <ShieldCheck size={16} />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em]">Verified network</p>
                  <p className="text-[10px] opacity-70">Every professional is checked</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/8 pt-5 text-[10px] uppercase tracking-[0.16em] text-on-dark-soft">
            <span>ServiceHub · 2026</span>
            <span>Trusted in 6 cities</span>
          </div>
        </aside>

        <main className="relative flex min-h-screen flex-col bg-canvas">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4 lg:hidden">
            <BrandLockup size={30} />
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Welcome</span>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
            <div className="w-full max-w-[420px]">
              <Outlet />
            </div>
          </div>

          <footer className="px-6 pb-6 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Safe booking · Verified professionals · Secure payments
          </footer>
        </main>
      </div>
    </div>
  );
};
