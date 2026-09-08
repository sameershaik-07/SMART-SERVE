import React from 'react';
import { Heart } from 'lucide-react';
import { ServiceCard } from '../../components/service/ServiceCard';

export const FavoritesPage = () => {
  const favoriteServices = [
    {
      id: 101,
      title: 'AC Repair & Service',
      price: 599,
      rating: 4.8,
      reviewCount: 1256,
      providerName: 'CoolTech Services',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 102,
      title: 'Deep Cleaning',
      price: 999,
      rating: 4.7,
      reviewCount: 512,
      providerName: 'Cleanify Experts',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Favorites</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Your saved services and preferred professionals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};
