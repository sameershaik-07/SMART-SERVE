import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, CheckCircle2, MapPin, MessageSquare, ArrowRight, RefreshCw, X } from 'lucide-react';
import { getProvidersApi } from '../../api/providers';

const mockProviders = [];

// Robust normalizer for provider objects from any source (DB Prisma or Mock)
const normalizeProvider = (p) => {
  const name = p.name || p.user?.name || 'Verified Technician';
  const category = 
    typeof p.category === 'string' 
      ? p.category 
      : (p.category?.name || p.categoryName || 'General Services');
  const location = 
    typeof p.location === 'string' 
      ? p.location 
      : (p.user?.address || 'Macherla, Andhra Pradesh');
  const avatar = 
    p.avatar || p.user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80';
  const bio = p.bio || 'Verified and certified professional service partner delivering reliable doorstep assistance.';
  const rating = Number(p.rating || 4.8);
  const reviewCount = Number(p.reviewCount || (p.reviews ? p.reviews.length : 120));
  const verified = p.verified !== undefined ? Boolean(p.verified) : true;

  return {
    ...p,
    id: p.id,
    name,
    category,
    location,
    avatar,
    bio,
    rating,
    reviewCount,
    verified,
  };
};

export const ProvidersPage = () => {
  const [providers, setProviders] = useState(() => mockProviders.map(normalizeProvider));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await getProvidersApi();
        const rawList = res?.data || res?.providers || (Array.isArray(res) ? res : []);
        
        if (isMounted) {
          if (Array.isArray(rawList) && rawList.length > 0) {
            setProviders(rawList.map(normalizeProvider));
          } else {
            setProviders(mockProviders.map(normalizeProvider));
          }
        }
      } catch (err) {
        console.warn('[ProvidersPage] Providers API fallback:', err);
        if (isMounted) {
          setProviders(mockProviders.map(normalizeProvider));
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
    navigate(`/messages?providerId=${provider.id}&name=${encodeURIComponent(providerName)}&avatar=${encodeURIComponent(providerAvatar)}`);
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
    <div className="space-y-6 animate-fade-in pb-16 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified Service Providers</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Explore top-rated professionals, view verified profiles, and start direct consultations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl">
          <CheckCircle2 size={15} className="text-purple-600" />
          <span>{providers.length} Verified Partners</span>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by provider name, specialty, or area..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-sm focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="sh-card p-5 bg-white space-y-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-8 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Provider Cards Grid */}
      {!loading && filteredProviders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => navigate(`/providers/${provider.id}`)}
              className="sh-card p-5 bg-white hover:border-purple-200 cursor-pointer flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                      {provider.name}
                    </h3>
                    {provider.verified && (
                      <CheckCircle2 size={16} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 inline-block mt-1">
                    {provider.category}
                  </span>
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star size={14} className="fill-amber-400" /> {provider.rating}
                    </span>
                    <span>({provider.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{provider.bio}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-slate-500 font-semibold truncate max-w-[180px]">
                  <MapPin size={14} className="text-purple-600 shrink-0" />
                  <span className="truncate">{provider.location}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleStartChat(e, provider)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-purple-200 cursor-pointer active:scale-95"
                  >
                    <MessageSquare size={13} /> Message
                  </button>
                  <span className="font-bold text-purple-600 group-hover:underline flex items-center gap-0.5">
                    Details <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Search Result State */}
      {!loading && filteredProviders.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No providers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No service providers match your search for "{search}". Try searching by category like "AC", "Cleaning", or "Electrician".
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      )}
    </div>
  );
};
