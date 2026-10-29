import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';
import { getProviderByIdApi } from '../../api/providers';
import { ServiceCard } from '../../components/service/ServiceCard';
import { Button } from '../../components/common/Button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';

export const ProviderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getProviderByIdApi(id);
        const data = res?.data || res?.provider || res;
        if (data && isMounted) {
          const catName =
            typeof data.category === 'string'
              ? data.category
              : data.category?.name || 'General Services';
          setProvider({
            ...data,
            name: data.name || data.user?.name || 'Verified Provider',
            category: catName,
            location:
              typeof data.location === 'string'
                ? data.location
                : data.user?.address || 'Macherla, Andhra Pradesh',
            avatar:
              data.avatar ||
              data.user?.avatar ||
              'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
            bio: data.bio || 'Verified and certified professional service partner.',
            rating: Number(data.rating || 4.8),
            reviewCount: Number(data.reviewCount || 120),
            experience: data.experience || '5+ Years',
            jobsCompleted: data.jobsCompleted || '1,200+',
            services: Array.isArray(data.services) && data.services.length > 0 ? data.services : [],
          });
          return;
        }
      } catch (err) {
        console.warn('[ProviderDetailsPage] API fallback:', err);
      }

      if (isMounted) {
        setProvider(null);
        setLoading(false);
      }
    };

    fetchDetails().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const activeProvider = provider || null;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 pb-16">
        <div className="h-4 w-28 animate-pulse rounded bg-surface-soft" />
        <div className="h-64 animate-pulse rounded-lg border border-hairline bg-surface-soft" />
      </div>
    );
  }

  if (!activeProvider) {
    return (
      <div className="mx-auto max-w-3xl pb-16">
        <EmptyState
          icon={BadgeCheck}
          title="Provider unavailable"
          description="This professional’s profile isn’t available right now. Browse the network to find someone else."
          actionLabel="Browse providers"
          onAction={() => navigate('/providers')}
        />
      </div>
    );
  }

  const handleMessage = () => {
    const pName = activeProvider.name || 'Service Provider';
    const pAvatar = activeProvider.avatar || '';
    navigate(
      `/messages?providerId=${activeProvider.id}&name=${encodeURIComponent(pName)}&avatar=${encodeURIComponent(pAvatar)}`
    );
  };

  return (
    <div className="mx-auto max-w-[1120px] pb-16">
      <button
        onClick={() => navigate('/providers')}
        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to professionals
      </button>

      <div className="mt-4 overflow-hidden rounded-lg border border-hairline bg-card">
        <div className="relative h-32 bg-surface-dark sm:h-40">
          <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.18]" />
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-coral/20 blur-[80px]" />
          <div className="absolute bottom-4 left-5 flex items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur-md">
            <ShieldCheck size={11} className="text-accent-teal" /> Verified professional
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={activeProvider.avatar}
                alt={activeProvider.name}
                className="h-24 w-24 rounded-lg border-4 border-canvas object-cover shadow-[var(--shadow-soft)]"
              />
              <div className="pb-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] leading-none tracking-[-0.03em] text-ink">
                    {activeProvider.name}
                  </h1>
                  <BadgeCheck size={20} className="text-accent-teal" />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{activeProvider.category}</p>
              </div>
            </div>

            <Button onClick={handleMessage} icon={MessageSquare} size="sm">
              Send message
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Star size={13} className="fill-accent-amber text-accent-amber" />
              {activeProvider.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({activeProvider.reviewCount} reviews)
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-primary" /> {activeProvider.location}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-primary" /> Typically replies within an hour
            </span>
          </div>

          <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-body">{activeProvider.bio}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, label: 'Experience', value: activeProvider.experience || '5+ years' },
              { icon: CalendarDays, label: 'Jobs completed', value: activeProvider.jobsCompleted || '1,200+' },
              { icon: ShieldCheck, label: 'Verification', value: 'Verified pro' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-md border border-hairline bg-surface-soft/50 p-3.5 text-center">
                <Icon size={15} className="mx-auto text-primary" strokeWidth={1.7} />
                <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                <p className="mt-1 text-[13px] font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="sh-eyebrow">Work with this professional</p>
          <h2 className="mt-1.5 font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-ink">
            Offered services
          </h2>
        </div>
        <Badge variant="outline">{activeProvider.services?.length || 0} services</Badge>
      </div>

      {activeProvider.services && activeProvider.services.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeProvider.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No services listed yet"
          description="This professional hasn’t published services on ServiceHub. Send a message to ask about their work."
          actionLabel="Send a message"
          onAction={handleMessage}
        />
      )}

      <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-lg border border-hairline bg-surface-soft/50 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck size={16} />
          </div>
          <p className="max-w-[54ch] text-[11px] leading-relaxed text-muted-foreground">
            Every ServiceHub professional is identity checked, and every booking is covered by our
            service guarantee.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/services')} icon={ArrowUpRight} iconPosition="right">
          Browse all services
        </Button>
      </div>
    </div>
  );
};
