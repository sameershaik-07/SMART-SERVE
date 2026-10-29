import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/common/Button';
import { BrandLockup } from '@/components/brand/BrandMark';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas font-sans text-ink">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-coral/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-accent-teal/8 blur-[110px]" />

      <header className="content-shell relative flex h-20 items-center justify-between border-b border-hairline">
        <BrandLockup size={32} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Error 404
        </span>
      </header>

      <main className="content-shell relative flex flex-1 items-center py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface-soft px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <Compass size={12} className="text-primary" />
              Off the map
            </div>
            <p className="mt-8 font-display text-[clamp(6rem,16vw,11rem)] leading-[0.8] tracking-[-0.06em] text-primary">
              404
            </p>
            <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.2rem,4.2vw,3.2rem)] leading-[1.04] tracking-[-0.03em] text-ink">
              This room doesn’t exist.
            </h1>
            <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
              The page you’re looking for may have moved, or the link could be a little out of
              date. Let’s get you back somewhere useful.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate('/')} icon={ArrowLeft}>
                Back to home
              </Button>
              <Button variant="outline" onClick={() => navigate('/services')}>
                Browse services
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="sh-dark-panel relative overflow-hidden rounded-2xl p-8">
              <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.14]" />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.18em] text-coral">While you’re here</p>
                <h2 className="mt-4 max-w-[16ch] font-display text-[2rem] leading-tight text-on-dark">
                  A few things worth knowing.
                </h2>
                <div className="mt-8 space-y-5">
                  {[
                    ['Verified professionals', 'Every specialist is identity checked and reviewed.'],
                    ['Upfront pricing', 'See the full price before you confirm a booking.'],
                    ['A real guarantee', 'If a job isn’t right, we’ll arrange a redo.'],
                  ].map(([title, copy]) => (
                    <div key={title} className="border-t border-white/8 pt-4">
                      <p className="text-[13px] font-medium text-on-dark">{title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-on-dark-soft">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="content-shell relative flex items-center justify-between border-t border-hairline py-6 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>ServiceHub · Home services, considered</span>
        <span>2026</span>
      </footer>
    </div>
  );
};
