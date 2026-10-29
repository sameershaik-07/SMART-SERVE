import React from 'react';
import { Heart, Star, BadgeCheck, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils';

const fallbackImage =
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80';

export const ServiceCard = ({ service, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(service.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(service);
    if (onFavoriteToggle) onFavoriteToggle(service.id, !favorite);
  };

  const handleCardClick = () => {
    navigate(`/services/${service.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-hairline bg-card transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-surface-soft">
        <img
          src={service.image || service.images?.[0] || fallbackImage}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141413]/45 via-transparent to-transparent" />

        {service.category && (
          <span className="absolute bottom-3 left-3 rounded-pill border border-white/15 bg-[#141413]/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white backdrop-blur-md">
            {service.category}
          </span>
        )}

        <button
          onClick={handleFavoriteClick}
          aria-label={favorite ? 'Remove from favourites' : 'Save to favourites'}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#141413]/40 text-white/90 backdrop-blur-md transition-all hover:bg-[#141413]/65 hover:text-white"
        >
          <Heart size={14} className={cn(favorite && 'fill-coral text-coral')} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4.5">
        <div>
          <h3 className="font-display text-[1.3rem] leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-primary">
            {service.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5">
            <Star size={12} className="fill-accent-amber text-accent-amber" />
            <span className="text-xs font-medium tabular-nums text-ink">
              {Number(service.rating || 4.8).toFixed(1)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ({service.reviewCount || service.reviews?.length || 320})
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-hairline-soft pt-3">
            <span className="truncate text-[11px] text-muted-foreground">
              {service.providerName || service.provider?.user?.name || 'Verified professional'}
            </span>
            <BadgeCheck size={13} className="shrink-0 text-accent-teal" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">From</span>
            <p className="font-display text-[1.45rem] leading-none text-ink">
              ₹{Number(service.price || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/services/${service.id}`);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-canvas text-ink transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
            aria-label={`View ${service.title}`}
          >
            <ArrowUpRight size={15} strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </article>
  );
};
