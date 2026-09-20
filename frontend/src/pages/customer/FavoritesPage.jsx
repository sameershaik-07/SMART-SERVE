import React from 'react';
import { Heart } from 'lucide-react';
import { ServiceCard } from '../../components/service/ServiceCard';
import { useFavorites } from '@/context/FavoritesContext';

export const FavoritesPage = () => {
  const { favorites } = useFavorites();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="workspace-title">Saved Favorites</h1>
        <p className="workspace-subtitle">Your saved services and preferred professionals.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="sh-card py-16 text-center">
          <Heart size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-bold text-foreground">No saved services yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on a service to save it here.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      )}
    </div>
  );
};
