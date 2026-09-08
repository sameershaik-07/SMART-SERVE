import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle2, MapPin, Award, Phone, Mail, ShieldCheck, MessageSquare } from 'lucide-react';
import { getProviderByIdApi } from '../../api/providers';
import { ServiceCard } from '../../components/service/ServiceCard';
import { Button } from '../../components/common/Button';

const mockProviders = [];

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
          const catName = typeof data.category === 'string' ? data.category : (data.category?.name || 'General Services');
          setProvider({
            ...data,
            name: data.name || data.user?.name || 'Verified Provider',
            category: catName,
            location: typeof data.location === 'string' ? data.location : (data.user?.address || 'Macherla, Andhra Pradesh'),
            avatar: data.avatar || data.user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
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
        console.warn('[ProviderDetailsPage] API fallback to mock provider:', err);
      }

      if (isMounted) {
        const found = null || null;
        setProvider(found);
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

  if (!activeProvider) return <div className="p-8 text-center text-slate-500 mt-10">Provider not found or currently unavailable.</div>;
  const handleMessage = () => {
    const pName = activeProvider.name || 'Service Provider';
    const pAvatar = activeProvider.avatar || '';
    navigate(`/messages?providerId=${activeProvider.id}&name=${encodeURIComponent(pName)}&avatar=${encodeURIComponent(pAvatar)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-16">
      <button
        onClick={() => navigate('/providers')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Providers
      </button>

      {/* Hero Header Card */}
      <div className="sh-card p-6 bg-white space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={activeProvider.avatar}
              alt={activeProvider.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-purple-100 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{activeProvider.name}</h1>
                <CheckCircle2 size={20} className="text-blue-500 fill-blue-500 stroke-white" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 inline-block mt-1">
                {activeProvider.category}
              </span>
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star size={16} className="fill-amber-400" /> {activeProvider.rating} ({activeProvider.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-purple-600" /> {activeProvider.location}
                </span>
              </div>
            </div>
          </div>

          <Button onClick={handleMessage} variant="primary" icon={MessageSquare}>
            Send Message
          </Button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">{activeProvider.bio}</p>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 text-center">
            <span className="text-xs text-slate-400 font-medium block">Experience</span>
            <span className="text-base font-extrabold text-purple-900">{activeProvider.experience || '5+ Years'}</span>
          </div>
          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 text-center">
            <span className="text-xs text-slate-400 font-medium block">Jobs Completed</span>
            <span className="text-base font-extrabold text-purple-900">{activeProvider.jobsCompleted || '1,200+'}</span>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs text-slate-400 font-medium block">Verification</span>
            <span className="text-base font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <ShieldCheck size={16} /> Verified Pro
            </span>
          </div>
        </div>
      </div>

      {/* Offered Services */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Offered Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(activeProvider.services || []).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};
