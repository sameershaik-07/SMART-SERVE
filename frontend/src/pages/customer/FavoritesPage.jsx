import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowUpRight } from 'lucide-react';
import { ServiceCard } from '../../components/service/ServiceCard';
import { useFavorites } from '@/context/FavoritesContext';
import { EmptyState } from '@/components/common/EmptyState';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/button';

export const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[1180px] animate-fade-in space-y-6 pb-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Kept close</p>
          <h1 className="workspace-title mt-2">Saved favourites</h1>
          <p className="workspace-subtitle">
            Services you’ve bookmarked, ready when you need them again.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <Heart size={11} className="fill-primary text-primary" />
          {favorites.length} saved
        </span>
      </Reveal>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any service to keep it here. Saved services are easy to find when you’re ready to book again."
          actionLabel="Browse services"
          onAction={() => navigate('/services')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed border-hairline px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-[11px] text-muted-foreground">
              Looking for something new? There’s a whole marketplace of verified professionals.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
              Explore services
              <ArrowUpRight size={13} className="ml-1.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
