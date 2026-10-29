import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Star,
  BadgeCheck,
  MapPin,
  MessageSquare,
  ArrowUpRight,
  X,
  Users,
} from 'lucide-react';
import { getProvidersApi } from '../../api/providers';
import {
  getProviders as cacheGetProviders,
  setProviders as cacheSetProviders,
  withOngoing as cacheWithOngoing,
} from '../../lib/pageCache';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/motion/Reveal';

const normalizeProvider = (p) => {
  const name = p.name || p.user?.name || 'Verified Technician';
  const category =
    typeof p.category === 'string'
      ? p.category
      : p.category?.name || p.categoryName || 'General Services';
  const location =
    typeof p.location === 'string'
      ? p.location
      : p.user?.address || 'Macherla, Andhra Pradesh';
  const avatar =
    p.avatar ||
    p.user?.avatar ||
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80';
  const bio =
    p.bio ||
    'Verified and certified professional service partner delivering reliable doorstep assistance.';
  const rating = Number(p.rating || 4.8);
  const reviewCount = Number(p.reviewCount || (p.reviews ? p.reviews.length : 120));
  const verified = p.verified !== undefined ? Boolean(p.verified) : true;

  return { ...p, id: p.id, name, category, location, avatar, bio, rating, reviewCount, verified };
};

export const ProvidersPage = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      try {
        const uid = user?.id || 'anon';
        const cached = cacheGetProviders(uid);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setProviders(cached.map(normalizeProvider));
          setLoading(false);

          cacheWithOngoing(`providers:${uid}`, async () => {
            try {
              const res = await getProvidersApi();
              const rawList = res?.data || res?.providers || (Array.isArray(res) ? res : []);
              cacheSetProviders(uid, rawList);
              if (!isMounted) return;
              setProviders(Array.isArray(rawList) ? rawList.map(normalizeProvider) : []);
            } catch (err) {
              console.warn('[ProvidersPage] background refresh failed:', err);
            }
          }).catch(() => {});

          return;
        }

        setLoading(true);
        const res = await getProvidersApi();
        const rawList = res?.data || res?.providers || (Array.isArray(res) ? res : []);
        cacheSetProviders(uid, rawList);

        if (isMounted) {
          setProviders(Array.isArray(rawList) ? rawList.map(normalizeProvider) : []);
        }
      } catch (err) {
        console.warn('[ProvidersPage] Providers API fallback:', err);
        if (isMounted) {
          setProviders([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartChat = (e, provider) => {
    e.stopPropagation();
    const providerName = provider.name || 'Service Partner';
    const providerAvatar = provider.avatar || '';
    navigate(
      `/messages?providerId=${provider.id}&name=${encodeURIComponent(providerName)}&avatar=${encodeURIComponent(providerAvatar)}`
    );
  };

  const searchLower = (search || '').trim().toLowerCase();
  const filteredProviders = providers.filter((p) => {
    if (!searchLower) return true;
    const nameMatch = p.name && p.name.toLowerCase().includes(searchLower);
    const categoryMatch = p.category && p.category.toLowerCase().includes(searchLower);
    const locationMatch = p.location && p.location.toLowerCase().includes(searchLower);
    const bioMatch = p.bio && p.bio.toLowerCase().includes(searchLower);
    return nameMatch || categoryMatch || locationMatch || bioMatch;
  });

  return (
    <div className="mx-auto max-w-[1120px] pb-16">
      <Reveal className="border-b border-hairline pb-6">
        <p className="sh-eyebrow">The people behind the work</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="workspace-title">Service professionals</h1>
            <p className="workspace-subtitle">
              Verified specialists with real reviews, clear specialties, and a direct line to you.
            </p>
          </div>
          <Badge variant="success" className="gap-1.5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
            {providers.length} verified partners
          </Badge>
        </div>
      </Reveal>

      <div className="mt-5 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or area…"
            className="h-11 w-full rounded-md border border-input bg-canvas pl-10 pr-10 text-sm text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xs p-1 text-muted-foreground transition-colors hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {search && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {filteredProviders.length} result{filteredProviders.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-52 animate-pulse rounded-lg border border-hairline bg-surface-soft" />
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <EmptyState
          icon={search ? Search : Users}
          title={search ? 'No one by that description' : 'No partners available'}
          description={
            search
              ? `No professionals match “${search}”. Try a specialty like cleaning, electrical, or tutoring.`
              : 'No verified service providers are available right now. Please check back shortly.'
          }
          actionLabel={search ? 'Clear search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredProviders.map((provider) => (
            <article
              key={provider.id}
              onClick={() => navigate(`/providers/${provider.id}`)}
              className="group flex cursor-pointer flex-col justify-between rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="h-16 w-16 rounded-lg border border-hairline object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-canvas bg-accent-teal text-white">
                    <BadgeCheck size={11} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-primary">
                      {provider.name}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{provider.category}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-ink">
                      <Star size={11} className="fill-accent-amber text-accent-amber" />
                      {provider.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>

              <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {provider.bio}
              </p>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline-soft pt-3">
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin size={12} className="shrink-0 text-primary" />
                  <span className="truncate">{provider.location}</span>
                </span>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleStartChat(e, provider)}
                    className="flex items-center gap-1.5 rounded-sm border border-hairline px-2.5 py-1.5 text-[10px] font-medium text-body transition-colors hover:border-ink/20 hover:bg-surface-soft hover:text-ink"
                  >
                    <MessageSquare size={11} /> Message
                  </button>
                  <span className="text-[10px] font-medium text-primary">View profile</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
