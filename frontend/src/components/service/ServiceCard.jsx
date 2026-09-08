import React, { useState } from 'react';
import { Heart, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServiceCard = ({ service, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) onFavoriteToggle(service.id, !isFavorite);
  };

  const handleCardClick = () => {
    navigate(`/services/${service.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="sh-card sh-card-hover overflow-hidden flex flex-col cursor-pointer bg-white border border-slate-100 group"
    >
      {/* Service Image Header */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
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
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-all shadow-md"
        >
          <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base group-hover:text-purple-700 transition-colors line-clamp-1">
            {service.title}
          </h3>

          {/* Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800">
              {service.rating || 4.8}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({service.reviewCount || service.reviews?.length || 320})
            </span>
          </div>

          {/* Provider Name + Verified Badge */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-semibold text-slate-600 truncate">
              {service.providerName || service.provider?.user?.name || 'CoolComfort Services'}
            </span>
            <CheckCircle2 size={14} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
          </div>
        </div>

        {/* Pricing & Book Now Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block leading-none">From</span>
            <span className="text-base font-extrabold text-slate-900">
              ₹{service.price}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/services/${service.id}`);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all hover:scale-105 active:scale-100"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
