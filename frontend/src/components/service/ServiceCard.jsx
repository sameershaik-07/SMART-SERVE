import React from 'react';
import { Heart, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';

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
    <div
      onClick={handleCardClick}
      className="sh-card sh-card-hover overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Service Image Header */}
      <div className="relative h-40 w-full bg-muted overflow-hidden">
        <img
          src={service.image || service.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category Badge */}
        {service.category && (
          <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
            service.category.toLowerCase() === 'beauty' || service.category.toLowerCase() === 'salon'
              ? 'bg-pink-50/95 text-pink-700 border-pink-200'
              : service.category.toLowerCase() === 'repairs' || service.category.toLowerCase() === 'repair'
              ? 'bg-amber-50/95 text-amber-700 border-amber-200'
              : service.category.toLowerCase() === 'home services' || service.category.toLowerCase() === 'home cleaning'
              ? 'bg-blue-50/95 text-blue-700 border-blue-200'
              : service.category.toLowerCase() === 'automotive'
              ? 'bg-cyan-50/95 text-cyan-700 border-cyan-200'
              : service.category.toLowerCase() === 'tutors' || service.category.toLowerCase() === 'tutoring'
              ? 'bg-violet-50/95 text-violet-700 border-violet-200'
              : 'bg-slate-100/95 text-slate-600 border-slate-200'
          }`}>
            {service.category}
          </span>
        )}
        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/95 backdrop-blur-xs flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-all shadow-sm"
        >
          <Heart size={16} className={favorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-foreground text-sm group-hover:text-muted-foreground transition-colors line-clamp-1">
            {service.title}
          </h3>

          {/* Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-foreground">
              {service.rating || 4.8}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ({service.reviewCount || service.reviews?.length || 320})
            </span>
          </div>

          {/* Provider Name + Verified Badge */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {service.providerName || service.provider?.user?.name || 'Verified Service Provider'}
            </span>
            <CheckCircle2 size={14} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
          </div>
        </div>

        {/* Pricing & Book Now Button */}
        <div className="pt-2 border-t border-border">
          <div className="mb-2 flex items-end gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">From</span>
            <span className="text-base leading-none font-extrabold text-foreground">₹{service.price}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/services/${service.id}`);
            }}
            className="h-10 w-full whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[.98]"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
