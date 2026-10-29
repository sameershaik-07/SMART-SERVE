import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Check,
  X,
  Calendar,
  Briefcase,
  RefreshCw,
  AlertCircle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getAdminProvidersApi, verifyProviderApi, rejectProviderApi } from '../../api/admin';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadProviders = () => {
    setLoading(true);
    setError('');
    getAdminProvidersApi()
      .then((response) => setProviders(Array.isArray(response?.data) ? response.data : response || []))
      .catch((err) => setError(err.message || 'Unable to load providers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleVerify = async (id) => {
    setUpdatingId(id);
    try {
      await verifyProviderApi(id);
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, verified: true } : p)));
    } catch (e) {
      setError(e.message || 'Unable to verify this provider.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    setUpdatingId(id);
    try {
      await rejectProviderApi(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message || 'Unable to reject this provider.');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = providers.filter((p) => !p.verified).length;
  const verifiedCount = providers.filter((p) => p.verified).length;

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Verification & trust</p>
            <span className="inline-flex items-center gap-1 rounded-pill border border-primary/20 bg-primary/6 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-primary">
              <ShieldCheck size={10} /> Trust & safety
            </span>
          </div>
          <h1 className="workspace-title mt-2">Provider verification</h1>
          <p className="workspace-subtitle">
            Review real service provider accounts and approve the people customers will invite into
            their homes.
          </p>
        </div>

        <button
          onClick={loadProviders}
          className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3.5 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh queue
        </button>
      </Reveal>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total providers',
            value: providers.length,
            icon: UserCheck,
            tone: 'border-primary/20 bg-primary/8 text-primary',
          },
          {
            label: 'Awaiting review',
            value: pendingCount,
            icon: Clock,
            tone: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
          },
          {
            label: 'Verified',
            value: verifiedCount,
            icon: CheckCircle2,
            tone: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
          },
        ].map(({ label, value, icon: Icon, tone }, index) => (
          <Reveal key={label} delay={0.04 + Math.min(index * 0.04, 0.1)}>
            <div className="flex h-full items-center gap-3.5 rounded-lg border border-hairline bg-card p-4">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                  tone
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
                  <AnimatedNumber value={value} />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Provider list */}
      <Reveal delay={0.1}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                Applications
              </h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Verify identity, trade category, and listed services before approval.
              </p>
            </div>
            <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {pendingCount} pending
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-[11px] text-muted-foreground">Loading providers…</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                <UserCheck size={22} strokeWidth={1.7} />
              </span>
              <h3 className="mt-3 text-[13px] font-medium text-ink">No providers to review</h3>
              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                No provider accounts have been created yet. New applications will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hairline-soft">
              {providers.map((p, index) => {
                const status = p.verified ? 'VERIFIED' : 'PENDING';
                const joined = p.user?.createdAt
                  ? new Date(p.user.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Unknown date';
                const initial = (p.user?.name || 'P').charAt(0).toUpperCase();

                return (
                  <Reveal key={p.id} delay={Math.min(index * 0.03, 0.15)}>
                    <div className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-surface-soft/30 sm:px-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/8 font-display text-xl text-primary">
                          {initial}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-[13px] font-medium text-ink">
                              {p.user?.name || 'Unnamed provider'}
                            </h3>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em]',
                                status === 'VERIFIED'
                                  ? 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal'
                                  : 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber'
                              )}
                            >
                              {status === 'VERIFIED' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                              {status}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Briefcase size={11} className="text-primary" />
                              {p.category?.categoryName || 'Uncategorized'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={11} />
                              Joined {joined}
                            </span>
                            <span>
                              {p.services?.length || 0} service
                              {p.services?.length === 1 ? '' : 's'} listed
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-hairline-soft pt-3 md:border-t-0 md:pt-0">
                        {status === 'PENDING' ? (
                          <>
                            <Button
                              size="sm"
                              icon={Check}
                              disabled={updatingId === p.id}
                              onClick={() => handleVerify(p.id)}
                            >
                              {updatingId === p.id ? 'Saving…' : 'Verify'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={X}
                              disabled={updatingId === p.id}
                              onClick={() => handleReject(p.id)}
                              className="hover:border-destructive/30 hover:text-destructive"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-accent-teal">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
};
