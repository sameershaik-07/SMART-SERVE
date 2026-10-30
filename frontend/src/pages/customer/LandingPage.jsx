import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck2,
  Check,
  ChevronRight,
  CreditCard,
  Hammer,
  Leaf,
  Menu,
  Paintbrush,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BrandLockup, BrandMark } from '@/components/brand/BrandMark';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { TiltCard } from '@/components/motion/TiltCard';
import { Marquee } from '@/components/motion/Marquee';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { EASE } from '@/lib/motion';

const categories = [
  { label: 'Home cleaning', icon: Sparkles },
  { label: 'Electrical', icon: Zap },
  { label: 'Plumbing', icon: Wrench },
  { label: 'Painting', icon: Paintbrush },
  { label: 'Carpentry', icon: Hammer },
  { label: 'Garden care', icon: Leaf },
];

const steps = [
  {
    number: '01',
    title: 'Describe the job',
    copy: 'Tell us what needs doing. Pick a service, share a few details, and choose a time that suits your day.',
  },
  {
    number: '02',
    title: 'Meet your professional',
    copy: 'We match you with a verified local specialist. See their work, ratings, and upfront price before you book.',
  },
  {
    number: '03',
    title: 'Relax, it’s handled',
    copy: 'Track the visit, pay securely through ServiceHub, and know every job is backed by our service guarantee.',
  },
];

const assurances = [
  { icon: ShieldCheck, title: 'Every pro verified', copy: 'Identity checks, skill review, and ongoing quality monitoring.' },
  { icon: CreditCard, title: 'Upfront pricing', copy: 'The price you see is the price you pay. No surprises at the door.' },
  { icon: CalendarCheck2, title: 'Book in minutes', copy: 'Real availability, instant confirmation, and easy rescheduling.' },
  { icon: BadgeCheck, title: 'Backed by a guarantee', copy: 'If something isn’t right, we’ll make it right. That’s the promise.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas font-sans text-ink">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-hairline/80 bg-canvas/85 backdrop-blur-xl">
        <div className="content-shell flex h-[72px] items-center justify-between gap-4">
          <Link to="/" aria-label="ServiceHub home" className="flex items-center">
            <BrandLockup size={32} />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {['How it works', 'Services', 'For professionals'].map((label, index) => (
              <a
                key={label}
                href={['#how-it-works', '#services', '#providers'][index]}
                className="text-[13px] font-medium text-body transition-colors hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button onClick={() => navigate('/register')} icon={ArrowRight} iconPosition="right" className="hidden sm:inline-flex">
              Get started
            </Button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-hairline bg-card text-ink transition-colors hover:border-ink/20 md:hidden"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="border-t border-hairline bg-canvas md:hidden"
          >
            <nav className="content-shell flex flex-col py-3">
              {['How it works', 'Services', 'For professionals'].map((label, index) => (
                <a
                  key={label}
                  href={['#how-it-works', '#services', '#providers'][index]}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-hairline-soft py-3 text-sm font-medium text-body last:border-0 hover:text-ink"
                >
                  {label}
                  <ChevronRight size={14} className="text-muted-foreground" />
                </a>
              ))}
              <div className="flex items-center gap-2 pt-4 pb-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign in
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Create account
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main>
        {/* -------------------------------------------------------------- */}
        {/* Hero                                                           */}
        {/* -------------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-40 top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-coral/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-32 top-24 h-[26rem] w-[26rem] rounded-full bg-accent-teal/8 blur-[110px]" />
          <div className="content-shell relative grid items-center gap-14 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-24">
            <div>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface-soft/70 py-1.5 pl-2 pr-3.5"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles size={11} strokeWidth={2} />
                </span>
                <span className="text-[11px] font-medium tracking-[0.02em] text-body">
                  Trusted by 12,000+ households
                </span>
              </motion.div>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.06 }}
                className="mt-6 max-w-[15ch] font-display text-[clamp(3.4rem,7.4vw,5.4rem)] font-normal leading-[0.98] tracking-[-0.04em] text-ink"
              >
                Your home,
                <br />
                in good <em className="font-normal italic text-primary">hands.</em>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
                className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground sm:text-base"
              >
                Book verified local professionals for the things that need doing — cleaning,
                repairs, painting, and more. Considered pricing, calm scheduling, work you can
                trust.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.24 }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Button size="lg" onClick={() => navigate('/register')} icon={ArrowRight} iconPosition="right">
                  Book a service
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-hairline pt-6"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['#cc785c', '#3f8c7e', '#9a6a24'].map((color) => (
                      <span
                        key={color}
                        className="h-7 w-7 rounded-full border-2 border-canvas"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] leading-tight text-muted-foreground">
                    <span className="block font-medium text-ink">4.9 average rating</span>
                    from verified bookings
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] leading-tight text-muted-foreground">
                  <Star size={15} className="fill-accent-amber text-accent-amber" />
                  <span>
                    <span className="block font-medium text-ink">Background checked</span>
                    every professional
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Product vignette */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30, rotate: 1.4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.18 }}
              className="relative mx-auto w-full max-w-[460px]"
            >
              <TiltCard strength={5} className="group">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-dark p-6 text-on-dark shadow-[var(--shadow-dark)] sm:p-7">
                  <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-coral/22 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-on-dark-soft">
                        <BrandMark size={18} className="text-coral" />
                        Upcoming visit
                      </div>
                      <span className="rounded-pill border border-accent-teal/25 bg-accent-teal/10 px-2.5 py-1 text-[10px] font-medium text-accent-teal">
                        Confirmed
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-[1.9rem] leading-tight text-on-dark">
                      Deep home cleaning
                    </h3>
                    <p className="mt-1 text-xs text-on-dark-soft">2 bedroom apartment · 3 hours</p>

                    <div className="mt-6 flex items-center justify-between rounded-md border border-white/8 bg-white/[0.035] p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/20 text-sm font-medium text-coral">
                          AK
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-on-dark">Ananya K.</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-on-dark-soft">
                            <Star size={10} className="fill-accent-amber text-accent-amber" />
                            4.9 · 214 cleans
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] text-accent-teal">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
                        Verified
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                      {[
                        ['Date', 'Sat, 24 Oct'],
                        ['Arrival', '10:00 AM'],
                        ['Total', '₹1,499'],
                      ].map(([label, value], index) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <span className="text-on-dark-soft">{label}</span>
                          <span className={index === 2 ? 'font-display text-lg text-on-dark' : 'font-medium text-on-dark'}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
                  className="absolute -bottom-6 -left-4 flex items-center gap-2.5 rounded-md border border-hairline bg-canvas px-3.5 py-2.5 shadow-[var(--shadow-soft)] sm:-left-8"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-teal/12 text-accent-teal">
                    <Check size={15} strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium text-ink">Payment protected</p>
                    <p className="text-[10px] text-muted-foreground">Released after the visit</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1, ease: EASE }}
                  className="absolute -right-3 top-1/2 hidden rounded-md border border-hairline bg-canvas px-3 py-2 shadow-[var(--shadow-soft)] sm:block"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">On the way</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-ink">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
                    12 min away
                  </p>
                </motion.div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Category marquee                                               */}
        {/* -------------------------------------------------------------- */}
        <section className="border-y border-hairline bg-surface-soft/50 py-4">
          <Marquee speed={36}>
            {categories.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex items-center gap-2.5 px-5 text-[12px] font-medium tracking-[0.01em] text-body"
              >
                <Icon size={15} strokeWidth={1.6} className="text-primary" />
                {label}
                <span className="ml-3 h-1 w-1 rounded-full bg-hairline" />
              </span>
            ))}
            <span className="flex items-center gap-2.5 px-5 text-[12px] font-medium text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-hairline" />
              6 cities · 10,000+ bookings
            </span>
          </Marquee>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* How it works                                                   */}
        {/* -------------------------------------------------------------- */}
        <section id="how-it-works" className="section-pad">
          <div className="content-shell">
            <Reveal className="max-w-2xl">
              <p className="sh-eyebrow">A calmer way to book</p>
              <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1.03] tracking-[-0.03em] text-ink">
                Good help, without the runaround.
              </h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                Three quiet steps between you and a job well done. No calls, no haggling, no
                waiting around.
              </p>
            </Reveal>

            <Stagger className="mt-12 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3">
              {steps.map((step) => (
                <StaggerItem
                  key={step.number}
                  className="group relative bg-canvas p-7 transition-colors hover:bg-surface-soft/60 lg:p-9"
                >
                  <span className="font-mono text-[11px] tracking-[0.08em] text-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-8 font-display text-[1.7rem] leading-tight tracking-[-0.02em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    {step.copy}
                  </p>
                  <ArrowUpRight
                    size={16}
                    className="absolute right-7 top-7 text-hairline transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Services                                                       */}
        {/* -------------------------------------------------------------- */}
        <section id="services" className="border-t border-hairline bg-surface-soft/40">
          <div className="content-shell section-pad">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <p className="sh-eyebrow">What we look after</p>
                <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2.4rem,4.2vw,3.2rem)] leading-[1.04] tracking-[-0.03em] text-ink">
                  The whole house, considered.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <Button variant="outline" onClick={() => navigate('/login')} icon={ArrowUpRight} iconPosition="right">
                  Explore all services
                </Button>
              </Reveal>
            </div>

            <Stagger fast className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Home cleaning', copy: 'Deep cleans, regular upkeep, and move-out resets.', icon: Sparkles, meta: 'From ₹699' },
                { title: 'Electrical', copy: 'Faults, fittings, fans, and safety checks.', icon: Zap, meta: 'From ₹349' },
                { title: 'Plumbing', copy: 'Leaks, blockages, taps, and bathroom fixes.', icon: Wrench, meta: 'From ₹399' },
                { title: 'Painting', copy: 'A fresh coat, done carefully and cleanly.', icon: Paintbrush, meta: 'From ₹1,899' },
                { title: 'Carpentry', copy: 'Furniture repair, assembly, and custom work.', icon: Hammer, meta: 'From ₹499' },
                { title: 'Garden care', copy: 'Pruning, planting, and seasonal tidy-ups.', icon: Leaf, meta: 'From ₹599' },
              ].map(({ title, copy, icon: Icon, meta }) => (
                <StaggerItem key={title}>
                  <Link
                    to="/login"
                    className="group flex h-full flex-col justify-between rounded-lg border border-hairline bg-canvas p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary">
                          <Icon size={18} strokeWidth={1.6} />
                        </span>
                        <ArrowUpRight
                          size={16}
                          className="text-hairline transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        />
                      </div>
                      <h3 className="mt-6 text-[15px] font-medium tracking-[-0.01em] text-ink">{title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
                    </div>
                    <p className="mt-6 border-t border-hairline-soft pt-3 text-[11px] font-medium tracking-[0.04em] text-body">
                      {meta}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Assurance                                                      */}
        {/* -------------------------------------------------------------- */}
        <section className="section-pad">
          <div className="content-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <p className="sh-eyebrow">Why ServiceHub</p>
              <h2 className="mt-3 max-w-[14ch] font-display text-[clamp(2.4rem,4.4vw,3.4rem)] leading-[1.03] tracking-[-0.03em] text-ink">
                Care you can measure.
              </h2>
              <p className="mt-5 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
                We built ServiceHub around the details that make a service visit feel easy — clear
                prices, real people, and a guarantee that means something.
              </p>
              <div className="mt-9 flex items-center gap-6 border-t border-hairline pt-6">
                <div>
                  <p className="font-display text-3xl text-ink">
                    <AnimatedNumber value={12} suffix="k+" />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Happy homes
                  </p>
                </div>
                <div className="h-10 w-px bg-hairline" />
                <div>
                  <p className="font-display text-3xl text-ink">
                    <AnimatedNumber value={4.9} decimals={1} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Average rating
                  </p>
                </div>
                <div className="h-10 w-px bg-hairline" />
                <div>
                  <p className="font-display text-3xl text-ink">
                    <AnimatedNumber value={98} suffix="%" />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    On-time visits
                  </p>
                </div>
              </div>
            </Reveal>

            <Stagger className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
              {assurances.map(({ icon: Icon, title, copy }) => (
                <StaggerItem key={title} className="bg-canvas p-7">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface-soft text-primary">
                    <Icon size={16} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-5 text-[14px] font-medium text-ink">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Testimonial                                                    */}
        {/* -------------------------------------------------------------- */}
        <section className="border-y border-hairline bg-surface-soft/50">
          <div className="content-shell py-16 md:py-20">
            <Reveal className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Star size={16} className="fill-primary" />
              </div>
              <blockquote className="mt-6 font-display text-[clamp(1.7rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.025em] text-ink">
                “The whole thing felt considered. A real person, a fair price, and a clean kitchen
                when I got home. I’ve already booked again.”
              </blockquote>
              <div className="mt-7 flex items-center justify-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/20 text-xs font-medium text-primary">
                  MR
                </span>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-ink">Meera R.</p>
                  <p className="text-[11px] text-muted-foreground">Bengaluru · Deep cleaning</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Provider dark panel                                            */}
        {/* -------------------------------------------------------------- */}
        <section id="providers" className="section-pad">
          <div className="content-shell">
            <Reveal>
              <div className="sh-dark-panel relative overflow-hidden rounded-2xl px-6 py-12 sm:px-10 md:px-14 md:py-16">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-coral/20 blur-[100px]" />
                <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
                <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-coral">
                      For professionals
                    </p>
                    <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(2.4rem,4.4vw,3.4rem)] leading-[1.03] tracking-[-0.03em] text-on-dark">
                      Good work deserves a good home.
                    </h2>
                    <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-on-dark-soft">
                      Join a network that respects your craft. Set your availability, receive
                      matched job requests, and get paid reliably.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button variant="coral" onClick={() => navigate('/register?role=provider')} icon={ArrowRight} iconPosition="right">
                        Join as a professional
                      </Button>
                      <Button
                        variant="dark"
                        onClick={() => navigate('/login?role=provider')}
                        className="border-white/15 bg-white/[0.04] text-on-dark hover:bg-white/10"
                      >
                        Provider sign in
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Reliable payouts', 'Weekly, on time'],
                      ['Real demand', 'Jobs matched to you'],
                      ['Simple tools', 'One calm dashboard'],
                      ['Fair standards', 'No race to the bottom'],
                    ].map(([title, copy]) => (
                      <div
                        key={title}
                        className="rounded-md border border-white/10 bg-white/[0.035] p-4"
                      >
                        <p className="text-[12px] font-medium text-on-dark">{title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-on-dark-soft">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Final CTA                                                      */}
        {/* -------------------------------------------------------------- */}
        <section className="border-t border-hairline">
          <div className="content-shell flex flex-col items-center py-20 text-center md:py-28">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface-soft px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Take the weight off
              </span>
              <h2 className="mx-auto mt-6 max-w-[18ch] font-display text-[clamp(2.8rem,6vw,4.6rem)] leading-[0.99] tracking-[-0.04em] text-ink">
                One less thing to think about.
              </h2>
              <p className="mx-auto mt-5 max-w-[46ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                Create your account in a minute. Book your first service today, and let a
                professional take it from there.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button size="lg" onClick={() => navigate('/register')} icon={ArrowRight} iconPosition="right">
                  Get started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  I already have an account
                </Button>
              </div>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck size={13} className="text-accent-teal" />
                No subscription. Pay only for the services you book.
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-hairline bg-surface-soft/40">
        <div className="content-shell py-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <BrandLockup size={30} showTagline />
              <p className="mt-4 max-w-[34ch] text-[12px] leading-relaxed text-muted-foreground">
                Considered home services from verified local professionals. Available across six
                cities, with more on the way.
              </p>
            </div>
            {[
              { heading: 'ServiceHub', links: ['How it works', 'Services', 'For professionals', 'Cities'] },
              { heading: 'Support', links: ['Help centre', 'Contact us', 'Service guarantee', 'Safety'] },
              { heading: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {heading}
                </p>
                <ul className="mt-3.5 space-y-2.5">
                  {links.map((label) => (
                    <li key={label}>
                      <button
                        onClick={() => navigate('/login')}
                        className="text-[12px] text-body transition-colors hover:text-primary"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
            <p>© 2026 ServiceHub. Made for homes and the people in them.</p>
            <p className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-accent-teal" />
                Verified network
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard size={12} className="text-primary" />
                Secure payments
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
